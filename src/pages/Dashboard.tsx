import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  FileCheck,
  Code,
  PenTool,
  BarChart3,
  Workflow,
  Zap,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Brain,
  Play,
  ShieldCheck,
  FileText,
  ArrowRight,
} from 'lucide-react';
import {
  mockSystemStatus,
  taskStatusConfig,
  taskTypeConfig,
} from '@/data/mock';
import { cn } from '@/lib/utils';

const statusIconMap: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  failed: AlertCircle,
  running: Loader2,
  planning: Brain,
  validating: ShieldCheck,
  queued: Clock,
  draft: FileText,
};

const quickActions = [
  { label: '审查合同', desc: '合同风险识别', icon: FileCheck, path: '/contract', accent: 'from-orange-500/15 to-orange-500/5', iconColor: 'text-orange-500' },
  { label: '生成代码', desc: '需求转代码', icon: Code, path: '/dev-assist', accent: 'from-blue-500/15 to-blue-500/5', iconColor: 'text-blue-500' },
  { label: '创作内容', desc: '多平台文案', icon: PenTool, path: '/content', accent: 'from-purple-500/15 to-purple-500/5', iconColor: 'text-purple-500' },
  { label: '数据分析', desc: '智能驾驶舱', icon: BarChart3, path: '/dashboard-bi', accent: 'from-emerald-500/15 to-emerald-500/5', iconColor: 'text-emerald-500' },
  { label: '流程编排', desc: '可视化工作流', icon: Workflow, path: '/workflow', accent: 'from-cyan-500/15 to-cyan-500/5', iconColor: 'text-cyan-500' },
];

const agents = [
  {
    name: 'Planner',
    role: '规划者',
    icon: Brain,
    color: 'text-status-planning',
    bg: 'bg-status-planning/10',
    border: 'border-status-planning/20',
    desc: '拆解目标 · 设计步骤 · 选择工具',
    activity: '正在规划「Q1 财务数据分析」',
    metric: '12 步骤 / 平均 2.3s',
  },
  {
    name: 'Executor',
    role: '执行者',
    icon: Play,
    color: 'text-status-running',
    bg: 'bg-status-running/10',
    border: 'border-status-running/20',
    desc: '调用工具 · 执行任务 · 整合结果',
    activity: '正在执行「用户管理模块代码生成」',
    metric: '3 个并行任务 / GPU 32%',
  },
  {
    name: 'Validator',
    role: '验证者',
    icon: ShieldCheck,
    color: 'text-status-validating',
    bg: 'bg-status-validating/10',
    border: 'border-status-validating/20',
    desc: '检验输出 · 风险审查 · 质量评分',
    activity: '正在校验「产品发布会推文」',
    metric: '通过率 96.4% / 24h',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingTasks(true);
      const { data } = await supabase
        .from('tasks')
        .select('id, title, type, status, input_summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
      setRecentTasks(data || []);
      setLoadingTasks(false);
    })();
  }, [user]);

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const runningCount = recentTasks.filter((t) => t.status === 'running').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">欢迎回来 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">{today} · 你有 {runningCount} 个任务正在执行</p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Zap className="w-4 h-4" />
          新建任务
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">快速开始</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.path}
              to={a.path}
              className={cn(
                'relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 group',
                a.accent,
              )}
            >
              <a.icon className={cn('w-6 h-6 mb-2', a.iconColor)} />
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
              <ArrowRight className="w-3.5 h-3.5 absolute top-3 right-3 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Agent Trio — Planner / Executor / Validator */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">智能体协作中枢</h2>
            <p className="text-xs text-muted-foreground mt-0.5">三体协同 · Planner 拆解 → Executor 执行 → Validator 校验</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-success/10 text-status-success font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            全员在线
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
          {/* Connector arrows (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <div className="hidden md:block absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
          </div>

          {agents.map((agent) => (
            <div
              key={agent.name}
              className={cn(
                'relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg',
                agent.border,
              )}
            >
              <div className={cn('absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30', agent.bg)} />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', agent.bg)}>
                      <agent.icon className={cn('w-5 h-5', agent.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">{agent.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{agent.role}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-mono',
                    agent.bg, agent.color,
                  )}>
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>

                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Loader2 className={cn('w-3 h-3 animate-spin', agent.color)} />
                    <span className="truncate">{agent.activity}</span>
                  </div>
                  <p className={cn('text-[10px] font-mono', agent.color)}>{agent.metric}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tasks + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">最近任务</h2>
            <Link to="/tasks" className="text-xs text-primary hover:underline">查看全部</Link>
          </div>
          <div className="platform-card divide-y divide-border">
            {loadingTasks && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />加载中…
              </div>
            )}
            {!loadingTasks && recentTasks.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">还没有任务</p>
                <Link to="/tasks" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Zap className="w-3 h-3" /> 创建第一个任务
                </Link>
              </div>
            )}
            {recentTasks.map((task) => {
              const statusCfg = (taskStatusConfig as any)[task.status] || { label: task.status, color: '' };
              const typeCfg = (taskTypeConfig as any)[task.type] || { label: task.type };
              const StatusIcon = statusIconMap[task.status] || Activity;
              const timeAgo = task.created_at
                ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: zhCN })
                : '';
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:bg-accent/30 -mx-5 px-5 transition-colors"
                >
                  <StatusIcon className={cn(
                    'w-4 h-4 shrink-0',
                    task.status === 'running' && 'animate-spin',
                    task.status === 'completed' && 'text-status-success',
                    task.status === 'failed' && 'text-status-error',
                    task.status === 'planning' && 'text-status-planning',
                    task.status === 'validating' && 'text-status-validating',
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.input_summary || timeAgo}</p>
                  </div>
                  <span className={cn('status-badge', statusCfg.color)}>
                    {statusCfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                    {typeCfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">系统状态</h2>
          <div className="platform-card space-y-3">
            {mockSystemStatus.map((s) => (
              <div key={s.service} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    s.status === 'online' ? 'bg-status-success' : s.status === 'degraded' ? 'bg-status-warning' : 'bg-status-error'
                  )} />
                  <span className="text-xs truncate">{s.service}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono shrink-0">{s.latency}ms</span>
              </div>
            ))}
            <div className="pt-3 border-t border-border grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-status-success">99.97%</p>
                <p className="text-[10px] text-muted-foreground">30 天可用率</p>
              </div>
              <div>
                <p className="text-lg font-bold">128ms</p>
                <p className="text-[10px] text-muted-foreground">平均延迟</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
