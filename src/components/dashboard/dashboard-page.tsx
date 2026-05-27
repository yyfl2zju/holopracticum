import Link from "next/link";
import { Icon } from "@/components/shared/icon";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import type { DashboardOverview, TaskType } from "@/lib/types";

type DashboardPageProps = {
  overview: DashboardOverview;
};

const taskTypeLabel: Record<TaskType, string> = {
  contract: "合同",
  dev: "开发",
  content: "内容",
  data: "数据",
  workflow: "流程",
};

export function DashboardPage({ overview }: DashboardPageProps) {
  const focusTask = overview.recentTasks[0];
  const queueTasks = overview.recentTasks.slice(1, 4);
  const topTemplates = overview.workflowTemplates.slice(0, 3);
  const activeAgentCount = overview.agents.filter((agent) => agent.status === "running").length;

  if (!focusTask) {
    return (
      <section className="panel rounded-[32px] p-6">
        <p className="text-sm font-semibold text-primary">控制台暂时没有任务数据。</p>
        <p className="mt-2 text-sm leading-6 text-secondary">任务接入后，这里会展示今日重点任务和执行概况。</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section id="overview" className="scroll-mt-32 grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
        <article className="panel-highlight overflow-hidden rounded-[32px] p-6 sm:p-8">
          <div className="max-w-3xl">
            <span className="chip-accent inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              <Icon name="agent" className="h-3.5 w-3.5" />
              Planner / Executor / Validator
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {overview.spotlight.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
              {overview.spotlight.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={overview.spotlight.primaryCta.href}
                className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                {overview.spotlight.primaryCta.label}
              </Link>
              <Link
                href={overview.spotlight.secondaryCta.href}
                className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                {overview.spotlight.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {overview.metrics.slice(0, 3).map((metric) => (
              <div key={metric.id} className="surface-card rounded-[24px] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-tertiary">{metric.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold text-primary">{metric.value}</p>
                  <span className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold">
                    {metric.delta}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-secondary">{metric.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                Focus Today
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary">今日重点任务</h2>
            </div>
            <StatusBadge status={focusTask.status} />
          </div>

          <div className="surface-card mt-5 rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">{focusTask.title}</p>
                <p className="mt-2 text-sm leading-6 text-secondary">{focusTask.inputSummary}</p>
              </div>
              <span className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                {taskTypeLabel[focusTask.type]}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${focusTask.progress ?? 0}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium text-primary">
                {focusTask.progress ?? 0}%
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="surface-card-strong rounded-[22px] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">负责人</p>
              <p className="mt-2 text-base font-semibold text-primary">{focusTask.owner}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">最近更新时间 {focusTask.updatedAt}</p>
            </div>
            <div className="surface-card-strong rounded-[22px] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">当前执行</p>
              <p className="mt-2 text-base font-semibold text-primary">{activeAgentCount} 个 Agent 正在运行</p>
              <p className="mt-2 text-sm leading-6 text-secondary">
                当前主链路已进入 {focusTask.status === "validating" ? "校验阶段" : "执行阶段"}。
              </p>
            </div>
          </div>
        </article>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "今日焦点", hint: "重点任务与关键指标" },
          { href: "#workspace", label: "快捷任务", hint: "直接进入高频工作台" },
          { href: "#queue", label: "任务队列", hint: "查看最近执行进度" },
          { href: "#execution", label: "运行概况", hint: "Agent 状态与模板" },
        ]}
      />

      <section id="workspace" className="scroll-mt-32 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                Workspace
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary">快捷任务入口</h2>
            </div>
            <Link href="/tasks" className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold">
              进入任务中心
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {overview.quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="surface-card block rounded-[24px] p-4 transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
              >
                <div className="flex items-start gap-3">
                  <div className="surface-card-strong flex h-11 w-11 items-center justify-center rounded-2xl">
                    <Icon name={action.icon} className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">{action.title}</p>
                        <p className="mt-2 text-sm leading-6 text-secondary">{action.description}</p>
                      </div>
                      <span className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                        {taskTypeLabel[action.type]}
                      </span>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-tertiary">{action.inputHint}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article id="queue" className="panel scroll-mt-32 rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                Recent Queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary">最近任务队列</h2>
            </div>
            <span className="chip-accent rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
              {overview.recentTasks.length} 条
            </span>
          </div>

          <Link href={focusTask.detailHref ?? "/tasks"} className="panel-highlight mt-5 block rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-primary">{focusTask.title}</p>
                <p className="mt-2 text-sm leading-6 text-secondary">{focusTask.inputSummary}</p>
              </div>
              <StatusBadge status={focusTask.status} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-[20px] px-3.5 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">负责人</p>
                <p className="mt-2 text-sm font-semibold text-primary">{focusTask.owner}</p>
              </div>
              <div className="surface-card rounded-[20px] px-3.5 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">创建时间</p>
                <p className="mt-2 text-sm font-semibold text-primary">{focusTask.createdAt}</p>
              </div>
              <div className="surface-card rounded-[20px] px-3.5 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">类型</p>
                <p className="mt-2 text-sm font-semibold text-primary">{taskTypeLabel[focusTask.type]}</p>
              </div>
            </div>
          </Link>

          <div className="mt-4 space-y-3">
            {queueTasks.map((task) => (
              <Link
                key={task.id}
                href={task.detailHref ?? "/tasks"}
                className="surface-card block rounded-[24px] p-4 transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{task.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-secondary">{task.inputSummary}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-secondary">
                  <span>{taskTypeLabel[task.type]}</span>
                  <span>{task.updatedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section id="execution" className="scroll-mt-32 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <article className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                Agent Status
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary">当前执行协作</h2>
            </div>
            <Link href="/runs/demo-task" className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold">
              查看执行日志
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {overview.agents.map((agent) => (
              <article key={agent.id} className="surface-card rounded-[24px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="surface-card-strong flex h-10 w-10 items-center justify-center rounded-2xl">
                      <Icon name="agent" className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{agent.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">{agent.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>
                <p className="mt-3 text-sm font-medium text-primary">{agent.currentAction}</p>
                <p className="mt-2 text-sm leading-6 text-secondary">{agent.outputSummary}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                Workflow Templates
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary">常用流程模板</h2>
            </div>
            <Link href="/workflows" className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold">
              打开编排页
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {topTemplates.map((template) => (
              <Link
                key={template.id}
                href={template.href}
                className="surface-card block rounded-[24px] p-4 transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">{template.title}</p>
                    <p className="mt-2 text-sm leading-6 text-secondary">{template.summary}</p>
                  </div>
                  <Icon name="workflow" className="mt-1 h-5 w-5 text-primary" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.steps.slice(0, 3).map((step) => (
                    <span key={step} className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold">
                      {step}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-secondary">
                  <span>成功率 {template.successRate}</span>
                  <span>{template.lastRun}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
