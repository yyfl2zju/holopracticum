import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
  MarkerType,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play, Save, Upload, Download, Copy, Trash2, MoreHorizontal,
  Search, GripVertical, Settings, X, ChevronDown, ChevronRight,
  CirclePlay, CircleStop, GitBranch, Merge, FileText, UploadCloud,
  FormInput, Bot, Brain, Database, FileSearch, PenTool, ShieldCheck,
  FileSignature, Webhook, GitCommit, HardDrive, Bell, UserCheck,
  ClipboardCheck, MessageSquare, Undo2, Redo2, LayoutTemplate,
  Zap, AlertTriangle, CheckCircle2, FolderOpen, Plus, Loader2, History, Tag,
  Code2, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { extractTextFromFile } from '@/lib/extractText';

// ─── Node type definitions ───
interface NodeCategory {
  label: string;
  color: string;
  items: { type: string; label: string; icon: React.ElementType; desc: string }[];
}

const nodeCategories: NodeCategory[] = [
  {
    label: '基础节点', color: 'border-muted-foreground/30',
    items: [
      { type: 'start', label: '开始', icon: CirclePlay, desc: '流程起点' },
      { type: 'end', label: '结束', icon: CircleStop, desc: '流程终点' },
      { type: 'condition', label: '条件判断', icon: GitBranch, desc: '按条件分支' },
      { type: 'merge', label: '合并', icon: Merge, desc: '合并多个分支' },
    ],
  },
  {
    label: '输入节点', color: 'border-primary/40',
    items: [
      { type: 'text-input', label: '文本输入', icon: FileText, desc: '接收文本数据' },
      { type: 'file-upload', label: '文件上传', icon: UploadCloud, desc: '上传文件或文档' },
      { type: 'image-input', label: '图片输入', icon: ImageIcon, desc: '接收图片（多模态）' },
      { type: 'form-input', label: '表单输入', icon: FormInput, desc: '结构化表单' },
    ],
  },
  {
    label: 'AI 节点', color: 'border-[hsl(var(--status-planning))]/50',
    items: [
      { type: 'dify-agent', label: 'Dify Agent', icon: Bot, desc: '调用智能代理' },
      { type: 'prompt-exec', label: 'Prompt 执行', icon: Brain, desc: '执行提示词' },
      { type: 'kb-search', label: '知识库检索', icon: FileSearch, desc: '语义检索知识' },
      { type: 'content-gen', label: '内容生成', icon: PenTool, desc: 'AI 生成内容' },
      { type: 'risk-review', label: '风险审查', icon: ShieldCheck, desc: 'AI 风险评估' },
    ],
  },
  {
    label: '业务节点', color: 'border-[hsl(var(--status-success))]/40',
    items: [
      { type: 'contract-gen', label: '合同生成', icon: FileText, desc: '生成合同文档' },
      { type: 'contract-review', label: '合同审查', icon: FileSearch, desc: '审查合同条款' },
      { type: 'data-analysis', label: '数据分析', icon: Database, desc: '分析业务数据' },
      { type: 'compliance', label: '合规校验', icon: ShieldCheck, desc: '检查合规性' },
    ],
  },
  {
    label: '集成节点', color: 'border-muted-foreground/20',
    items: [
      { type: 'n8n-trigger', label: 'n8n 触发', icon: Webhook, desc: '外部流程触发' },
      { type: 'git-ci', label: 'Git/CI', icon: GitCommit, desc: '代码集成' },
      { type: 'db-query', label: '数据库查询', icon: Database, desc: '查询数据库' },
      { type: 'file-storage', label: '文件存储', icon: HardDrive, desc: '存储文件' },
      { type: 'e-sign', label: '电子签名', icon: FileSignature, desc: '发起电子签' },
      { type: 'notify', label: '消息通知', icon: Bell, desc: '发送通知' },
    ],
  },
  {
    label: '人工节点', color: 'border-[hsl(var(--status-warning))]/50',
    items: [
      { type: 'human-confirm', label: '人工确认', icon: UserCheck, desc: '等待人工确认' },
      { type: 'human-approve', label: '人工审批', icon: ClipboardCheck, desc: '审批流程' },
      { type: 'human-info', label: '补充信息', icon: MessageSquare, desc: '人工补充数据' },
    ],
  },
];

const allNodeItems = nodeCategories.flatMap(c => c.items);

// ─── Color mapping for node types ───
const getNodeStyle = (type: string) => {
  const map: Record<string, { bg: string; border: string; accent: string }> = {
    start: { bg: 'bg-card', border: 'border-muted-foreground/40', accent: 'text-muted-foreground' },
    end: { bg: 'bg-card', border: 'border-muted-foreground/40', accent: 'text-muted-foreground' },
    condition: { bg: 'bg-card', border: 'border-muted-foreground/40', accent: 'text-muted-foreground' },
    merge: { bg: 'bg-card', border: 'border-muted-foreground/40', accent: 'text-muted-foreground' },
    'text-input': { bg: 'bg-card', border: 'border-primary/40', accent: 'text-primary' },
    'file-upload': { bg: 'bg-card', border: 'border-primary/40', accent: 'text-primary' },
    'image-input': { bg: 'bg-card', border: 'border-primary/40', accent: 'text-primary' },
    'form-input': { bg: 'bg-card', border: 'border-primary/40', accent: 'text-primary' },
    'dify-agent': { bg: 'bg-card', border: 'border-[hsl(262,83%,58%)]/50', accent: 'text-[hsl(262,83%,58%)]' },
    'prompt-exec': { bg: 'bg-card', border: 'border-[hsl(262,83%,58%)]/50', accent: 'text-[hsl(262,83%,58%)]' },
    'kb-search': { bg: 'bg-card', border: 'border-[hsl(262,83%,58%)]/50', accent: 'text-[hsl(262,83%,58%)]' },
    'content-gen': { bg: 'bg-card', border: 'border-[hsl(262,83%,58%)]/50', accent: 'text-[hsl(262,83%,58%)]' },
    'risk-review': { bg: 'bg-card', border: 'border-[hsl(262,83%,58%)]/50', accent: 'text-[hsl(262,83%,58%)]' },
    'contract-gen': { bg: 'bg-card', border: 'border-[hsl(var(--status-success))]/40', accent: 'text-[hsl(var(--status-success))]' },
    'contract-review': { bg: 'bg-card', border: 'border-[hsl(var(--status-success))]/40', accent: 'text-[hsl(var(--status-success))]' },
    'data-analysis': { bg: 'bg-card', border: 'border-[hsl(var(--status-success))]/40', accent: 'text-[hsl(var(--status-success))]' },
    'compliance': { bg: 'bg-card', border: 'border-[hsl(var(--status-success))]/40', accent: 'text-[hsl(var(--status-success))]' },
    'n8n-trigger': { bg: 'bg-card', border: 'border-muted-foreground/20', accent: 'text-muted-foreground' },
    'git-ci': { bg: 'bg-card', border: 'border-muted-foreground/20', accent: 'text-muted-foreground' },
    'db-query': { bg: 'bg-card', border: 'border-muted-foreground/20', accent: 'text-muted-foreground' },
    'file-storage': { bg: 'bg-card', border: 'border-muted-foreground/20', accent: 'text-muted-foreground' },
    'e-sign': { bg: 'bg-card', border: 'border-muted-foreground/20', accent: 'text-muted-foreground' },
    'notify': { bg: 'bg-card', border: 'border-muted-foreground/20', accent: 'text-muted-foreground' },
    'human-confirm': { bg: 'bg-card', border: 'border-[hsl(var(--status-warning))]/50', accent: 'text-[hsl(var(--status-warning))]' },
    'human-approve': { bg: 'bg-card', border: 'border-[hsl(var(--status-warning))]/50', accent: 'text-[hsl(var(--status-warning))]' },
    'human-info': { bg: 'bg-card', border: 'border-[hsl(var(--status-warning))]/50', accent: 'text-[hsl(var(--status-warning))]' },
  };
  return map[type] || { bg: 'bg-card', border: 'border-border', accent: 'text-foreground' };
};

