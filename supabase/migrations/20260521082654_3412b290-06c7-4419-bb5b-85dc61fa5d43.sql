
-- Extend workflows
ALTER TABLE public.workflows
  ADD COLUMN IF NOT EXISTS graph JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[],"configs":{}}'::jsonb,
  ADD COLUMN IF NOT EXISTS scene TEXT,
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- workflow_runs
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id UUID,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workflow runs" ON public.workflow_runs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own workflow runs" ON public.workflow_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own workflow runs" ON public.workflow_runs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own workflow runs" ON public.workflow_runs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_user ON public.workflow_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_template ON public.workflows(is_template) WHERE is_template = true;

-- Seed templates (system user)
DELETE FROM public.workflows WHERE is_template = true;

INSERT INTO public.workflows (user_id, is_template, title, description, category, scene, tags, node_count, graph) VALUES
  ('00000000-0000-0000-0000-000000000000', true, '合同生成-审查-签署', '上传合同 → AI 审查 → 风险分流 → 人工确认 → 电子签 → 通知归档', '法务', '法务/合同管理', ARRAY['法务','签署','审查'], 9,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"开始","nodeType":"start"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":100},"data":{"label":"上传合同","nodeType":"file-upload"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":200},"data":{"label":"合同审查","nodeType":"contract-review"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":300},"data":{"label":"风险判断","nodeType":"condition"}},{"id":"n5","type":"workflowNode","position":{"x":100,"y":400},"data":{"label":"人工确认","nodeType":"human-confirm"}},{"id":"n6","type":"workflowNode","position":{"x":300,"y":500},"data":{"label":"填充信息","nodeType":"form-input"}},{"id":"n7","type":"workflowNode","position":{"x":300,"y":600},"data":{"label":"电子签名","nodeType":"e-sign"}},{"id":"n8","type":"workflowNode","position":{"x":300,"y":700},"data":{"label":"发送通知","nodeType":"notify"}},{"id":"n9","type":"workflowNode","position":{"x":300,"y":800},"data":{"label":"结束","nodeType":"end"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"},{"id":"e5","source":"n4","target":"n6"},{"id":"e6","source":"n5","target":"n6"},{"id":"e7","source":"n6","target":"n7"},{"id":"e8","source":"n7","target":"n8"},{"id":"e9","source":"n8","target":"n9"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '研发需求转代码流水线', '需求文档 → AI 拆解 → 代码生成 → 测试建议 → CI/CD → 通知', '研发', '研发管理', ARRAY['代码','研发','CI'], 6,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"需求输入","nodeType":"text-input"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"需求拆解","nodeType":"prompt-exec"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"AI 代码生成","nodeType":"dify-agent"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"测试建议","nodeType":"content-gen"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"CI/CD 触发","nodeType":"git-ci"}},{"id":"n6","type":"workflowNode","position":{"x":300,"y":600},"data":{"label":"通知","nodeType":"notify"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"},{"id":"e5","source":"n5","target":"n6"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '内容生成-审核-发布', '主题输入 → AI 生成内容 → 合规审查 → 人工审批 → 多平台发布', '内容', '内容运营', ARRAY['营销','内容','审核'], 5,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"主题输入","nodeType":"text-input"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"AI 生成内容","nodeType":"content-gen"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"合规审查","nodeType":"compliance"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"人工审批","nodeType":"human-approve"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"发布通知","nodeType":"notify"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '财务数据分析与预警', '上传财务表 → AI 分析 → 异常检测 → 风险预警 → 决策通知', '财务', '财务管理', ARRAY['财务','分析','预警'], 5,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"上传财务数据","nodeType":"file-upload"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"数据分析","nodeType":"data-analysis"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"风险审查","nodeType":"risk-review"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"预警判断","nodeType":"condition"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"预警通知","nodeType":"notify"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '客服工单智能处理', '工单接入 → AI 分类 → 知识库检索 → 自动回复 / 转人工 → 满意度回访', '客服', '客户服务', ARRAY['客服','工单','AI'], 6,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"工单接入","nodeType":"n8n-trigger"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"AI 分类","nodeType":"prompt-exec"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"知识库检索","nodeType":"kb-search"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"复杂度判断","nodeType":"condition"}},{"id":"n5","type":"workflowNode","position":{"x":100,"y":480},"data":{"label":"自动回复","nodeType":"content-gen"}},{"id":"n6","type":"workflowNode","position":{"x":500,"y":480},"data":{"label":"转人工","nodeType":"human-info"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"},{"id":"e5","source":"n4","target":"n6"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '招聘简历智能筛选', '简历上传 → 信息抽取 → 岗位匹配评分 → 排序 → HR 通知', 'HR', '人力资源', ARRAY['HR','招聘','筛选'], 5,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"简历上传","nodeType":"file-upload"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"信息抽取","nodeType":"prompt-exec"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"匹配评分","nodeType":"dify-agent"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"入库归档","nodeType":"db-query"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"HR 通知","nodeType":"notify"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '知识库智能问答', '用户提问 → 语义检索 → 上下文重写 → AI 回答 → 反馈记录', '知识库', '知识管理', ARRAY['知识库','RAG','问答'], 5,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"用户提问","nodeType":"text-input"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"语义检索","nodeType":"kb-search"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"上下文重写","nodeType":"prompt-exec"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"AI 回答","nodeType":"dify-agent"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"反馈记录","nodeType":"db-query"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '营销活动自动化', '活动配置 → 受众分群 → 内容生成 → 多渠道下发 → 效果监控', '营销', '市场营销', ARRAY['营销','自动化','渠道'], 6,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"活动配置","nodeType":"form-input"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"受众分群","nodeType":"db-query"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"AI 文案","nodeType":"content-gen"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"合规审查","nodeType":"compliance"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"多渠道下发","nodeType":"notify"}},{"id":"n6","type":"workflowNode","position":{"x":300,"y":600},"data":{"label":"效果存档","nodeType":"file-storage"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"},{"id":"e5","source":"n5","target":"n6"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '采购申请审批流', '申请单 → 预算校验 → 多级审批 → 供应商对接 → 归档', '采购', '采购管理', ARRAY['审批','采购','预算'], 6,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"采购申请","nodeType":"form-input"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"预算校验","nodeType":"condition"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"部门审批","nodeType":"human-approve"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"财务审批","nodeType":"human-approve"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"供应商对接","nodeType":"n8n-trigger"}},{"id":"n6","type":"workflowNode","position":{"x":300,"y":600},"data":{"label":"归档","nodeType":"file-storage"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"},{"id":"e5","source":"n5","target":"n6"}],"configs":{}}'::jsonb),

  ('00000000-0000-0000-0000-000000000000', true, '安全审计与日志分析', '日志摄入 → AI 异常检测 → 风险分级 → 告警 → 工单创建', '安全', '安全运维', ARRAY['安全','审计','告警'], 5,
    '{"nodes":[{"id":"n1","type":"workflowNode","position":{"x":300,"y":0},"data":{"label":"日志摄入","nodeType":"n8n-trigger"}},{"id":"n2","type":"workflowNode","position":{"x":300,"y":120},"data":{"label":"异常检测","nodeType":"risk-review"}},{"id":"n3","type":"workflowNode","position":{"x":300,"y":240},"data":{"label":"风险分级","nodeType":"condition"}},{"id":"n4","type":"workflowNode","position":{"x":300,"y":360},"data":{"label":"安全告警","nodeType":"notify"}},{"id":"n5","type":"workflowNode","position":{"x":300,"y":480},"data":{"label":"工单创建","nodeType":"db-query"}}],"edges":[{"id":"e1","source":"n1","target":"n2"},{"id":"e2","source":"n2","target":"n3"},{"id":"e3","source":"n3","target":"n4"},{"id":"e4","source":"n4","target":"n5"}],"configs":{}}'::jsonb);
