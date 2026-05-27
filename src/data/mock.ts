import type { Task, SystemStatus, ScenarioCard, WorkflowTemplate } from '@/types/platform';

export const mockRecentTasks: Task[] = [
  {
    id: 'task-001',
    title: '劳动合同风险审查',
    type: 'contract',
    status: 'completed',
    inputSummary: '审查甲方与乙方的劳动合同，检测违规条款',
    createdAt: '2026-03-15T09:30:00Z',
    updatedAt: '2026-03-15T09:35:00Z',
  },
  {
    id: 'task-002',
    title: '用户管理模块后端代码生成',
    type: 'dev',
    status: 'running',
    inputSummary: '基于需求文档生成 FastAPI 用户管理接口',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:02:00Z',
  },
  {
    id: 'task-003',
    title: '产品发布会推文生成',
    type: 'content',
    status: 'validating',
    inputSummary: '为新产品发布撰写多平台推广文案',
    createdAt: '2026-03-15T08:15:00Z',
    updatedAt: '2026-03-15T08:20:00Z',
  },
  {
    id: 'task-004',
    title: 'Q1 财务数据分析',
    type: 'data',
    status: 'planning',
    inputSummary: '分析第一季度财务报表并生成趋势预测',
    createdAt: '2026-03-14T16:00:00Z',
    updatedAt: '2026-03-14T16:05:00Z',
  },
  {
    id: 'task-005',
    title: '合同生成→审查→签署流程',
    type: 'workflow',
    status: 'queued',
    inputSummary: '自动化合同全流程处理',
    createdAt: '2026-03-14T14:30:00Z',
    updatedAt: '2026-03-14T14:30:00Z',
  },
];

export const mockSystemStatus: SystemStatus[] = [
  { service: 'Dify AI 引擎', status: 'online', latency: 120 },
  { service: 'n8n 编排引擎', status: 'online', latency: 85 },
  { service: 'FastAPI 网关', status: 'online', latency: 45 },
  { service: '知识库服务', status: 'online', latency: 200 },
  { service: '文件存储', status: 'online', latency: 60 },
];

export const mockScenarioCards: ScenarioCard[] = [
  {
    id: 'sc-1',
    title: '合同风险审查',
    description: '上传合同文件，AI 自动识别风险条款并给出修改建议',
    icon: 'FileCheck',
    category: 'contract',
    route: '/contract',
  },
  {
    id: 'sc-2',
    title: '需求转代码',
    description: '输入需求描述，生成代码、API 设计与测试用例',
    icon: 'Code',
    category: 'dev',
    route: '/dev-assist',
  },
  {
    id: 'sc-3',
    title: '内容创作',
    description: '一键生成多平台文案，支持改写与合规检查',
    icon: 'PenTool',
    category: 'content',
    route: '/content',
  },
  {
    id: 'sc-4',
    title: '数据洞察',
    description: '上传数据表，生成可视化图表与趋势预测',
    icon: 'BarChart3',
    category: 'data',
    route: '/dashboard-bi',
  },
  {
    id: 'sc-5',
    title: '流程编排',
    description: '可视化拖拽创建自动化工作流',
    icon: 'Workflow',
    category: 'workflow',
    route: '/workflow',
  },
  {
    id: 'sc-6',
    title: '模板文书生成',
    description: '基于模板快速生成合同、协议等法务文书',
    icon: 'FileText',
    category: 'contract',
    route: '/contract',
  },
];

export const mockWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-1',
    title: '合同全流程自动化',
    description: '合同生成 → 风险审查 → 信息填充 → 发起签署',
    nodeCount: 6,
    category: '法务',
  },
  {
    id: 'wf-2',
    title: '内容发布流水线',
    description: '主题构思 → 文案生成 → 合规检查 → 多平台分发',
    nodeCount: 5,
    category: '营销',
  },
  {
    id: 'wf-3',
    title: '需求开发闭环',
    description: '需求分析 → 代码生成 → 测试建议 → CI/CD 部署',
    nodeCount: 7,
    category: '研发',
  },
];

export const taskStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-muted text-muted-foreground' },
  queued: { label: '排队中', color: 'bg-secondary text-secondary-foreground' },
  planning: { label: '规划中', color: 'bg-status-planning/10 text-status-planning' },
  running: { label: '执行中', color: 'bg-status-running/10 text-status-running' },
  validating: { label: '校验中', color: 'bg-status-validating/10 text-status-validating' },
  completed: { label: '已完成', color: 'bg-status-success/10 text-status-success' },
  failed: { label: '失败', color: 'bg-status-error/10 text-status-error' },
};

export const taskTypeConfig: Record<string, { label: string; icon: string }> = {
  contract: { label: '合同', icon: 'FileCheck' },
  dev: { label: '开发', icon: 'Code' },
  content: { label: '内容', icon: 'PenTool' },
  data: { label: '数据', icon: 'BarChart3' },
  workflow: { label: '流程', icon: 'Workflow' },
};
