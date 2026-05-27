import { Icon } from "@/components/shared/icon";
import type { TaskFlowStep } from "@/lib/types";
import { cx } from "@/lib/utils";

type TaskFlowPreviewProps = {
  steps: TaskFlowStep[];
};

const stepStatusClassName = {
  ready: "border-cyan-400/16 bg-cyan-400/8",
  active: "border-emerald-400/16 bg-emerald-400/8",
  pending: "border-white/8 bg-white/4",
} as const;

const stepStatusLabel = {
  ready: "就绪",
  active: "执行中",
  pending: "待处理",
} as const;

export function TaskFlowPreview({ steps }: TaskFlowPreviewProps) {
  return (
    <article className="panel rounded-[32px] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
            Recommended Flow
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">推荐执行路径</h2>
        </div>
        <span className="chip rounded-full px-3 py-2 text-xs font-semibold">{steps.length} 步</span>
      </div>

      <div className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <div
                className={cx(
                  "flex h-11 w-11 items-center justify-center rounded-2xl border text-primary",
                  stepStatusClassName[step.status],
                )}
              >
                <Icon name={step.icon} className="h-5 w-5" />
              </div>
              {index < steps.length - 1 ? (
                <div className="mt-2 h-full min-h-8 w-px bg-gradient-to-b from-cyan-400/36 to-transparent" />
              ) : null}
            </div>
            <div className="surface-card min-w-0 flex-1 rounded-[24px] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-primary">{step.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-tertiary">{step.agent}</p>
                </div>
                <span className="chip rounded-full px-3 py-1 text-xs">{stepStatusLabel[step.status]}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-secondary">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
