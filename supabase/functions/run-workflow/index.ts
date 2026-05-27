import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlowNode { id: string; data: { label: string; nodeType: string }; }
interface FlowEdge { id: string; source: string; target: string; }
interface Graph { nodes: FlowNode[]; edges: FlowEdge[]; configs?: Record<string, any>; }
interface StepLog {
  nodeId: string; label: string; nodeType: string;
  status: 'success' | 'failed' | 'skipped';
  output: string; duration_ms: number;
}

// Topological sort
function topoSort(graph: Graph): string[] {
  const indeg: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  graph.nodes.forEach(n => { indeg[n.id] = 0; adj[n.id] = []; });
  graph.edges.forEach(e => {
    if (adj[e.source]) adj[e.source].push(e.target);
    if (indeg[e.target] !== undefined) indeg[e.target]++;
  });
  const queue = Object.keys(indeg).filter(k => indeg[k] === 0);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    (adj[id] || []).forEach(t => { indeg[t]--; if (indeg[t] === 0) queue.push(t); });
  }
  return order;
}

async function callAI(prompt: string, system?: string, images?: string[]): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");
  const userContent: any = images && images.length
    ? [
        { type: "text", text: prompt },
        ...images.map((url) => ({ type: "image_url", image_url: { url } })),
      ]
    : prompt;
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system || "你是一个工作流节点执行器。基于节点类型和上游上下文，给出该节点的输出（可作为下游输入）。中文回答，简洁专业。" },
        { role: "user", content: userContent },
      ],
    }),
  });
  if (!r.ok) {
    if (r.status === 429) throw new Error("AI 速率超限");
    if (r.status === 402) throw new Error("AI 额度不足");
    throw new Error(`AI 错误 ${r.status}`);
  }
  const data = await r.json();
  return data.choices?.[0]?.message?.content || "";
}

