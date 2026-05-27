import type { AgentStepStatus, ServiceStatus, TaskStatus } from "@/lib/types";
import { cx } from "@/lib/utils";

type StatusValue = TaskStatus | AgentStepStatus | ServiceStatus;

type StatusBadgeProps = {
  status: StatusValue;
  className?: string;
};

const statusConfig: Record<
  StatusValue,
  { label: string; className: string; dotClassName: string }
> = {
  draft: {
    label: "草稿",
    className: "border-white/10 bg-white/5 text-slate-300",
    dotClassName: "bg-slate-400",
  },
  queued: {
    label: "排队中",
    className: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    dotClassName: "bg-cyan-300",
  },
  planning: {
    label: "规划中",
    className: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    dotClassName: "bg-sky-300",
  },
  running: {
    label: "执行中",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    dotClassName: "bg-emerald-300",
  },
  validating: {
    label: "校验中",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    dotClassName: "bg-amber-300",
  },
  completed: {
    label: "已完成",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    dotClassName: "bg-emerald-300",
  },
  failed: {
    label: "失败",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    dotClassName: "bg-rose-300",
  },
  waiting: {
    label: "等待中",
    className: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    dotClassName: "bg-slate-400",
  },
  idle: {
    label: "待命",
    className: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    dotClassName: "bg-slate-400",
  },
  healthy: {
    label: "正常",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    dotClassName: "bg-emerald-300",
  },
  degraded: {
    label: "波动",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    dotClassName: "bg-amber-300",
  },
  offline: {
    label: "离线",
    className: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    dotClassName: "bg-rose-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase",
        config.className,
        className,
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  );
}
