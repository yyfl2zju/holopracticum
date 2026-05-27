import { supabase } from '@/integrations/supabase/client';

const sampleTasks = [
  { title: '劳动合同风险审查', type: 'contract', status: 'completed', input_summary: '审查甲方与乙方的劳动合同，检测违规条款' },
  { title: '用户管理模块后端代码生成', type: 'dev', status: 'running', input_summary: '基于需求文档生成 FastAPI 用户管理接口' },
  { title: '产品发布会推文生成', type: 'content', status: 'validating', input_summary: '为新产品发布撰写多平台推广文案' },
  { title: 'Q1 财务数据分析', type: 'data', status: 'planning', input_summary: '分析第一季度财务报表并生成趋势预测' },
  { title: '合同生成→审查→签署流程', type: 'workflow', status: 'queued', input_summary: '自动化合同全流程处理' },
  { title: '客户反馈情感分析', type: 'data', status: 'completed', input_summary: '对 2000 条客户评论进行情感与主题归类' },
  { title: 'NDA 模板批量生成', type: 'contract', status: 'completed', input_summary: '为 30 家供应商生成定制保密协议' },
  { title: 'API 文档自动撰写', type: 'dev', status: 'failed', input_summary: '基于 OpenAPI 规范生成中文 API 文档' },
];

const sampleWorkflows = [
  { title: '合同全流程自动化', description: '合同生成 → 风险审查 → 信息填充 → 发起签署', node_count: 6, category: '法务' },
  { title: '内容发布流水线', description: '主题构思 → 文案生成 → 合规检查 → 多平台分发', node_count: 5, category: '营销' },
  { title: '需求开发闭环', description: '需求分析 → 代码生成 → 测试建议 → CI/CD 部署', node_count: 7, category: '研发' },
  { title: '客户工单自动分流', description: '工单分类 → 优先级判定 → 派单 → 跟进提醒', node_count: 4, category: '客服' },
];

const SEED_KEY = 'holopracticum-seeded';

export async function seedIfEmpty(userId: string) {
  const flag = `${SEED_KEY}-${userId}`;
  if (localStorage.getItem(flag)) return;

  const { count } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((count ?? 0) > 0) {
    localStorage.setItem(flag, '1');
    return;
  }

  await supabase.from('tasks').insert(sampleTasks.map(t => ({ ...t, user_id: userId })));
  await supabase.from('workflows').insert(sampleWorkflows.map(w => ({ ...w, user_id: userId })));
  localStorage.setItem(flag, '1');
}