"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import type { RunDetailSnapshot, RunTimelineStep } from "@/lib/types";

type RunTimelinePanelProps = {
  snapshot: RunDetailSnapshot;
};

const stageLabels: Record<RunTimelineStep["stage"], string> = {
  planner: "Planner",
  executor: "Executor",
  validator: "Validator",
  system: "System",
};

const noticeToneClasses: Record<RunDetailSnapshot["noticeTone"], string> = {
  neutral: "surface-card-strong text-secondary",
  success: "border-emerald-400/20 bg-emerald-400/10 text-secondary",
  warning: "border-amber-400/20 bg-amber-400/10 text-secondary",
  danger: "border-rose-400/20 bg-rose-400/10 text-secondary",
};

export function RunTimelinePanel({ snapshot }: RunTimelinePanelProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
            Timeline
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">执行时间线</h2>
        </div>
        <StatusBadge status={snapshot.status} />
      </div>

      <div className={`mt-5 rounded-[24px] border px-4 py-4 ${noticeToneClasses[snapshot.noticeTone]}`}>
        <p className="text-sm font-semibold text-primary">{snapshot.title}</p>
        <p className="mt-2 text-sm leading-6">{snapshot.notice}</p>
      </div>

      {snapshot.timeline.length ? (
        <div className="mt-5 space-y-3">
          {snapshot.timeline.map((step, index) => (
            <article key={step.id} className="surface-card rounded-[26px] p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold text-primary"
                    style={{ borderColor: "var(--border-strong)" }}
                  >
                    {index + 1}
                  </span>
                  {index < snapshot.timeline.length - 1 ? (
                    <span className="mt-2 h-12 w-px bg-[var(--border)]" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-primary">{step.title}</p>
                        <span className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                          {stageLabels[step.stage]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-secondary">{step.detail}</p>
                    </div>
                    <StatusBadge status={step.status} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="surface-card-strong rounded-[20px] p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">负责人</p>
                      <p className="mt-2 text-sm font-semibold text-primary">{step.owner}</p>
                    </div>
                    <div className="surface-card-strong rounded-[20px] p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">开始时间</p>
                      <p className="mt-2 text-sm font-semibold text-primary">{step.startedAt}</p>
                    </div>
                    <div className="surface-card-strong rounded-[20px] p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">耗时</p>
                      <p className="mt-2 text-sm font-semibold text-primary">{step.duration}</p>
                    </div>
                  </div>

                  {step.output ? (
                    <div className="surface-card-strong mt-4 rounded-[20px] px-3.5 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tertiary">
                        输出
                      </p>
                      <p className="mt-2 text-sm leading-6 text-primary">{step.output}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div
          className="mt-5 rounded-[24px] border border-dashed px-4 py-12 text-center text-sm leading-6 text-secondary"
          style={{ borderColor: "var(--border-strong)" }}
        >
          当前没有执行时间线，可用于展示新任务或执行记录为空的情况。
        </div>
      )}
    </section>
  );
}