// ─── Custom Flow Node ───
function WorkflowNode({ data, selected }: NodeProps) {
  const d = data as { label: string; nodeType: string; icon: string; config?: Record<string, any> };
  const item = allNodeItems.find(i => i.type === d.nodeType);
  const Icon = item?.icon || Zap;
  const style = getNodeStyle(d.nodeType);

  return (
    <div className={`relative px-4 py-3 rounded-xl border-2 shadow-sm min-w-[160px] transition-all ${style.bg} ${style.border} ${selected ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      {d.nodeType !== 'start' && (
        <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
      )}
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg bg-muted/50 ${style.accent}`}>
          <Icon size={16} />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground leading-tight">{d.label}</div>
          <div className="text-[10px] text-muted-foreground">{item?.desc}</div>
        </div>
      </div>
      {d.nodeType !== 'end' && (
        <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
      )}
    </div>
  );
}

// ─── Node config schemas ───
const nodeConfigSchemas: Record<string, { label: string; type: 'text' | 'select' | 'switch' | 'textarea'; options?: string[]; default?: any }[]> = {
  'dify-agent': [
    { label: 'Agent 名称', type: 'text', default: '' },
    { label: '应用 ID', type: 'text', default: '' },
    { label: 'Prompt 模板', type: 'textarea', default: '' },
    { label: '输入变量', type: 'text', default: 'input_text' },
    { label: '输出字段', type: 'text', default: 'result' },
    { label: '启用知识库', type: 'switch', default: true },
    { label: '超时(秒)', type: 'text', default: '30' },
  ],
  'contract-review': [
    { label: '合同类型', type: 'select', options: ['服务协议', '采购合同', '劳动合同', '保密协议'], default: '服务协议' },
    { label: '审查维度', type: 'select', options: ['全面审查', '风险条款', '金额条款', '期限条款'], default: '全面审查' },
    { label: '风险阈值', type: 'select', options: ['低', '中', '高'], default: '中' },
    { label: '输出修订建议', type: 'switch', default: true },
    { label: '生成报告', type: 'switch', default: true },
  ],
  'human-confirm': [
    { label: '确认人角色', type: 'select', options: ['法务', '财务', '业务负责人', '管理员'], default: '法务' },
    { label: '确认方式', type: 'select', options: ['在线确认', '邮件确认', '钉钉/飞书'], default: '在线确认' },
    { label: '超时处理', type: 'select', options: ['自动通过', '自动拒绝', '升级审批'], default: '升级审批' },
  ],
  'e-sign': [
    { label: '签署模板', type: 'text', default: '' },
    { label: '签署方映射', type: 'text', default: 'party_a, party_b' },
    { label: '回调地址', type: 'text', default: '/api/callback/sign' },
    { label: '完成后动作', type: 'select', options: ['归档', '通知', '触发下一步'], default: '通知' },
  ],
  'notify': [
    { label: '通知方式', type: 'select', options: ['站内信', '邮件', '短信', '钉钉', '飞书'], default: '站内信' },
    { label: '接收人', type: 'text', default: '' },
    { label: '通知文案', type: 'textarea', default: '' },
    { label: '附带结果链接', type: 'switch', default: true },
  ],
  'condition': [
    { label: '条件表达式', type: 'text', default: 'result.risk_level' },
    { label: '高风险分支', type: 'text', default: '>=0.7' },
    { label: '低风险分支', type: 'text', default: '<0.7' },
  ],
  'content-gen': [
    { label: '内容类型', type: 'select', options: ['文章', '公告', '营销文案', '报告'], default: '文章' },
    { label: '风格', type: 'select', options: ['专业', '创意', '简洁', '正式'], default: '专业' },
    { label: 'Prompt', type: 'textarea', default: '' },
  ],
  'file-upload': [
    { label: '文件类型', type: 'select', options: ['PDF', 'Word', 'Excel', '任意'], default: '任意' },
    { label: '最大文件大小(MB)', type: 'text', default: '10' },
    { label: '输出变量', type: 'text', default: 'uploaded_file' },
  ],
  'image-input': [
    { label: '最大图片数', type: 'text', default: '6' },
    { label: '说明', type: 'textarea', default: '请在运行面板中上传图片，AI 节点将自动以多模态方式理解。' },
  ],
  'text-input': [
    { label: '绑定输入字段', type: 'text', default: '' },
    { label: '默认值', type: 'textarea', default: '' },
  ],
  'prompt-exec': [
    { label: 'Prompt 模板', type: 'textarea', default: '请基于上游内容给出结果：' },
  ],
  'db-query': [
    { label: '表名', type: 'select', options: ['tasks', 'contract_reviews', 'data_analyses', 'workflow_runs'], default: 'tasks' },
  ],
  'kb-search': [
    { label: '检索范围', type: 'select', options: ['全部', '合同', '数据'], default: '全部' },
  ],
  'n8n-trigger': [
    { label: 'Webhook URL', type: 'text', default: '' },
  ],
  'git-ci': [
    { label: '仓库', type: 'text', default: '' },
    { label: '分支', type: 'text', default: 'main' },
  ],
  'file-storage': [
    { label: 'Bucket', type: 'text', default: 'task-attachments' },
  ],
  'data-analysis': [
    { label: '分析维度', type: 'select', options: ['全面', '趋势', '异常', '预测'], default: '全面' },
  ],
  'compliance': [
    { label: '合规标准', type: 'select', options: ['GDPR', '个保法', 'SOC2', '内部规范'], default: '内部规范' },
  ],
  'risk-review': [
    { label: '风险类别', type: 'select', options: ['法律', '财务', '运营', '技术'], default: '法律' },
  ],
  'contract-gen': [
    { label: '合同类型', type: 'select', options: ['服务协议', '采购合同', '劳动合同', '保密协议'], default: '服务协议' },
  ],
  'human-approve': [
    { label: '确认人角色', type: 'select', options: ['法务', '财务', '业务负责人', '管理员'], default: '业务负责人' },
  ],
  'human-info': [
    { label: '需要补充的字段', type: 'text', default: '' },
  ],
};

