import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const systemPrompts: Record<string, string> = {
  contract: "你是资深企业法务顾问。请仔细审查用户提供的合同内容，按风险等级（高/中/低）列出问题条款，给出具体修改建议，并标注法律依据。使用中文 Markdown 格式，含小标题、列表与引用。",
  dev: "你是资深全栈工程师。请基于用户需求生成可运行的代码示例（首选 TypeScript / Python），包含 API 设计、数据结构、关键实现和测试建议。使用 Markdown 代码块，并附简要架构说明。",
  content: "你是顶级内容营销策划。请为用户主题生成 3 个版本的文案（小红书、微博、公众号），每条带标题、正文、标签建议，注意平台调性与字数限制。中文 Markdown。",
  data: "你是资深数据分析师。请基于用户描述的数据问题，给出分析思路、关键指标、可视化建议与潜在结论。使用 Markdown 列表与表格。",
  workflow: "你是流程自动化专家。请将用户需求拆解为可执行的工作流步骤，每步包含目标、输入、输出、所需工具。使用 Markdown 编号列表。",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user via anon client + caller token
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { task_id } = await req.json();
    if (!task_id || typeof task_id !== "string") {
      return new Response(JSON.stringify({ error: "task_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client (bypass RLS but we check user_id)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: task, error: taskErr } = await admin
      .from("tasks").select("*").eq("id", task_id).eq("user_id", userId).single();
    if (taskErr || !task) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("tasks").update({ status: "running" }).eq("id", task_id);

    const started = Date.now();
    const model = "google/gemini-2.5-flash";
    const system = systemPrompts[task.type] ?? "你是专业的 AI 助手，请用中文 Markdown 详细回答用户的请求。";
    const prompt = `${task.title}\n\n${task.input_summary ?? ""}`.trim();

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      const duration = Date.now() - started;
      await admin.from("task_runs").insert({
        task_id, user_id: userId, status: "failed",
        prompt, error: `${aiRes.status}: ${errText}`,
        model, duration_ms: duration,
      });
      await admin.from("tasks").update({ status: "failed" }).eq("id", task_id);

      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "AI 请求过于频繁，请稍后再试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度已用尽，请到工作区充值" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI 调用失败", details: errText }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const output: string = aiJson.choices?.[0]?.message?.content ?? "";
    const tokens = aiJson.usage?.total_tokens ?? null;
    const duration = Date.now() - started;

    await admin.from("task_runs").insert({
      task_id, user_id: userId, status: "completed",
      prompt, output, model, tokens_used: tokens, duration_ms: duration,
    });

    await admin.from("tasks").update({
      status: "completed",
      result: output.slice(0, 500),
    }).eq("id", task_id);

    return new Response(JSON.stringify({ output, tokens, duration_ms: duration }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("run-task error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});