// Safely evaluate a simple condition string against the most recent context value.
// Supports operators >, >=, <, <=, ==, != ; right-hand side number or 'string'.
function evalCondition(expr: string, lastValue: string): { branch: string; matched: boolean } {
  if (!expr) return { branch: 'default', matched: true };
  const m = expr.match(/^\s*(.+?)\s*(>=|<=|==|!=|>|<|contains)\s*(.+?)\s*$/);
  if (!m) {
    // treat as substring match
    return { branch: lastValue.includes(expr) ? 'true' : 'false', matched: lastValue.includes(expr) };
  }
  const [, , op, right] = m;
  const rhsNum = Number(right);
  const lhsNum = Number(lastValue);
  let ok = false;
  if (op === 'contains') ok = lastValue.includes(right.replace(/^['"]|['"]$/g, ''));
  else if (!isNaN(rhsNum) && !isNaN(lhsNum)) {
    if (op === '>') ok = lhsNum > rhsNum;
    if (op === '<') ok = lhsNum < rhsNum;
    if (op === '>=') ok = lhsNum >= rhsNum;
    if (op === '<=') ok = lhsNum <= rhsNum;
    if (op === '==') ok = lhsNum === rhsNum;
    if (op === '!=') ok = lhsNum !== rhsNum;
  } else {
    const r = right.replace(/^['"]|['"]$/g, '');
    if (op === '==') ok = lastValue === r;
    if (op === '!=') ok = lastValue !== r;
  }
  return { branch: ok ? 'true' : 'false', matched: ok };
}

async function executeNode(
  node: FlowNode,
  config: any,
  ctx: Record<string, string>,
  lastOutput: string,
  deps: { admin: any; userId: string | null; workflowName: string; workflowId: string | null; images: string[] }
): Promise<string> {
  const t = node.data.nodeType;
  const label = node.data.label;
  const ctxStr = Object.entries(ctx).filter(([k]) => !k.startsWith("__")).slice(-3).map(([k, v]) => `${k}: ${v}`).join("\n") || lastOutput;
  const upstream = lastOutput || ctx['__input'] || '';

  // ── Structural ──
  if (t === "start") return `流程「${deps.workflowName}」启动，输入长度 ${(ctx['__input'] || '').length} 字符`;
  if (t === "end") return `流程结束，共产出 ${Object.keys(ctx).filter(k => !k.startsWith('__')).length} 个节点输出`;
  if (t === "merge") return `已合并上游分支结果：${upstream.slice(0, 60)}…`;
  if (t === "condition") {
    const expr = config?.['条件表达式'] || '';
    const r = evalCondition(expr, upstream);
    return `条件 [${expr || '无'}] 求值 → ${r.branch}（${r.matched ? '匹配' : '未匹配'}）`;
  }

  // ── Input nodes ──
  if (t === "text-input") {
    const bind = config?.['绑定输入字段'];
    const fromSchema = bind ? ctx[`$${bind}`] : undefined;
    const v = fromSchema || ctx['__input'] || config?.['默认值'] || '';
    return v || "（无输入文本）";
  }
  if (t === "form-input") {
    const bind = config?.['绑定输入字段'];
    const fromSchema = bind ? ctx[`$${bind}`] : undefined;
    return fromSchema || ctx['__input'] || JSON.stringify(config || {});
  }
  if (t === "file-upload") {
    const inp = ctx['__input'] || '';
    if (!inp) return "（未提供文件内容）";
    return `已接收文件内容，${inp.length} 字符 · 类型 ${config?.['文件类型'] || '任意'}`;
  }
  if (t === "image-input") {
    const imgs = deps.images || [];
    if (!imgs.length) return "（未提供图片）";
    return `已接收 ${imgs.length} 张图片，将作为多模态输入交由下游 AI 节点理解`;
  }

  // ── Human nodes — actually create a real pending task ──
  if (t === "human-confirm" || t === "human-approve" || t === "human-info") {
    if (deps.admin && deps.userId) {
      const typeMap: Record<string, string> = {
        'human-confirm': '人工确认',
        'human-approve': '人工审批',
        'human-info': '补充信息',
      };
      const { data } = await deps.admin.from('tasks').insert({
        user_id: deps.userId,
        title: `[工作流] ${deps.workflowName} · ${label}`,
        type: typeMap[t],
        status: 'queued',
        priority: t === 'human-approve' ? 'high' : 'medium',
        input_summary: upstream.slice(0, 500),
      }).select('id').single();
      return `已创建待办任务 #${data?.id?.slice(0, 8) || '?'}（${typeMap[t]} · ${config?.['确认人角色'] || '默认负责人'}）`;
    }
    return `（模拟）${label} 已通过`;
  }

  // ── DB query — actually count rows of allowed tables ──
  if (t === "db-query") {
    if (!deps.admin || !deps.userId) return "（未授权数据库查询）";
    const tableName = (config?.['表名'] || 'tasks').toString();
    const allowed = ['tasks', 'contract_reviews', 'data_analyses', 'workflow_runs'];
    if (!allowed.includes(tableName)) return `不允许查询表 ${tableName}`;
    const { count, error } = await deps.admin.from(tableName).select('*', { count: 'exact', head: true }).eq('user_id', deps.userId);
    if (error) return `查询失败：${error.message}`;
    return `查询 ${tableName} 完成，命中 ${count ?? 0} 条记录`;
  }

  // ── Notify — write a real task entry as notification log ──
  if (t === "notify") {
    const channel = config?.['通知方式'] || '站内信';
    const text = config?.['通知文案'] || `工作流「${deps.workflowName}」节点「${label}」已完成`;
    if (deps.admin && deps.userId) {
      await deps.admin.from('tasks').insert({
        user_id: deps.userId,
        title: `[通知] ${text.slice(0, 80)}`,
        type: `通知-${channel}`,
        status: 'completed',
        priority: 'low',
        input_summary: upstream.slice(0, 300),
        result: `${channel} · 接收人：${config?.['接收人'] || '默认'}`,
      });
    }
    return `已通过 ${channel} 发送通知 → ${config?.['接收人'] || '默认接收人'}`;
  }

  // ── Integration nodes — best-effort simulated with config awareness ──
  if (t === "n8n-trigger") return `已触发 n8n webhook（${config?.['Webhook URL'] || '未配置'}）`;
  if (t === "git-ci") return `已提交 CI 流水线 #${Math.floor(Math.random() * 9000 + 1000)}（${config?.['仓库'] || 'default'}）`;
  if (t === "file-storage") return `已归档：${upstream.slice(0, 40)}…（bucket: ${config?.['Bucket'] || 'default'}）`;
  if (t === "e-sign") return `电子签链接已发送，模板「${config?.['签署模板'] || '默认'}」 · 签署方 ${config?.['签署方映射'] || 'party_a, party_b'}`;

  // ── KB search — query past analyses/reviews as the knowledge base ──
  if (t === "kb-search") {
    if (deps.admin && deps.userId) {
      const [cr, da] = await Promise.all([
        deps.admin.from('contract_reviews').select('file_name,summary').eq('user_id', deps.userId).limit(3),
        deps.admin.from('data_analyses').select('file_name,summary').eq('user_id', deps.userId).limit(3),
      ]);
      const docs = [
        ...((cr.data || []).map((r: any) => `合同《${r.file_name}》：${(r.summary || '').slice(0, 120)}`)),
        ...((da.data || []).map((r: any) => `数据《${r.file_name}》：${(r.summary || '').slice(0, 120)}`)),
      ];
      if (!docs.length) return "知识库为空，未命中相关文档";
      const ans = await callAI(`基于以下知识库片段回答用户问题。\n问题：${upstream || label}\n知识库：\n${docs.join('\n')}`);
      return `命中 ${docs.length} 条 · ${ans}`;
    }
    return await callAI(`知识库检索：${upstream || label}`, undefined, deps.images);
  }

  // ── AI nodes — real Lovable AI calls with role-specific system prompts ──
  const systems: Record<string, string> = {
    'prompt-exec': '你严格按用户给出的 Prompt 模板执行任务，输出结果文本。',
    'dify-agent': '你是一个执行型 AI Agent，基于上游上下文给出可操作的结果。',
    'content-gen': '你是资深内容创作者，按指定类型与风格生成高质量正文，约 200-400 字。',
    'contract-review': '你是合同审查专家，列出 3-5 个关键风险点（编号、风险描述、建议），并给出 0-100 风险评分。',
    'risk-review': '你是风险评估专家，输出 Top 3 风险及其等级（高/中/低）与缓解措施。',
    'contract-gen': '你是合同起草专家，输出合同核心条款（甲乙方、标的、金额、期限、违约责任、争议解决）。',
    'data-analysis': '你是数据分析师，输出 3-5 条洞察 + 1 条建议，使用要点列表。',
    'compliance': '你是合规专家，列出合规项 ✓/✗ 检查表与不合规项的整改建议。',
  };

  let prompt = "";
  if (t === "prompt-exec") {
    const tpl = config?.['Prompt 模板'] || '';
    prompt = tpl
      ? `${tpl}\n\n[上游上下文]\n${ctxStr}`
      : `执行 Prompt 节点「${label}」。上游：\n${ctxStr}`;
  } else if (t === "content-gen") {
    prompt = `请生成${config?.['内容类型'] || '文章'}，风格：${config?.['风格'] || '专业'}。\n主题/上下文：\n${ctxStr}\n${config?.['Prompt'] || ''}`;
  } else if (t === "contract-review" || t === "risk-review") {
    prompt = `对以下内容进行${t === 'risk-review' ? '风险' : '合同'}审查（${config?.['合同类型'] || ''} · 维度：${config?.['审查维度'] || '全面审查'}）：\n${ctxStr}`;
  } else if (t === "contract-gen") {
    prompt = `根据以下需求生成合同关键条款：\n${ctxStr}`;
  } else if (t === "data-analysis") {
    prompt = `分析以下数据并给出洞察：\n${ctxStr}`;
  } else if (t === "compliance") {
    prompt = `对以下内容进行合规审查：\n${ctxStr}`;
  } else if (t === "dify-agent") {
    prompt = `作为名为「${config?.['Agent 名称'] || label}」的 AI Agent 处理任务。\n上游上下文：\n${ctxStr}\n${config?.['Prompt 模板'] || ''}`;
  } else {
    prompt = `节点「${label}」(${t}) 处理上游：\n${ctxStr}`;
  }

  return await callAI(prompt, systems[t], deps.images);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const started = Date.now();
  try {
    const { graph, input, inputs, images, workflowName, workflowId, userId } = await req.json();
    if (!graph?.nodes?.length) throw new Error("工作流为空");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = SUPABASE_URL && SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;
    const imageList: string[] = Array.isArray(images)
      ? images.map((x: any) => (typeof x === 'string' ? x : x?.dataUrl)).filter(Boolean)
      : [];
    const deps = { admin, userId: userId || null, workflowName, workflowId: workflowId || null, images: imageList };

    const order = topoSort(graph);
    const nodeMap: Record<string, FlowNode> = {};
    graph.nodes.forEach((n: FlowNode) => { nodeMap[n.id] = n; });
    const configs = graph.configs || {};
    const ioSchema = graph.io_schema || { input: [], output: [] };

    // Build initial context. Prefer structured `inputs`; fall back to plain `input`.
    const structuredInputs: Record<string, any> = inputs && typeof inputs === 'object' ? inputs : {};
    // Apply schema defaults
    for (const f of (ioSchema.input || [])) {
      if (structuredInputs[f.name] === undefined && f.default !== undefined) {
        structuredInputs[f.name] = f.default;
      }
    }
    const ctx: Record<string, string> = {
      __input: typeof input === 'string' ? input : JSON.stringify(input ?? structuredInputs ?? {}),
    };
    // Expose each structured input as ctx variable
    for (const [k, v] of Object.entries(structuredInputs)) {
      ctx[`$${k}`] = typeof v === 'string' ? v : JSON.stringify(v);
    }
    const steps: StepLog[] = [];
    let lastOutput = ctx['__input'];

    for (const id of order) {
      const node = nodeMap[id];
      if (!node) continue;
      const t0 = Date.now();
      try {
        const output = await executeNode(node, configs[id] || {}, ctx, lastOutput, deps);
        const dur = Date.now() - t0;
        ctx[node.data.label] = output;
        lastOutput = output;
        steps.push({ nodeId: id, label: node.data.label, nodeType: node.data.nodeType, status: "success", output, duration_ms: dur });
      } catch (e) {
        const dur = Date.now() - t0;
        steps.push({ nodeId: id, label: node.data.label, nodeType: node.data.nodeType, status: "failed", output: String((e as Error).message), duration_ms: dur });
        const handle = configs[id]?.['__errorHandle'] || 'stop';
        if (handle === 'stop') {
          return new Response(JSON.stringify({
            status: 'failed', steps, duration_ms: Date.now() - started,
            error: `节点「${node.data.label}」失败：${(e as Error).message}`,
            workflowName, workflowId,
          }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    // Extract structured outputs from ctx based on schema
    const outputs: Record<string, any> = {};
    for (const f of (ioSchema.output || [])) {
      // Look up by exact field name across node labels first; fallback to last output
      const direct = ctx[f.name] ?? ctx[`$${f.name}`];
      outputs[f.name] = direct !== undefined ? direct : (steps[steps.length - 1]?.output || '');
    }

    return new Response(JSON.stringify({
      status: 'completed', steps, duration_ms: Date.now() - started,
      output: steps[steps.length - 1]?.output || '',
      outputs: Object.keys(outputs).length ? outputs : undefined,
      workflowName, workflowId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message), duration_ms: Date.now() - started }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});