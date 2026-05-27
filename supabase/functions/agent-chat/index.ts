import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type IoField = { name: string; type?: string; required?: boolean; desc?: string; default?: any; values?: string[] };

function ioToJsonSchema(fields: IoField[] = []) {
  const props: Record<string, any> = {};
  const required: string[] = [];
  for (const f of fields) {
    const t = f.type || "string";
    let p: any = { description: f.desc || f.name };
    if (t === "number") p.type = "number";
    else if (t === "boolean") p.type = "boolean";
    else if (t === "enum") { p.type = "string"; if (f.values?.length) p.enum = f.values; }
    else p.type = "string";
    props[f.name] = p;
    if (f.required) required.push(f.name);
  }
  return {
    type: "object",
    properties: props,
    required,
    additionalProperties: false,
  };
}

function safeToolName(wfId: string, title: string) {
  const slug = (title || "wf").replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30) || "wf";
  return `wf_${slug}_${wfId.replace(/-/g, "").slice(0, 8)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const raw = await req.text();
    let body: any = {};
    if (raw.trim()) { try { body = JSON.parse(raw); } catch {} }
    const { conversationId, message } = body as { conversationId: string; message: string };
    if (!conversationId || !message?.trim()) {
      return new Response(JSON.stringify({ error: "缺少 conversationId 或 message" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Load conversation & enabled workflows
    const { data: conv } = await admin.from("agent_conversations").select("*").eq("id", conversationId).eq("user_id", userId).single();
    if (!conv) {
      return new Response(JSON.stringify({ error: "会话不存在" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const enabledIds: string[] = conv.enabled_workflows || [];
    let workflowsForTools: any[] = [];
    if (enabledIds.length) {
      const { data: wfs } = await admin.from("workflows").select("*").in("id", enabledIds);
      workflowsForTools = wfs || [];
    }

    // Build OpenAI-style tools
    const toolMap: Record<string, any> = {};
    const tools = workflowsForTools.map((wf: any) => {
      const io = wf.graph?.io_schema || { input: [], output: [] };
      const name = safeToolName(wf.id, wf.title);
      toolMap[name] = wf;
      return {
        type: "function",
        function: {
          name,
          description: `[工作流] ${wf.title}${wf.description ? " — " + wf.description : ""}`,
          parameters: ioToJsonSchema(io.input || []),
        },
      };
    });

    // Save user message
    await admin.from("agent_messages").insert({
      conversation_id: conversationId, user_id: userId, role: "user", content: message,
    });

    // Load full history
    const { data: history } = await admin.from("agent_messages")
      .select("role, content, tool_calls, tool_results")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    const messages: any[] = [
      {
        role: "system",
        content: (conv.system_prompt?.trim()
            ? conv.system_prompt + "\n\n"
            : `你是 HoloPracticum 智能助手，可以调用用户已发布的工作流来完成任务。\n`) +
          `当前可用工作流（${tools.length} 个）：${tools.map((t) => t.function.name + ":" + t.function.description.slice(0, 50)).join("; ") || "无"}。\n` +
          `规则：\n- 当用户请求匹配某个工作流时，**直接调用对应工具**，不要让用户自己点。\n- 工具的参数严格按 schema 提供；缺少必填字段时主动向用户追问。\n- 工具返回后，用中文 Markdown 总结结果，并附建议下一步。\n- 没有合适工具时，直接用自身知识回答。`,
      },
    ];

    for (const m of history || []) {
      if (m.role === "user" || (m.role === "assistant" && !m.tool_calls)) {
        messages.push({ role: m.role, content: m.content || "" });
      } else if (m.role === "assistant" && m.tool_calls) {
        messages.push({ role: "assistant", content: m.content || "", tool_calls: m.tool_calls });
      } else if (m.role === "tool") {
        const tr: any = m.tool_results;
        messages.push({ role: "tool", tool_call_id: tr?.tool_call_id || "", content: typeof tr?.content === "string" ? tr.content : JSON.stringify(tr?.content ?? "") });
      }
    }

    // Tool-call loop
    const MAX_ROUNDS = 5;
    let finalAssistant = "";
    const allToolEvents: any[] = [];

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const payload: any = {
        model: conv.model || "google/gemini-2.5-flash",
        messages,
      };
      if (tools.length) {
        payload.tools = tools;
        payload.tool_choice = "auto";
      }

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!aiRes.ok) {
        const t = await aiRes.text();
        if (aiRes.status === 429) return new Response(JSON.stringify({ error: "AI 请求过于频繁，请稍后再试" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI 额度已用尽，请到工作区充值" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "AI 调用失败", details: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const aiJson = await aiRes.json();
      const msg = aiJson.choices?.[0]?.message;
      if (!msg) break;

      // No tool call → final answer
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        finalAssistant = msg.content || "";
        messages.push({ role: "assistant", content: finalAssistant });
        await admin.from("agent_messages").insert({
          conversation_id: conversationId, user_id: userId, role: "assistant", content: finalAssistant,
        });
        break;
      }

      // Save assistant message with tool calls
      messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });
      await admin.from("agent_messages").insert({
        conversation_id: conversationId, user_id: userId, role: "assistant",
        content: msg.content || "",
        tool_calls: msg.tool_calls,
      });

      // Execute each tool call
      for (const tc of msg.tool_calls) {
        const fname = tc.function?.name;
        let args: any = {};
        try { args = JSON.parse(tc.function?.arguments || "{}"); } catch {}
        const wf = toolMap[fname];
        let resultContent: any;
        let runId: string | null = null;

        if (!wf) {
          resultContent = { error: `未知工具 ${fname}` };
        } else {
          try {
            // Call run-workflow with structured inputs
            const runResp = await fetch(`${SUPABASE_URL}/functions/v1/run-workflow`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                graph: wf.graph,
                inputs: args,
                input: typeof args === "object" ? JSON.stringify(args) : String(args),
                workflowName: wf.title,
                workflowId: wf.id,
                userId,
              }),
            });
            const runData = await runResp.json();

            // Persist workflow run
            const { data: runRow } = await admin.from("workflow_runs").insert({
              user_id: userId,
              workflow_id: wf.id,
              workflow_name: wf.title,
              status: runData.status || "failed",
              input: args,
              output: runData.outputs || (runData.output ? { result: runData.output } : null),
              steps: runData.steps || [],
              error: runData.error || null,
              duration_ms: runData.duration_ms || 0,
            }).select("id").single();
            runId = runRow?.id || null;
            resultContent = {
              status: runData.status,
              outputs: runData.outputs || { result: runData.output },
              error: runData.error,
              steps_count: runData.steps?.length || 0,
            };
          } catch (e) {
            resultContent = { error: String((e as Error).message) };
          }
        }

        const toolMsg = {
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(resultContent),
        };
        messages.push(toolMsg);
        await admin.from("agent_messages").insert({
          conversation_id: conversationId, user_id: userId, role: "tool",
          content: JSON.stringify(resultContent),
          tool_results: { tool_call_id: tc.id, function_name: fname, content: resultContent },
          workflow_run_id: runId,
        });
        allToolEvents.push({ name: fname, args, result: resultContent, run_id: runId });
      }
    }

    // Touch conversation
    await admin.from("agent_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return new Response(JSON.stringify({
      assistant: finalAssistant,
      tool_events: allToolEvents,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});