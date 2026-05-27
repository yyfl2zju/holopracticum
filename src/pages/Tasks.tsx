import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Paperclip,
  Sparkles,
  FileCheck,
  Code,
  PenTool,
  BarChart3,
  Workflow,
  ArrowRight,
  Clock,
  Filter,
  Search,
  X,
  Upload,
  Play,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { taskStatusConfig, taskTypeConfig } from '@/data/mock';
import type { TaskType } from '@/types/platform';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const taskTypeIcons: Record<string, React.ElementType> = {
  contract: FileCheck,
  dev: Code,
  content: PenTool,
  data: BarChart3,
  workflow: Workflow,
};

const suggestedPrompts = [
  { text: '审查这份劳动合同的风险条款', type: 'contract' as TaskType },
  { text: '根据需求文档生成 API 代码', type: 'dev' as TaskType },
  { text: '为新品发布撰写小红书推广文案', type: 'content' as TaskType },
  { text: '分析本季度销售数据并生成报告', type: 'data' as TaskType },
];

const recommendedFlows = [
  {
    id: 'flow-1',
    title: '合同全流程',
    steps: ['上传合同', 'AI 风险审查', '生成修改建议', '导出报告'],
    type: 'contract' as TaskType,
  },
  {
    id: 'flow-2',
    title: '需求转代码',
    steps: ['输入需求', '代码生成', '测试建议', 'CI 配置'],
    type: 'dev' as TaskType,
  },
  {
    id: 'flow-3',
    title: '内容生产线',
    steps: ['主题输入', '文案生成', '合规检查', '多平台分发'],
    type: 'content' as TaskType,
  },
];

