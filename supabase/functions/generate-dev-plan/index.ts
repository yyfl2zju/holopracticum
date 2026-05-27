import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { requirement, stacks } = await req.json();
    if (!requirement || typeof requirement !== 'string') {
      return new Response(JSON.stringify({ error: 'requirement 必填' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY 未配置' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `你是 HoloPracticum 的 AI 开发协作 Agent，扮演三个角色：
- Planner：把需求拆解成模块和子任务
- Executor：生成可直接落地的代码文件
- Validator：补充 API 设计、测试用例、CI/CD、目录结构与代码评审说明

严格按提供的工具 schema 返回结构化结果。

【代码生成硬性要求】
- files 数组必须包含 3-5 个文件，每个文件 content 字段必须是完整、可运行的代码，长度至少 200 字符，绝不能为空字符串或仅含注释。
- 严禁出现 TODO、占位符、"..." 省略号、"以下省略"等。
- 每个文件必须包含 import、函数实现、必要的错误处理。
- language 字段使用准确语言名：typescript / python / javascript / sql / yaml 等。

其他：最多 6 个 API；测试分组 2-3 组，每组 3-5 用例。所有中文文案保持简洁专业。`;

    const userPrompt = `需求描述：
${requirement}

技术栈偏好：${(stacks || []).join(', ') || '由你决定'}

请生成完整的开发方案。`;

    const tool = {
      type: 'function',
      function: {
        name: 'emit_dev_plan',
        description: '输出结构化开发方案',
        parameters: {
          type: 'object',
          properties: {
            workspace_name: { type: 'string', description: '工作区/模块英文短名，kebab-case' },
            summary: { type: 'string', description: '一句话方案概述' },
            plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  status: { type: 'string', enum: ['done', 'planned'] },
                  tasks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        done: { type: 'boolean' },
                      },
                      required: ['title', 'done'],
                    },
                  },
                },
                required: ['category', 'status', 'tasks'],
              },
            },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: '相对路径，如 app/routers/users.py' },
                  language: { type: 'string' },
                  content: { type: 'string' },
                },
                required: ['path', 'language', 'content'],
              },
            },
            apis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                  path: { type: 'string' },
                  desc: { type: 'string' },
                  auth: { type: 'boolean' },
                  status: { type: 'string' },
                  request: { type: 'string' },
                  response: { type: 'string' },
                },
                required: ['method', 'path', 'desc', 'auth', 'status', 'request', 'response'],
              },
            },
            tests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  cases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        code: { type: 'string' },
                        status: { type: 'string', enum: ['pass', 'warn'] },
                      },
                      required: ['title', 'code', 'status'],
                    },
                  },
                },
                required: ['category', 'cases'],
              },
            },
            dir_structure: { type: 'string', description: '用 ASCII 树状结构展示目录' },
            cicd: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stage: { type: 'string' },
                  cmd: { type: 'string' },
                  status: { type: 'string', enum: ['success', 'pending'] },
                },
                required: ['stage', 'cmd', 'status'],
              },
            },
            validator_notes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Validator 的评审要点，3-6 条',
            },
          },
          required: ['workspace_name', 'summary', 'plan', 'files', 'apis', 'tests', 'dir_structure', 'cicd', 'validator_notes'],
        },
      },
    };

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: 'emit_dev_plan' } },
        max_tokens: 16000,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('AI gateway error', resp.status, text);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: 'AI 额度不足，请在工作区充值' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'AI 调用失败' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: 'AI 未返回结构化结果' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let plan;
    try {
      plan = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('解析失败', e, toolCall.function.arguments);
      return new Response(JSON.stringify({ error: '解析 AI 输出失败' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('generate-dev-plan error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});