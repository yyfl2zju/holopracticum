import Link from "next/link";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import type {
  TaskCenterSnapshot,
  TaskCenterTemplate,
  TaskCenterViewState,
  TaskType,
} from "@/lib/types";
import { cx } from "@/lib/utils";

type TaskHistoryPanelProps = {
  viewState: TaskCenterViewState;
  onViewStateChange: (state: TaskCenterViewState) => void;
  snapshot: TaskCenterSnapshot;
  templates: TaskCenterTemplate[];
};

const stateOptions: Array<{ id: TaskCenterViewState; label: string }> = [
  { id: "default", label: "草稿" },
  { id: "loading", label: "识别中" },
  { id: "success", label: "已创建" },
  { id: "empty", label: "空结果" },
  { id: "error", label: "异常" },
];

const noticeClassName = {
  neutral: "border-cyan-400/14 bg-cyan-400/6 text-cyan-50",
  success: "border-emerald-400/16 bg-emerald-400/8 text-emerald-50",
  warning: "border-amber-400/16 bg-amber-400/8 text-amber-50",
  danger: "border-rose-400/16 bg-rose-400/8 text-rose-50",
} as const;

const taskTypeLabel: Record<TaskType, string> = {
  contract: "合同",
  dev: "开发",
  content: "内容",
  data: "数据",
  workflow: "流程",
};

export function TaskHistoryPanel({
  viewState,
  onViewStateChange,
  snapshot,
  templates,
}: TaskHistoryPanelProps) {
  return (
    <section className="space-y-6">
      <article className="panel rounded-[32px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
              Task Queue
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary">任务队列</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              查看当前会话的任务创建结果，以及最近处理过的任务。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stateOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onViewStateChange(option.id)}
                className={cx(
                  "rounded-full border px-3 py-2 text-xs font-semibold transition",
                  option.id === viewState
                    ? "border-cyan-400/18 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/16 hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cx("mt-5 rounded-[28px] border px-4 py-4", noticeClassName[snapshot.noticeTone])}
        >
          <p className="text-sm font-semibold">{snapshot.title}</p>
          <p className="mt-2 text-sm leading-6 opacity-90">{snapshot.summary}</p>
          <p className="mt-3 text-sm leading-6 opacity-85">{snapshot.notice}</p>
        </div>

        {snapshot.generatedTask ? (
          <Link
            href={snapshot.generatedTask.detailHref ?? "/runs/demo-task"}
            className="mt-5 block rounded-[28px] border border-emerald-400/16 bg-emerald-400/8 p-5 transition hover:bg-emerald-400/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                  新创建任务
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{snapshot.generatedTask.title}</h3>
              </div>
              <StatusBadge status={snapshot.generatedTask.status} />
            </div>
            <p className="mt-3 text-sm leading-6 text-emerald-50/90">
              {snapshot.generatedTask.inputSummary}
            </p>
          </Link>
        ) : null}

        <div className="mt-5 space-y-3">
          {snapshot.tasks.length > 0 ? (
            snapshot.tasks.map((task) => (
              <Link
                key={task.id}
                href={task.detailHref ?? "/runs/demo-task"}
                className="surface-card block rounded-[24px] p-4 transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{task.title}</h3>
                    <p className="mt-1 text-xs text-secondary">
                      {task.createdAt} · {task.owner}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip rounded-full px-3 py-1 text-xs">{taskTypeLabel[task.type]}</span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-secondary">{task.inputSummary}</p>
              </Link>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/12 bg-white/3 px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-slate-300">
                <Icon name="tasks" className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold text-white">当前没有匹配的历史任务</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                可切回其他状态查看示例任务，或直接继续补充输入内容。
              </p>
            </div>
          )}
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
              Suggested Templates
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary">相关模板</h2>
          </div>
          <Icon name="workflow" className="h-5 w-5 text-primary" />
        </div>

        <div className="mt-5 space-y-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={template.href}
              className="surface-card block rounded-[24px] p-4 transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-primary">{template.title}</h3>
                <span className="chip rounded-full px-3 py-1 text-xs">{taskTypeLabel[template.type]}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{template.summary}</p>
            </Link>
          ))}
        </div>
      </article>
    </section>
  );
}