// ─── Templates ───
interface WorkflowTemplate {
  name: string;
  desc: string;
  scene: string;
  nodeCount: number;
  nodes: Node[];
  edges: Edge[];
}

const makeEdge = (s: string, t: string): Edge => ({
  id: `e-${s}-${t}`, source: s, target: t, type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
  style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
});

const templates: WorkflowTemplate[] = [
  {
    name: '合同生成-审查-签署', desc: '完整的合同处理闭环流程', scene: '法务/合同管理', nodeCount: 9,
    nodes: [
      { id: 'n1', type: 'workflowNode', position: { x: 300, y: 0 }, data: { label: '开始', nodeType: 'start', icon: 'CirclePlay' } },
      { id: 'n2', type: 'workflowNode', position: { x: 300, y: 100 }, data: { label: '上传合同', nodeType: 'file-upload', icon: 'UploadCloud' } },
      { id: 'n3', type: 'workflowNode', position: { x: 300, y: 200 }, data: { label: '合同审查', nodeType: 'contract-review', icon: 'FileSearch' } },
      { id: 'n4', type: 'workflowNode', position: { x: 300, y: 300 }, data: { label: '风险判断', nodeType: 'condition', icon: 'GitBranch' } },
      { id: 'n5', type: 'workflowNode', position: { x: 100, y: 400 }, data: { label: '人工确认', nodeType: 'human-confirm', icon: 'UserCheck' } },
      { id: 'n6', type: 'workflowNode', position: { x: 300, y: 500 }, data: { label: '填充信息', nodeType: 'form-input', icon: 'FormInput' } },
      { id: 'n7', type: 'workflowNode', position: { x: 300, y: 600 }, data: { label: '电子签名', nodeType: 'e-sign', icon: 'FileSignature' } },
      { id: 'n8', type: 'workflowNode', position: { x: 300, y: 700 }, data: { label: '发送通知', nodeType: 'notify', icon: 'Bell' } },
      { id: 'n9', type: 'workflowNode', position: { x: 300, y: 800 }, data: { label: '结束', nodeType: 'end', icon: 'CircleStop' } },
    ],
    edges: [makeEdge('n1','n2'), makeEdge('n2','n3'), makeEdge('n3','n4'), makeEdge('n4','n5'), makeEdge('n4','n6'), makeEdge('n5','n6'), makeEdge('n6','n7'), makeEdge('n7','n8'), makeEdge('n8','n9')],
  },
  {
    name: '开发需求-代码-测试-通知', desc: '从需求到部署的完整开发流程', scene: '研发管理', nodeCount: 7,
    nodes: [
      { id: 'n1', type: 'workflowNode', position: { x: 300, y: 0 }, data: { label: '需求输入', nodeType: 'text-input', icon: 'FileText' } },
      { id: 'n2', type: 'workflowNode', position: { x: 300, y: 120 }, data: { label: 'AI 代码生成', nodeType: 'dify-agent', icon: 'Bot' } },
      { id: 'n3', type: 'workflowNode', position: { x: 300, y: 240 }, data: { label: '测试建议', nodeType: 'content-gen', icon: 'PenTool' } },
      { id: 'n4', type: 'workflowNode', position: { x: 300, y: 360 }, data: { label: 'CI/CD 触发', nodeType: 'git-ci', icon: 'GitCommit' } },
      { id: 'n5', type: 'workflowNode', position: { x: 300, y: 480 }, data: { label: '通知', nodeType: 'notify', icon: 'Bell' } },
    ],
    edges: [makeEdge('n1','n2'), makeEdge('n2','n3'), makeEdge('n3','n4'), makeEdge('n4','n5')],
  },
  {
    name: '内容生成-审核-发布', desc: '内容创作到多平台发布流程', scene: '内容运营', nodeCount: 6,
    nodes: [
      { id: 'n1', type: 'workflowNode', position: { x: 300, y: 0 }, data: { label: '主题输入', nodeType: 'text-input', icon: 'FileText' } },
      { id: 'n2', type: 'workflowNode', position: { x: 300, y: 120 }, data: { label: 'AI 生成内容', nodeType: 'content-gen', icon: 'PenTool' } },
      { id: 'n3', type: 'workflowNode', position: { x: 300, y: 240 }, data: { label: '合规审查', nodeType: 'compliance', icon: 'ShieldCheck' } },
      { id: 'n4', type: 'workflowNode', position: { x: 300, y: 360 }, data: { label: '人工审批', nodeType: 'human-approve', icon: 'ClipboardCheck' } },
      { id: 'n5', type: 'workflowNode', position: { x: 300, y: 480 }, data: { label: '发布通知', nodeType: 'notify', icon: 'Bell' } },
    ],
    edges: [makeEdge('n1','n2'), makeEdge('n2','n3'), makeEdge('n3','n4'), makeEdge('n4','n5')],
  },
  {
    name: '财务上传-分析-预警', desc: '财务数据分析与风险预警', scene: '财务管理', nodeCount: 5,
    nodes: [
      { id: 'n1', type: 'workflowNode', position: { x: 300, y: 0 }, data: { label: '上传财务数据', nodeType: 'file-upload', icon: 'UploadCloud' } },
      { id: 'n2', type: 'workflowNode', position: { x: 300, y: 120 }, data: { label: '数据分析', nodeType: 'data-analysis', icon: 'Database' } },
      { id: 'n3', type: 'workflowNode', position: { x: 300, y: 240 }, data: { label: '风险审查', nodeType: 'risk-review', icon: 'ShieldCheck' } },
      { id: 'n4', type: 'workflowNode', position: { x: 300, y: 360 }, data: { label: '预警通知', nodeType: 'notify', icon: 'Bell' } },
    ],
    edges: [makeEdge('n1','n2'), makeEdge('n2','n3'), makeEdge('n3','n4')],
  },
];

