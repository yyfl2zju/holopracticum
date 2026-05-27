import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const STYLE_LABELS: Record<string, string> = {
  professional: "专业正式",
  casual: "轻松活泼",
  creative: "创意新潮",
  provocative: "犀利吸睛",
};

const PLATFORM_LABELS: Record<string, { label: string; maxLen: number }> = {
  wechat: { label: "微信公众号", maxLen: 2500 },
  xiaohongshu: { label: "小红书", maxLen: 1000 },
  douyin: { label: "抖音/短视频", maxLen: 300 },
  weibo: { label: "微博", maxLen: 140 },
  zhihu: { label: "知乎", maxLen: 3000 },
  linkedin: { label: "LinkedIn", maxLen: 1500 },
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

    const rawBody = await req.text();
    let body: any = {};
    if (rawBody && rawBody.trim().length > 0) {
      try { body = JSON.parse(rawBody); } catch { body = {}; }
    }
    const { topic, style = "professional", platforms = ["wechat", "xiaohongshu"] } = body as {
      topic?: string; style?: string; platforms?: string[];
    };

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return new Response(JSON.stringify({ error: "请输入有效的主题（至少 3 个字）" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const validPlatforms = platforms.filter((p) => PLATFORM_LABELS[p]);
    if (validPlatforms.length === 0) validPlatforms.push("wechat");

    const styleLabel = STYLE_LABELS[style] ?? "专业正式";
    const platformDescription = validPlatforms
      .map((p) => `- ${p}（${PLATFORM_LABELS[p].label}，不超过 ${PLATFORM_LABELS[p].maxLen} 字）`)
      .join("\n");

    const system = `你是顶级中文内容运营策划，擅长一站式输出可发布的多平台内容包。请根据用户主题，按"${styleLabel}"风格生成完整内容矩阵。要求：
- titles：4 条候选标题，含点击率预测分数 score(60-99 整数)，要有差异化、抓眼球、符合中文社媒习惯
- body：一篇 600-1000 字的 Markdown 长文正文（含小标题、列表、引用或表格）
- platforms：仅为以下平台生成改写版本，严格控制字数：
${platformDescription}
  每个平台包含 content（正文）和 hashtags（3-6 个标签，不带 # 号）
- posters：3 个差异化的配图/海报提示词方案，每个含 style(中文风格名)和 prompt(可直接给 Midjourney/DALL·E 用的英文或中文详细描述)
- compliance：6-8 条合规自查结果，level 为 pass 或 warning，含 text(简短结论)和 detail(具体说明)。重点检查：广告法绝对化用语、虚假宣传、敏感话题、平台限流词、版权风险
必须通过工具调用返回结构化数据。`;

    const tool = {
      type: "function",
      function: {
        name: "submit_content_pack",
        description: "提交一站式内容包",
        parameters: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  score: { type: "integer", minimum: 0, maximum: 100 },
                },
                required: ["text", "score"],
                additionalProperties: false,
              },
            },
            body: { type: "string" },
            platforms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string", enum: Object.keys(PLATFORM_LABELS) },
                  content: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                },
                required: ["key", "content", "hashtags"],
                additionalProperties: false,
              },
            },
            posters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  style: { type: "string" },
                  prompt: { type: "string" },
                },
                required: ["style", "prompt"],
                additionalProperties: false,
              },
            },
            compliance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  level: { type: "string", enum: ["pass", "warning"] },
                  text: { type: "string" },
                  detail: { type: "string" },
                },
                required: ["level", "text", "detail"],
                additionalProperties: false,
              },
            },
          },
          required: ["titles", "body", "platforms", "posters", "compliance"],
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
          { role: "user", content: `主题：${topic}\n风格：${styleLabel}\n目标平台：${validPlatforms.map((p) => PLATFORM_LABELS[p].label).join("、")}` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "submit_content_pack" } },
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
    let parsed: any = {};
    try {
      parsed = JSON.parse(call?.function?.arguments ?? "{}");
    } catch (_) {
      return new Response(JSON.stringify({ error: "AI 返回结果解析失败" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize platforms into object keyed by platform
    const platformsMap: Record<string, { content: string; hashtags: string[] }> = {};
    for (const p of parsed.platforms ?? []) {
      if (p && typeof p.key === "string") {
        platformsMap[p.key] = {
          content: String(p.content ?? ""),
          hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
        };
      }
    }

    return new Response(JSON.stringify({
      result: {
        titles: parsed.titles ?? [],
        body: parsed.body ?? "",
        platforms: platformsMap,
        posters: parsed.posters ?? [],
        compliance: parsed.compliance ?? [],
      },
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});