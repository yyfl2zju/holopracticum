"use client";

import { Icon } from "@/components/shared/icon";
import type { TaskCenterViewState, TaskIntentSignal } from "@/lib/types";
import { cx } from "@/lib/utils";

type TaskIntakePanelProps = {
  value: string;
  onChange: (value: string) => void;
  onPresetSelect: (value: string) => void;
  promptPresets: string[];
  acceptedFileTypes: string[];
  recognizedSignals: TaskIntentSignal[];
  actionLabel: string;
  previewState: TaskCenterViewState;
};

const priorityClassName = {
  high: "border-rose-400/18 bg-rose-400/10 text-rose-100",
  medium: "border-amber-400/18 bg-amber-400/10 text-amber-100",
  low: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
} as const;

export function TaskIntakePanel({
  value,
  onChange,
  onPresetSelect,
  promptPresets,
  acceptedFileTypes,
  recognizedSignals,
  actionLabel,
  previewState,
}: TaskIntakePanelProps) {
  const isLoading = previewState === "loading";
  const primarySignal = recognizedSignals[0];

  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
            Natural Language Intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">任务输入区</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            输入业务诉求后，系统会先识别任务类型，再进入合适的执行链路。
          </p>
        </div>
        <button
          type="button"
          className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            <Icon name="upload" className="h-4 w-4" />
            添加附件
          </span>
        </button>
      </div>

      <div className="input-shell mt-5 rounded-[28px] p-4">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={7}
          className="w-full resize-none bg-transparent text-base leading-7 text-primary outline-none placeholder:text-slate-500"
          placeholder="例如：审查这份劳动合同，标出高风险条款，并生成一份可给业务负责人确认的修改建议。"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {promptPresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className="chip rounded-full px-3 py-2 text-xs font-medium transition hover:border-cyan-400/18 hover:bg-cyan-400/10 hover:text-primary"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">识别标签</p>
          {recognizedSignals.map((signal) => (
            <div key={signal.id} className="surface-card rounded-[22px] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-primary">{signal.label}</span>
                <span
                  className={cx(
                    "rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                    priorityClassName[signal.priority],
                  )}
                >
                  {Math.round(signal.confidence * 100)}%
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{signal.reason}</p>
            </div>
          ))}
        </div>

        <div className="surface-accent rounded-[28px] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">本次会话</p>
          <p className="mt-3 text-sm font-semibold text-primary">
            {primarySignal ? `${primarySignal.label} 链路` : "等待识别"}
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary">
            识别完成后会优先匹配最接近的模板，并把附件上下文一并带入执行流程。
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {acceptedFileTypes.map((type) => (
              <span key={type} className="chip rounded-full px-3 py-1 text-xs">
                {type}
              </span>
            ))}
          </div>

          <button
            type="button"
            disabled={isLoading}
            className={cx(
              "button-primary mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
              isLoading && "cursor-wait opacity-75",
            )}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
