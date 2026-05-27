import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileName, rows, columns } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "数据为空" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    // Sample rows to keep payload small
    const sample = rows.slice(0, 200);
    const preview = JSON.stringify({ columns, sample }, null, 2).slice(0, 12000);

    const systemPrompt = `你是一位资深财务/业务数据分析师。基于用户提供的表格数据（任何业务领域，如财务、销售、运营），输出结构化的可视化与洞察。
- 自动识别时间列（月份/季度/日期）和数值列；如不存在时间列，按行号分桶。
- 货币单位统一为"万元"（如原始为元/千元，请折算并在 summary 中说明）。
- monthly 至少返回 6 个数据点；forecast 在最后 3 个点上提供 AI 预测值。
- cost_structure 给出 4-6 类成本占比（百分比合计 100）。如果数据中无成本明细，请基于列含义合理估算。
- risks 给出 2-4 条异常/风险，levels: high / medium / low。
- insights 给出 3-4 条决策建议，types: optimization / prediction / warning / opportunity。
- 所有文字使用简体中文，专业、简洁、可执行。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `文件名：${fileName}\n列：${JSON.stringify(columns)}\n共 ${rows.length} 行（截取前 ${sample.length} 行）\n\n${preview}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_analysis",
            description: "提交结构化的数据分析结果",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "整体数据摘要 1-2 句" },
                kpis: {
                  type: "array",
                  description: "4 个核心 KPI",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      value: { type: "string", description: "如 ¥95.2万 或 1234" },
                      change: { type: "string", description: "如 +12.8% 或 -3.4%" },
                      trend: { type: "string", enum: ["up", "down", "flat"] },
                      subtitle: { type: "string" },
                      positive: { type: "boolean", description: "true 表示该变化对业务是好的" },
                    },
                    required: ["title", "value", "change", "trend", "subtitle", "positive"],
                  },
                },
                monthly: {
                  type: "array",
                  description: "按时间序列的关键指标，单位万元",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      revenue: { type: "number" },
                      cost: { type: "number" },
                      profit: { type: "number" },
                      cashflow: { type: "number" },
                    },
                    required: ["month", "revenue", "cost", "profit", "cashflow"],
                  },
                },
                cost_structure: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      value: { type: "number", description: "百分比 0-100" },
                    },
                    required: ["name", "value"],
                  },
                },
                forecast: {
                  type: "array",
                  description: "现金流时序：actual 为历史实际值，forecast 为最后 3 点的 AI 预测",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      actual: { type: ["number", "null"] },
                      forecast: { type: ["number", "null"] },
                    },
                    required: ["month"],
                  },
                },
                risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      level: { type: "string", enum: ["high", "medium", "low"] },
                      title: { type: "string" },
                      detail: { type: "string" },
                      metric: { type: "string" },
                      date: { type: "string" },
                    },
                    required: ["level", "title", "detail", "metric", "date"],
                  },
                },
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["optimization", "prediction", "warning", "opportunity"] },
                      title: { type: "string" },
                      content: { type: "string" },
                    },
                    required: ["type", "title", "content"],
                  },
                },
              },
              required: ["summary", "kpis", "monthly", "cost_structure", "forecast", "risks", "insights"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_analysis" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "AI 调用频率超限，请稍后重试" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI 额度不足，请到 Cloud 设置中充值" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      throw new Error(`AI 网关错误 ${response.status}: ${t}`);
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI 未返回结构化结果");
    const result = JSON.parse(call.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-data error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});