import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  labor: "劳动合同",
  service: "服务协议",
  nda: "保密协议",
  purchase: "采购合同",
  lease: "租赁合同",
  other: "通用合同",
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

    const body = await req.json().catch(() => ({}));
    const {
      text,
      file_name,
      contract_type = "other",
      attachment_id = null,
    } = body as {
      text?: string;
      file_name?: string;
      contract_type?: string;
      attachment_id?: string | null;
    };

    if (!text || typeof text !== "string" || text.trim().length < 30) {
      return new Response(JSON.stringify({ error: "合同文本过短或为空" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (text.length > 120_000) {
      return new Response(JSON.stringify({ error: "合同文本过长，请截取关键章节" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const typeLabel = CONTRACT_TYPE_LABELS[contract_type] ?? "通用合同";
    const system = `你是资深企业法务顾问，擅长中国法下的合同审查。请基于用户提供的"${typeLabel}"全文，逐条识别风险条款。要求：
- 严格区分高/中/低风险（high/medium/low）
- 高风险：违反强制法、显失公平、可能导致条款无效或重大损失
- 中风险：表述不严谨、缺关键约定、可能引发争议
- 低风险：建议优化的细节性问题
- 每条风险包含：clause(原条款编号或简称)、issue(问题描述)、suggestion(具体修改建议)、basis(法律依据，若适用)
- 合规评分 score: 0-100 整数，无重大风险=85+，有 1 个高风险=60-75，多个高风险=<60
- summary：3-5 句话的总体评价
必须通过提供的工具调用返回结构化数据，不要使用自然语言回复。`;

    const tool = {
      type: "function",
      function: {
        name: "submit_review",
        description: "提交合同审查的结构化结果",
        parameters: {
          type: "object",
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string" },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  level: { type: "string", enum: ["high", "medium", "low"] },
                  clause: { type: "string" },
                  issue: { type: "string" },
                  suggestion: { type: "string" },
                  basis: { type: "string" },
                },
                required: ["level", "clause", "issue", "suggestion"],
                additionalProperties: false,
              },
            },
          },
          required: ["score", "summary", "risks"],
          additionalProperties: false,
        },
      },
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `合同类型：${typeLabel}\n文件名：${file_name ?? "未命名"}\n\n合同全文：\n${text}` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "submit_review" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
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
    const call = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: { score?: number; summary?: string; risks?: unknown[] } = {};
    try {
      parsed = JSON.parse(call?.function?.arguments ?? "{}");
    } catch (_) {
      return new Response(JSON.stringify({ error: "AI 返回结果解析失败" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const risks = Array.isArray(parsed.risks) ? parsed.risks : [];
    const score = typeof parsed.score === "number" ? parsed.score : null;
    const summary = typeof parsed.summary === "string" ? parsed.summary : "";

    const { data: inserted, error: insErr } = await admin
      .from("contract_reviews")
      .insert({
        user_id: userId,
        attachment_id,
        file_name: file_name ?? "未命名合同",
        contract_type,
        score,
        summary,
        risks,
        raw_text: text.slice(0, 80_000),
        status: "completed",
      })
      .select("*")
      .single();

    if (insErr) {
      return new Response(JSON.stringify({ error: "保存失败", details: insErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ review: inserted }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-contract error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});