// ─── Main Component ───
const Workflow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const nodeTypes = useMemo(() => ({ workflowNode: WorkflowNode }), []);

  // State
  const [workflowName, setWorkflowName] = useState('合同处理闭环');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [version, setVersion] = useState('v1.0');
  const [lastSaved, setLastSaved] = useState('未保存');
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, Record<string, any>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(nodeCategories.map(c => [c.label, true]))
  );
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'my' | 'templates'>('templates');
  const [myWorkflows, setMyWorkflows] = useState<any[]>([]);
  const [templateWorkflows, setTemplateWorkflows] = useState<any[]>([]);
  const [templateFilter, setTemplateFilter] = useState<string>('全部');
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [showRunResult, setShowRunResult] = useState(false);
  const [runHistory, setRunHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [runMode, setRunMode] = useState<'text' | 'files' | 'images'>('text');
  const [runFiles, setRunFiles] = useState<File[]>([]);
  const [runImages, setRunImages] = useState<Array<{ name: string; dataUrl: string; size: number }>>([]);
  const [batchResults, setBatchResults] = useState<Array<{ name: string; result: any; error?: string }>>([]);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [parallel, setParallel] = useState(3);
  const [showSchema, setShowSchema] = useState(false);
  const [ioSchema, setIoSchema] = useState<{ input: any[]; output: any[] }>({ input: [], output: [] });

  // React Flow
  const defaultTemplate = templates[0];
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultTemplate.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultTemplate.edges);

  // Load workflows from DB on mount / when library opens
  const loadLibrary = useCallback(async () => {
    if (!user) return;
    const [myRes, tplRes] = await Promise.all([
      supabase.from('workflows').select('*').eq('user_id', user.id).eq('is_template', false).order('updated_at', { ascending: false }),
      supabase.from('workflows').select('*').eq('is_template', true).order('title'),
    ]);
    if (myRes.data) setMyWorkflows(myRes.data);
    if (tplRes.data) setTemplateWorkflows(tplRes.data);
  }, [user]);

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  // Load run history when dialog opens
  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('workflow_runs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) setRunHistory(data);
  }, [user]);

  const onConnect = useCallback((c: Connection) => {
    setEdges(eds => addEdge({
      ...c, type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  // ID counter
  const idCounter = useRef(100);
  const getNextId = () => `n${++idCounter.current}`;

  // Add node to canvas
  const addNode = (type: string) => {
    const item = allNodeItems.find(i => i.type === type);
    if (!item) return;
    const id = getNextId();
    const newNode: Node = {
      id, type: 'workflowNode',
      position: { x: 250 + Math.random() * 100, y: 200 + Math.random() * 200 },
      data: { label: item.label, nodeType: type, icon: type },
    };
    setNodes(nds => [...nds, newNode]);
  };

  // Apply local template
  const applyTemplate = (t: WorkflowTemplate) => {
    setNodes(t.nodes);
    setEdges(t.edges);
    setWorkflowName(t.name);
    setWorkflowId(null);
    setShowLibrary(false);
    toast({ title: '模板已应用', description: `已加载「${t.name}」` });
  };

  // Load workflow from DB (template or own)
  const loadWorkflow = (wf: any, asNew = false) => {
    const g = wf.graph || { nodes: [], edges: [], configs: {} };
    // Restore edge styling
    const styledEdges = (g.edges || []).map((e: any) => ({
      ...e, type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    }));
    setNodes(g.nodes || []);
    setEdges(styledEdges);
    setNodeConfigs(g.configs || {});
    setIoSchema(g.io_schema || { input: [], output: [] });
    setWorkflowName(asNew ? `${wf.title} 副本` : wf.title);
    setWorkflowDesc(wf.description || '');
    setWorkflowId(asNew ? null : wf.id);
    setStatus(wf.status === 'published' ? 'published' : 'draft');
    setShowLibrary(false);
    toast({ title: asNew ? '已派生副本' : '已加载', description: wf.title });
  };

  // New empty workflow
  const newWorkflow = () => {
    setNodes([
      { id: 'n1', type: 'workflowNode', position: { x: 300, y: 50 }, data: { label: '开始', nodeType: 'start', icon: 'CirclePlay' } },
      { id: 'n2', type: 'workflowNode', position: { x: 300, y: 200 }, data: { label: '结束', nodeType: 'end', icon: 'CircleStop' } },
    ]);
    setEdges([]);
    setNodeConfigs({});
    setIoSchema({ input: [], output: [] });
    setWorkflowName('未命名工作流');
    setWorkflowDesc('');
    setWorkflowId(null);
    setStatus('draft');
    setShowLibrary(false);
  };

  // Save workflow to DB
  const handleSave = async () => {
    if (!user) { toast({ title: '请先登录', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: workflowName,
      description: workflowDesc,
      category: '自建',
      scene: '自定义',
      node_count: nodes.length,
      status,
      version,
      is_template: false,
      graph: { nodes, edges, configs: nodeConfigs, io_schema: ioSchema } as any,
    };
    let res;
    if (workflowId) {
      res = await supabase.from('workflows').update(payload).eq('id', workflowId).select().single();
    } else {
      res = await supabase.from('workflows').insert(payload).select().single();
      if (res.data) setWorkflowId(res.data.id);
    }
    setSaving(false);
    if (res.error) {
      toast({ title: '保存失败', description: res.error.message, variant: 'destructive' });
    } else {
      setLastSaved(new Date().toLocaleTimeString());
      toast({ title: '已保存到工作流仓库', description: workflowName });
      loadLibrary();
    }
  };

  const handlePublish = async () => {
    if (ioSchema.input.length === 0) {
      toast({ title: '请先定义输入参数', description: '已发布的工作流需要至少一个输入字段，才能被智能体调用', variant: 'destructive' });
      setShowSchema(true);
      return;
    }
    setStatus('published');
    await handleSave();
    toast({ title: '已发布', description: workflowName });
  };

  const handleRun = () => {
    setRunResult(null);
    setShowRunDialog(true);
  };

  const executeRun = async () => {
    if (!user) return;
    setRunning(true);
    setRunResult(null);
    setBatchResults([]);

    // ── Batch file mode ──
    if (runMode === 'files' && runFiles.length > 0) {
      const files = [...runFiles];
      setBatchProgress({ done: 0, total: files.length });
      const results: Array<{ name: string; result: any; error?: string }> = [];

      const runOne = async (file: File) => {
        try {
          const text = await extractTextFromFile(file);
          const { data, error } = await supabase.functions.invoke('run-workflow', {
            body: {
              graph: { nodes, edges, configs: nodeConfigs },
              input: text,
              workflowName: `${workflowName} · ${file.name}`,
              workflowId,
              userId: user.id,
            },
          });
          if (error) throw error;
          await supabase.from('workflow_runs').insert({
            user_id: user.id,
            workflow_id: workflowId,
            workflow_name: `${workflowName} · ${file.name}`,
            status: data.status || 'completed',
            input: { file: file.name, size: file.size },
            output: data.output ? { result: data.output } : null,
            steps: data.steps || [],
            error: data.error || null,
            duration_ms: data.duration_ms,
          });
          results.push({ name: file.name, result: data });
        } catch (e: any) {
          results.push({ name: file.name, result: null, error: e.message });
        } finally {
          setBatchProgress(p => ({ ...p, done: p.done + 1 }));
        }
      };

      // simple concurrency pool
      const pool = Math.max(1, Math.min(parallel, 5));
      let cursor = 0;
      const workers = Array.from({ length: pool }, async () => {
        while (cursor < files.length) {
          const idx = cursor++;
          await runOne(files[idx]);
          setBatchResults([...results]);
        }
      });
      await Promise.all(workers);
      setBatchResults([...results]);
      const okCount = results.filter(r => !r.error && r.result?.status === 'completed').length;
      toast({
        title: `批量运行完成`,
        description: `${okCount}/${files.length} 成功`,
        variant: okCount === files.length ? 'default' : 'destructive',
      });
      setRunning(false);
      return;
    }

    // ── Single text mode ──
    try {
      const { data, error } = await supabase.functions.invoke('run-workflow', {
        body: {
          graph: { nodes, edges, configs: nodeConfigs },
          input: testInput,
          images: runImages.map(i => ({ name: i.name, dataUrl: i.dataUrl })),
          workflowName,
          workflowId,
          userId: user.id,
        },
      });
      if (error) throw error;
      setRunResult(data);
      // persist
      await supabase.from('workflow_runs').insert({
        user_id: user.id,
        workflow_id: workflowId,
        workflow_name: workflowName,
        status: data.status || 'completed',
        input: { text: testInput },
        output: data.output ? { result: data.output } : null,
        steps: data.steps || [],
        error: data.error || null,
        duration_ms: data.duration_ms,
      });
      toast({
        title: data.status === 'completed' ? '运行完成' : '运行失败',
        description: `${data.steps?.length || 0} 个节点 · ${data.duration_ms}ms`,
        variant: data.status === 'completed' ? 'default' : 'destructive',
      });
    } catch (e: any) {
      toast({ title: '运行错误', description: e.message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  const deleteMyWorkflow = async (id: string) => {
    await supabase.from('workflows').delete().eq('id', id);
    setMyWorkflows(myWorkflows.filter(w => w.id !== id));
    if (workflowId === id) setWorkflowId(null);
    toast({ title: '已删除' });
  };

  const duplicateMyWorkflow = async (wf: any) => {
    if (!user) return;
    const { data, error } = await supabase.from('workflows').insert({
      user_id: user.id, title: `${wf.title} 副本`, description: wf.description,
      category: wf.category, scene: wf.scene, node_count: wf.node_count,
      is_template: false, graph: wf.graph, status: 'draft', version: 'v1.0',
    }).select().single();
    if (!error && data) { setMyWorkflows([data, ...myWorkflows]); toast({ title: '已复制' }); }
  };

  const handleExport = () => {
    const data = JSON.stringify({ name: workflowName, version, nodes, edges, configs: nodeConfigs }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${workflowName}.json`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: '已导出', description: 'JSON 配置已下载' });
  };

  // Config update
  const updateConfig = (key: string, value: any) => {
    if (!selectedNode) return;
    setNodeConfigs(prev => ({
      ...prev,
      [selectedNode.id]: { ...(prev[selectedNode.id] || {}), [key]: value },
    }));
  };

  const currentConfig = selectedNode ? (nodeConfigs[selectedNode.id] || {}) : {};
  const currentSchema = selectedNode ? nodeConfigSchemas[(selectedNode.data as any).nodeType] : undefined;

  // Filter nodes by search
  const filteredCategories = nodeCategories.map(c => ({
    ...c,
    items: c.items.filter(i =>
      !searchQuery || i.label.includes(searchQuery) || i.desc.includes(searchQuery)
    ),
  })).filter(c => c.items.length > 0);

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Top Toolbar ─── */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground">工作流编排</h1>
          <span className="text-xs text-muted-foreground">/</span>
          <Input
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            className="h-7 w-40 text-xs bg-transparent border-none focus-visible:ring-1 px-1"
          />
          <Badge variant={status === 'draft' ? 'secondary' : 'default'} className="text-[10px]">
            {status === 'draft' ? '草稿' : '已发布'}
          </Badge>
          {workflowId && <span className="text-[10px] text-muted-foreground">已入库</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={newWorkflow}>
            <Plus size={14} /> 新建
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowLibrary(true); loadLibrary(); }}>
            <FolderOpen size={14} /> 仓库
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowHistory(true); loadHistory(); }}>
            <History size={14} /> 运行记录
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowSchema(true)}>
            <Code2 size={14} /> Schema
            {ioSchema.input.length + ioSchema.output.length > 0 && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-0.5">{ioSchema.input.length}/{ioSchema.output.length}</Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 保存
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleRun}>
            <Play size={14} /> 运行测试
          </Button>
          <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={handlePublish}>
            <Upload size={14} /> 发布
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <span className="text-[10px] text-muted-foreground">{version}</span>
          <span className="text-[10px] text-muted-foreground">· {lastSaved}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExport}>
            <Download size={14} />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left: Node Panel ─── */}
        <div className="w-60 border-r border-border bg-card/50 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索节点..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredCategories.map(cat => (
              <div key={cat.label}>
                <button
                  onClick={() => setExpandedCategories(p => ({ ...p, [cat.label]: !p[cat.label] }))}
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedCategories[cat.label] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {cat.label}
                  <span className="text-[10px] ml-auto opacity-50">{cat.items.length}</span>
                </button>
                {expandedCategories[cat.label] && (
                  <div className="space-y-0.5 ml-1">
                    {cat.items.map(item => (
                      <button
                        key={item.type}
                        onClick={() => addNode(item.type)}
                        className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs hover:bg-accent transition-colors border border-transparent hover:border-border group cursor-grab`}
                      >
                        <item.icon size={14} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                        <div className="text-left">
                          <div className="text-foreground font-medium text-[11px]">{item.label}</div>
                          <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Center: Canvas ─── */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
              style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
            <Controls className="!bg-card !border-border !shadow-sm [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-accent" />
            <MiniMap
              className="!bg-card !border-border"
              nodeColor={() => 'hsl(var(--primary))'}
              maskColor="hsl(var(--background) / 0.8)"
            />
          </ReactFlow>
        </div>

        {/* ─── Right: Config Panel ─── */}
        <div className={`border-l border-border bg-card/50 shrink-0 overflow-hidden transition-all duration-200 ${selectedNode ? 'w-72' : 'w-0'}`}>
          {selectedNode && (
            <div className="w-72 h-full flex flex-col">
              <div className="h-12 border-b border-border flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">节点配置</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={deleteSelectedNode}>
                    <Trash2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedNode(null)}>
                    <X size={14} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Common fields */}
                <div className="space-y-2">
                  <Label className="text-[11px] text-muted-foreground">节点名称</Label>
                  <Input
                    value={(selectedNode.data as any).label}
                    onChange={e => {
                      setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: e.target.value } } : n));
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value } });
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] text-muted-foreground">节点类型</Label>
                  <div className="text-xs text-foreground bg-muted/50 rounded-md px-3 py-2">
                    {(selectedNode.data as any).nodeType}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] text-muted-foreground">节点说明</Label>
                  <Textarea
                    value={currentConfig['__desc'] || ''}
                    onChange={e => updateConfig('__desc', e.target.value)}
                    placeholder="描述此节点的作用..."
                    className="text-xs min-h-[60px]"
                  />
                </div>

                {/* Separator */}
                {currentSchema && <div className="border-t border-border pt-3">
                  <span className="text-[11px] font-medium text-muted-foreground">专属配置</span>
                </div>}

                {/* Type-specific fields */}
                {currentSchema?.map(field => (
                  <div key={field.label} className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
                    {field.type === 'text' && (
                      <Input
                        value={currentConfig[field.label] ?? field.default ?? ''}
                        onChange={e => updateConfig(field.label, e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <Textarea
                        value={currentConfig[field.label] ?? field.default ?? ''}
                        onChange={e => updateConfig(field.label, e.target.value)}
                        className="text-xs min-h-[60px]"
                      />
                    )}
                    {field.type === 'select' && (
                      <Select
                        value={currentConfig[field.label] ?? field.default}
                        onValueChange={v => updateConfig(field.label, v)}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {field.options?.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === 'switch' && (
                      <Switch
                        checked={currentConfig[field.label] ?? field.default ?? false}
                        onCheckedChange={v => updateConfig(field.label, v)}
                      />
                    )}
                  </div>
                ))}

                {/* Common footer fields */}
                <div className="border-t border-border pt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">错误处理</Label>
                    <Select value={currentConfig['__errorHandle'] || 'stop'} onValueChange={v => updateConfig('__errorHandle', v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stop" className="text-xs">停止流程</SelectItem>
                        <SelectItem value="skip" className="text-xs">跳过节点</SelectItem>
                        <SelectItem value="retry" className="text-xs">重试</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">重试次数</Label>
                    <Input
                      type="number"
                      value={currentConfig['__retries'] ?? 3}
                      onChange={e => updateConfig('__retries', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Library Dialog: My Repo + Template Market ─── */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <FolderOpen size={18} className="text-primary" /> 工作流仓库
            </DialogTitle>
          </DialogHeader>
          <Tabs value={libraryTab} onValueChange={(v) => setLibraryTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-fit">
              <TabsTrigger value="my" className="text-xs gap-1.5">
                <FolderOpen size={12} /> 我的工作流
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{myWorkflows.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs gap-1.5">
                <LayoutTemplate size={12} /> 模板市场
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{templateWorkflows.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my" className="flex-1 overflow-y-auto mt-3">
              {myWorkflows.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  仓库还是空的。设计完后点击「保存」即可入库。
                  <div className="mt-3"><Button size="sm" variant="outline" onClick={newWorkflow}><Plus size={12} className="mr-1" /> 新建工作流</Button></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myWorkflows.map(wf => (
                    <div key={wf.id} className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all group relative">
                      <button onClick={() => loadWorkflow(wf)} className="block w-full text-left">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{wf.title}</div>
                            <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{wf.description || '（无描述）'}</div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">{wf.node_count} 节点</Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">{wf.status === 'published' ? '已发布' : '草稿'}</Badge>
                          <span>{wf.version}</span>
                          <span>· {new Date(wf.updated_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); duplicateMyWorkflow(wf); }}>
                          <Copy size={12} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMyWorkflow(wf.id); }}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="flex-1 overflow-y-auto mt-3 space-y-3">
              {/* Category filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['全部', ...Array.from(new Set(templateWorkflows.map(t => t.category).filter(Boolean)))].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTemplateFilter(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      templateFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {templateWorkflows
                  .filter(t => templateFilter === '全部' || t.category === templateFilter)
                  .map(t => (
                    <button
                      key={t.id}
                      onClick={() => loadWorkflow(t, true)}
                      className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold group-hover:text-primary transition-colors">{t.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.description}</div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">{t.node_count} 节点</Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{t.scene}</Badge>
                        {(t.tags || []).slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                            <Tag size={8} />{tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ─── Run Dialog ─── */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play size={16} className="text-primary" /> 运行工作流
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 overflow-y-auto flex-1">
            <Tabs value={runMode} onValueChange={(v) => setRunMode(v as any)}>
              <TabsList className="w-fit">
                <TabsTrigger value="text" className="text-xs gap-1.5"><FileText size={12} /> 文本输入</TabsTrigger>
                <TabsTrigger value="files" className="text-xs gap-1.5"><UploadCloud size={12} /> 批量文件 {runFiles.length > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{runFiles.length}</Badge>}</TabsTrigger>
                <TabsTrigger value="images" className="text-xs gap-1.5"><ImageIcon size={12} /> 图片 {runImages.length > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">{runImages.length}</Badge>}</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-3">
                <Label className="text-xs text-muted-foreground">输入测试数据（文本 / 提示词 / JSON）</Label>
                <Textarea
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  placeholder="例如：审查这份服务协议中关于违约责任的条款..."
                  className="text-xs min-h-[100px] font-mono mt-2"
                  disabled={running}
                />
                {runImages.length > 0 && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    已附带 {runImages.length} 张图片，将随文本一起发给所有 AI 节点（多模态）。
                  </div>
                )}
              </TabsContent>
              <TabsContent value="images" className="mt-3 space-y-3">
                <Label className="text-xs text-muted-foreground">
                  上传图片（PNG / JPG / WebP），AI 节点将自动以多模态方式理解并结合文本输入回答
                </Label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all">
                  <ImageIcon size={28} className="text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    点击选择图片（可多选） · 已选 <span className="text-foreground font-medium">{runImages.length}</span> 张
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={running}
                    onChange={async e => {
                      const fs = Array.from(e.target.files || []);
                      const loaded = await Promise.all(fs.map(f => new Promise<{ name: string; dataUrl: string; size: number }>((resolve, reject) => {
                        if (f.size > 8 * 1024 * 1024) { reject(new Error(`${f.name} 超过 8MB`)); return; }
                        const r = new FileReader();
                        r.onload = () => resolve({ name: f.name, dataUrl: String(r.result), size: f.size });
                        r.onerror = () => reject(r.error);
                        r.readAsDataURL(f);
                      }))).catch(err => { toast({ title: '加载失败', description: err.message, variant: 'destructive' }); return []; });
                      setRunImages(prev => [...prev, ...loaded].slice(0, 10));
                      e.target.value = '';
                    }}
                  />
                </label>
                {runImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {runImages.map((img, i) => (
                      <div key={`${img.name}-${i}`} className="relative group rounded-lg overflow-hidden border border-border bg-card">
                        <img src={img.dataUrl} alt={img.name} className="w-full h-24 object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur px-1.5 py-0.5 text-[10px] truncate">{img.name}</div>
                        {!running && (
                          <button
                            onClick={() => setRunImages(rs => rs.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 bg-background/80 backdrop-blur rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          ><X size={10} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground">
                  提示：图片会作为多模态输入随文本一起发给所有 AI 节点（Gemini 2.5 Flash 支持视觉理解）。也可切回"文本输入"标签同时填文本，图片仍会附带。
                </div>
              </TabsContent>
              <TabsContent value="files" className="mt-3 space-y-3">
                <Label className="text-xs text-muted-foreground">
                  批量上传 PDF / Word(.docx) / 文本文件（如简历、合同、报告等），每个文件会单独跑一遍工作流
                </Label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all">
                  <UploadCloud size={28} className="text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    点击或拖入文件（支持多选） · 已选 <span className="text-foreground font-medium">{runFiles.length}</span> 个
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="hidden"
                    disabled={running}
                    onChange={e => {
                      const fs = Array.from(e.target.files || []);
                      setRunFiles(prev => [...prev, ...fs].slice(0, 50));
                      e.target.value = '';
                    }}
                  />
                </label>
                {runFiles.length > 0 && (
                  <div className="space-y-1 max-h-[180px] overflow-y-auto">
                    {runFiles.map((f, i) => {
                      const r = batchResults.find(b => b.name === f.name);
                      return (
                        <div key={`${f.name}-${i}`} className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded border border-border bg-card">
                          <FileText size={12} className="text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                          {r ? (
                            r.error
                              ? <Badge variant="destructive" className="text-[10px] h-4">失败</Badge>
                              : <Badge className="text-[10px] h-4 bg-status-success/20 text-status-success border-status-success/30">{r.result?.status === 'completed' ? '完成' : '失败'}</Badge>
                          ) : running ? <Loader2 size={12} className="animate-spin text-muted-foreground" /> : null}
                          {!running && (
                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setRunFiles(rf => rf.filter((_, j) => j !== i))}>
                              <X size={10} />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Label className="text-[11px] text-muted-foreground">并发数</Label>
                  <Select value={String(parallel)} onValueChange={v => setParallel(Number(v))} disabled={running}>
                    <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5].map(n => <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {runFiles.length > 0 && !running && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => { setRunFiles([]); setBatchResults([]); }}>
                      清空
                    </Button>
                  )}
                </div>
                {running && batchProgress.total > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>进度</span>
                      <span className="font-mono">{batchProgress.done} / {batchProgress.total}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${(batchProgress.done / batchProgress.total) * 100}%` }} />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Batch results */}
            {batchResults.length > 0 && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="text-xs font-medium">批量结果（{batchResults.filter(r => !r.error && r.result?.status === 'completed').length}/{batchResults.length} 成功）</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {batchResults.map((r, i) => (
                    <details key={i} className="rounded-lg border border-border bg-card">
                      <summary className="cursor-pointer px-3 py-2 text-xs font-medium flex items-center gap-2">
                        {r.error || r.result?.status !== 'completed'
                          ? <AlertTriangle size={12} className="text-destructive" />
                          : <CheckCircle2 size={12} className="text-status-success" />}
                        <span className="truncate flex-1">{r.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{r.result?.duration_ms ?? 0}ms</span>
                      </summary>
                      <div className="px-3 pb-2 space-y-1.5 border-t border-border">
                        {r.error && <div className="text-xs text-destructive py-2">{r.error}</div>}
                        {r.result?.steps?.map((s: any, j: number) => (
                          <div key={j} className={`p-2 rounded text-[11px] ${s.status === 'success' ? 'bg-status-success/5 border border-status-success/10' : 'bg-destructive/5 border border-destructive/10'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{s.label} <span className="text-muted-foreground font-mono text-[10px]">[{s.nodeType}]</span></span>
                              <span className="text-muted-foreground font-mono text-[10px]">{s.duration_ms}ms</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{s.output}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {runResult && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-1.5">
                    {runResult.status === 'completed'
                      ? <CheckCircle2 size={14} className="text-status-success" />
                      : <AlertTriangle size={14} className="text-destructive" />}
                    执行 {runResult.status === 'completed' ? '完成' : '失败'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{runResult.duration_ms}ms · {runResult.steps?.length || 0} 节点</span>
                </div>
                {runResult.error && (
                  <div className="text-xs bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">{runResult.error}</div>
                )}
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                  {runResult.steps?.map((s: any, i: number) => (
                    <div key={i} className={`p-2.5 rounded-lg border text-xs ${
                      s.status === 'success' ? 'border-status-success/20 bg-status-success/5' : 'border-destructive/20 bg-destructive/5'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium flex items-center gap-1.5">
                          {s.status === 'success' ? <CheckCircle2 size={12} className="text-status-success" /> : <AlertTriangle size={12} className="text-destructive" />}
                          {s.label} <span className="text-[10px] text-muted-foreground font-mono">[{s.nodeType}]</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{s.duration_ms}ms</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{s.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowRunDialog(false)}>关闭</Button>
            <Button size="sm" className="gap-1" onClick={executeRun} disabled={running || (runMode === 'files' && runFiles.length === 0) || (runMode === 'images' && runImages.length === 0 && !testInput)}>
              {running
                ? <><Loader2 size={14} className="animate-spin" /> 执行中...</>
                : <><Play size={14} /> {runMode === 'files' ? `批量运行 ${runFiles.length} 个文件` : runMode === 'images' ? `带 ${runImages.length} 张图运行` : '开始运行'}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Run History Dialog ─── */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={16} className="text-primary" /> 运行历史
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 overflow-y-auto py-2">
            {runHistory.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">暂无运行记录</p>
            )}
            {runHistory.map(r => (
              <div key={r.id} className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {r.status === 'completed' ? <CheckCircle2 size={14} className="text-status-success" /> : <AlertTriangle size={14} className="text-destructive" />}
                    {r.workflow_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{r.duration_ms}ms · {new Date(r.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{(r.steps as any[])?.length || 0} 节点 · {r.error || r.output?.result || '完成'}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── IO Schema Dialog ─── */}
      <Dialog open={showSchema} onOpenChange={setShowSchema}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 size={16} className="text-primary" /> 输入 / 输出 Schema
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              定义工作流的结构化输入参数和输出字段。智能体调用工作流时会严格按此 schema 传参；输入节点可通过「绑定输入字段」消费指定参数。
            </p>
          </DialogHeader>

          <Tabs defaultValue="input" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-fit">
              <TabsTrigger value="input" className="text-xs">输入参数 ({ioSchema.input.length})</TabsTrigger>
              <TabsTrigger value="output" className="text-xs">输出字段 ({ioSchema.output.length})</TabsTrigger>
            </TabsList>

            {(['input', 'output'] as const).map((kind) => (
              <TabsContent key={kind} value={kind} className="flex-1 overflow-y-auto mt-3 space-y-2">
                {ioSchema[kind].length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    暂无{kind === 'input' ? '输入参数' : '输出字段'}，点击下方按钮添加
                  </div>
                )}
                {ioSchema[kind].map((f: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end p-2.5 rounded-lg border border-border bg-card">
                    <div className="col-span-3">
                      <Label className="text-[10px] text-muted-foreground">字段名</Label>
                      <Input value={f.name || ''} placeholder="contract_text"
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, '_');
                          setIoSchema((s) => ({ ...s, [kind]: s[kind].map((x: any, j: number) => j === i ? { ...x, name: v } : x) }));
                        }}
                        className="h-7 text-xs mt-1 font-mono" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px] text-muted-foreground">类型</Label>
                      <Select value={f.type || 'string'}
                        onValueChange={(v) => setIoSchema((s) => ({ ...s, [kind]: s[kind].map((x: any, j: number) => j === i ? { ...x, type: v } : x) }))}>
                        <SelectTrigger className="h-7 text-xs mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string" className="text-xs">string</SelectItem>
                          <SelectItem value="number" className="text-xs">number</SelectItem>
                          <SelectItem value="boolean" className="text-xs">boolean</SelectItem>
                          <SelectItem value="enum" className="text-xs">enum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-5">
                      <Label className="text-[10px] text-muted-foreground">描述</Label>
                      <Input value={f.desc || ''} placeholder="合同正文"
                        onChange={(e) => setIoSchema((s) => ({ ...s, [kind]: s[kind].map((x: any, j: number) => j === i ? { ...x, desc: e.target.value } : x) }))}
                        className="h-7 text-xs mt-1" />
                    </div>
                    {kind === 'input' ? (
                      <div className="col-span-1 flex items-center justify-center pt-4">
                        <Switch checked={!!f.required}
                          onCheckedChange={(v) => setIoSchema((s) => ({ ...s, input: s.input.map((x: any, j: number) => j === i ? { ...x, required: v } : x) }))} />
                        <Label className="text-[9px] text-muted-foreground ml-1">必填</Label>
                      </div>
                    ) : <div className="col-span-1" />}
                    <div className="col-span-1 flex justify-end pt-4">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                        onClick={() => setIoSchema((s) => ({ ...s, [kind]: s[kind].filter((_: any, j: number) => j !== i) }))}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                    {f.type === 'enum' && (
                      <div className="col-span-12">
                        <Label className="text-[10px] text-muted-foreground">枚举值（逗号分隔）</Label>
                        <Input value={(f.values || []).join(',')} placeholder="low,mid,high"
                          onChange={(e) => setIoSchema((s) => ({ ...s, [kind]: s[kind].map((x: any, j: number) => j === i ? { ...x, values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) } : x) }))}
                          className="h-7 text-xs mt-1 font-mono" />
                      </div>
                    )}
                  </div>
                ))}
                <Button size="sm" variant="outline" className="w-full gap-1 h-8 text-xs"
                  onClick={() => setIoSchema((s) => ({ ...s, [kind]: [...s[kind], { name: `${kind === 'input' ? 'param' : 'output'}_${s[kind].length + 1}`, type: 'string', required: kind === 'input' }] }))}>
                  <Plus size={12} /> 添加{kind === 'input' ? '输入参数' : '输出字段'}
                </Button>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowSchema(false)}>关闭</Button>
            <Button size="sm" onClick={() => { setShowSchema(false); toast({ title: 'Schema 已暂存', description: '点击「保存」入库后生效' }); }}>完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workflow;
