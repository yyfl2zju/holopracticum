import type { DashboardMetric } from "@/lib/types";
import { cx } from "@/lib/utils";

type MetricCardProps = {
  metric: DashboardMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {metric.value}
          </p>
        </div>
        <span
          className={cx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            metric.direction === "up"
              ? "bg-emerald-400/10 text-emerald-200"
              : "bg-amber-400/10 text-amber-200",
          )}
        >
          {metric.direction === "up" ? "↑" : "↓"} {metric.delta}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
        {metric.description}
      </p>
    </article>
  );
}