type FilterStatus = 'all' | 'running' | 'completed' | 'failed';

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{
    id: string; file_name: string; file_path: string; file_size: number;
  }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detectedType, setDetectedType] = useState<TaskType | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Array<{
    id: string; title: string; type: string; status: string;
    input_summary: string | null; created_at: string;
  }>>([]);
  const [runningId, setRunningId] = useState<string | null>(null);

  const loadTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .select('id,title,type,status,input_summary,created_at')
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const handleRun = async (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRunningId(taskId);
    const { error } = await supabase.functions.invoke('run-task', { body: { task_id: taskId } });
    setRunningId(null);
    if (error) {
      toast({ title: '运行失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '任务已完成' });
    }
    loadTasks();
  };

  useEffect(() => { loadTasks(); }, [user]);

  // Simulate type detection on input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.includes('合同') || value.includes('审查')) setDetectedType('contract');
    else if (value.includes('代码') || value.includes('API') || value.includes('需求')) setDetectedType('dev');
    else if (value.includes('文案') || value.includes('推广') || value.includes('内容')) setDetectedType('content');
    else if (value.includes('数据') || value.includes('分析') || value.includes('报表')) setDetectedType('data');
    else if (value.includes('流程') || value.includes('自动化')) setDetectedType('workflow');
    else setDetectedType(null);
  };

  const handleFileAttach = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          toast({ title: '文件过大', description: `${file.name} 超过 20MB`, variant: 'destructive' });
          continue;
        }
        const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from('task-attachments')
          .upload(path, file, { contentType: file.type });
        if (upErr) {
          toast({ title: '上传失败', description: upErr.message, variant: 'destructive' });
          continue;
        }
        const { data, error: insErr } = await supabase
          .from('task_attachments')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type,
          })
          .select('id,file_name,file_path,file_size')
          .single();
        if (insErr || !data) {
          toast({ title: '保存记录失败', description: insErr?.message, variant: 'destructive' });
          continue;
        }
        setAttachedFiles((prev) => [...prev, data]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = async (index: number) => {
    const file = attachedFiles[index];
    if (!file) return;
    await supabase.storage.from('task-attachments').remove([file.file_path]);
    await supabase.from('task_attachments').delete().eq('id', file.id);
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || !user) return;
    const { data: taskData, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: inputValue.slice(0, 60),
      type: detectedType ?? 'data',
      status: 'queued',
      input_summary: inputValue,
    }).select('id').single();
    if (error) {
      toast({ title: '创建失败', description: error.message, variant: 'destructive' });
      return;
    }
    // Link attachments to the new task
    if (taskData && attachedFiles.length > 0) {
      await supabase
        .from('task_attachments')
        .update({ task_id: taskData.id })
        .in('id', attachedFiles.map((f) => f.id));
    }
    toast({ title: '任务已创建' });
    setInputValue('');
    setAttachedFiles([]);
    setDetectedType(null);
    loadTasks();
  };

  const handlePromptClick = (prompt: string) => {
    handleInputChange(prompt);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'running' && ['planning', 'running', 'validating', 'queued'].includes(task.status)) ||
      (filterStatus === 'completed' && task.status === 'completed') ||
      (filterStatus === 'failed' && task.status === 'failed');
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.input_summary ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">智能任务中心</h1>
        <p className="text-sm text-muted-foreground mt-1">
          描述你的需求，AI Agent 自动识别任务类型并推荐最佳执行方案
        </p>
      </div>

      {/* Task Input Area */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {/* Main textarea */}
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="描述你的任务需求，例如：帮我审查这份劳动合同中的风险条款..."
            className="w-full min-h-[120px] bg-background border border-input rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
        </div>

        {/* Detected type badge */}
        {detectedType && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">AI 识别任务类型：</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {(() => {
                const Icon = taskTypeIcons[detectedType];
                return Icon ? <Icon className="w-3 h-3" /> : null;
              })()}
              {taskTypeConfig[detectedType]?.label}
            </span>
          </div>
        )}

        {/* Attached files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, i) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary text-secondary-foreground"
              >
                <Paperclip className="w-3 h-3" />
                {file.file_name}
                <span className="text-muted-foreground">
                  ({(file.file_size / 1024).toFixed(1)} KB)
                </span>
                <button onClick={() => removeFile(i)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.png,.jpg,.jpeg,.webp"
            />
            <button
              onClick={handleFileAttach}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? '上传中...' : '上传文件'}
            </button>
            <span className="text-xs text-muted-foreground">支持 PDF、Word、Excel、图片（≤20MB）</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors',
              inputValue.trim()
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
            提交任务
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary-foreground/20 text-[10px]">
              ⌘↵
            </kbd>
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">快速开始</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestedPrompts.map((prompt, i) => {
            const Icon = taskTypeIcons[prompt.type];
            return (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt.text)}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card text-left hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm leading-snug">{prompt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Flows */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">推荐执行流程</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedFlows.map((flow) => {
            const Icon = taskTypeIcons[flow.type];
            return (
              <div
                key={flow.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium">{flow.title}</h3>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {flow.steps.map((step, j) => (
                    <span key={j} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {step}
                      </span>
                      {j < flow.steps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                      )}
                    </span>
                  ))}
                </div>
                <button className="text-xs text-primary hover:underline">使用此流程 →</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            历史任务
          </h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索任务..."
                className="h-8 w-40 pl-8 pr-3 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
              {[
                { key: 'all' as FilterStatus, label: '全部' },
                { key: 'running' as FilterStatus, label: '进行中' },
                { key: 'completed' as FilterStatus, label: '已完成' },
                { key: 'failed' as FilterStatus, label: '失败' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs transition-colors',
                    filterStatus === f.key
                      ? 'bg-card text-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无匹配任务</div>
          ) : (
            filteredTasks.map((task) => {
              const Icon = taskTypeIcons[task.type] || Sparkles;
              const statusCfg = taskStatusConfig[task.status] || { label: task.status, color: 'bg-muted text-muted-foreground' };
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{task.title}</span>
                      <span className={cn('status-badge', statusCfg.color)}>{statusCfg.label}</span>
                    </div>
                     <p className="text-xs text-muted-foreground truncate mt-0.5">
                       {task.input_summary}
                     </p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                     {new Date(task.created_at).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {task.status !== 'running' && (
                    <button
                      onClick={(e) => handleRun(e, task.id)}
                      disabled={runningId === task.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-50"
                    >
                      {runningId === task.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {runningId === task.id ? '运行中' : '运行'}
                    </button>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
