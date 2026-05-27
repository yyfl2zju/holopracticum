import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Play, RefreshCw, Trash2, Copy, Check, Loader2,
  Clock, Cpu, FileCheck, Code, PenTool, BarChart3, Workflow as WorkflowIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { taskStatusConfig, taskTypeConfig } from '@/data/mock';

const typeIcons: Record<string, React.ElementType> = {
  contract: FileCheck, dev: Code, content: PenTool, data: BarChart3, workflow: WorkflowIcon,
};

interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  input_summary: string | null;
  result: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface TaskRun {
  id: string;
  status: string;
  output: string | null;
  error: string | null;
  model: string | null;
  tokens_used: number | null;
  duration_ms: number | null;
  created_at: string;
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const [taskRes, runsRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('id', id).single(),
      supabase.from('task_runs').select('*').eq('task_id', id).order('created_at', { ascending: false }),
    ]);
    if (taskRes.data) setTask(taskRes.data as Task);
    if (runsRes.data) setRuns(runsRes.data as TaskRun[]);
    setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  // Poll every 3s while running
  useEffect(() => {
    if (task?.status !== 'running') return;
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [task?.status, load]);

  const handleRun = async () => {
    if (!task) return;
    setRunning(true);
    const { data, error } = await supabase.functions.invoke('run-task', {
      body: { task_id: task.id },
    });
    setRunning(false);
    if (error) {
      toast({ title: '运行失败', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '任务已完成', description: `用时 ${((data?.duration_ms ?? 0) / 1000).toFixed(1)}s` });
    }
    load();
  };

  const handleDelete = async () => {
    if (!task || !confirm('确认删除该任务？')) return;
    await supabase.from('tasks').delete().eq('id', task.id);
    toast({ title: '任务已删除' });
    navigate('/tasks');
  };

  const copyOutput = () => {
    const latest = runs.find(r => r.output)?.output ?? task?.result ?? '';
    navigator.clipboard.writeText(latest);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh] text-sm text-muted-foreground">加载中...</div>;
  }
  if (!task) {
    return <div className="flex items-center justify-center h-[60vh] text-sm text-muted-foreground">任务不存在</div>;
  }

  const TypeIcon = typeIcons[task.type] ?? FileCheck;
  const statusCfg = taskStatusConfig[task.status] ?? taskStatusConfig.queued;
  const latestOutput = runs.find(r => r.output)?.output ?? task.result;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link to="/tasks" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> 返回任务列表
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <TypeIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-foreground">{task.title}</h1>
            <span className={cn('status-badge', statusCfg.color)}>{statusCfg.label}</span>
            <Badge variant="outline" className="text-[10px]">{taskTypeConfig[task.type]?.label ?? task.type}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            创建于 {new Date(task.created_at).toLocaleString('zh-CN')} · 运行 {runs.length} 次
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRun} disabled={running || task.status === 'running'} className="gap-1.5">
            {running || task.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {task.status === 'completed' ? '重新运行' : '运行'}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left: input + history */}
        <div className="col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">输入内容</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {task.input_summary || '（无）'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Clock size={13} /> 运行历史
            </h3>
            {runs.length === 0 ? (
              <p className="text-xs text-muted-foreground">暂无运行记录</p>
            ) : (
              <div className="space-y-2.5">
                {runs.map(r => (
                  <div key={r.id} className="text-xs border-l-2 border-border pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-block w-1.5 h-1.5 rounded-full',
                        r.status === 'completed' && 'bg-[hsl(var(--status-success))]',
                        r.status === 'failed' && 'bg-destructive',
                        r.status === 'running' && 'bg-[hsl(var(--status-running))] animate-pulse',
                      )} />
                      <span className="font-medium text-foreground">{r.status}</span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(r.created_at).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-[10px]">
                      {r.model && <span className="flex items-center gap-1"><Cpu size={10} />{r.model.split('/').pop()}</span>}
                      {r.duration_ms != null && <span>{(r.duration_ms / 1000).toFixed(1)}s</span>}
                      {r.tokens_used != null && <span>{r.tokens_used} tokens</span>}
                    </div>
                    {r.error && <p className="text-destructive mt-1 text-[10px] break-words">{r.error}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: output */}
        <div className="col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 min-h-[400px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">AI 输出结果</h3>
              {latestOutput && (
                <Button size="sm" variant="ghost" onClick={copyOutput} className="h-7 gap-1 text-xs">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? '已复制' : '复制'}
                </Button>
              )}
            </div>
            {task.status === 'running' ? (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 正在生成结果...
              </div>
            ) : latestOutput ? (
              <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{latestOutput}</ReactMarkdown>
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground gap-3">
                <RefreshCw className="w-5 h-5 opacity-50" />
                <p>暂无输出，点击"运行"开始 AI 处理</p>
                <Button size="sm" onClick={handleRun} disabled={running} className="gap-1.5 mt-2">
                  <Play className="w-3.5 h-3.5" /> 立即运行
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}