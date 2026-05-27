"use client";

import type {
  DevelopmentAssistantData,
  DevelopmentStackId,
  TaskCenterViewState,
} from "@/lib/types";
import { cx } from "@/lib/utils";

type DevelopmentComposerPanelProps = {
  data: DevelopmentAssistantData;
  requirement: string;
  onRequirementChange: (value: string) => void;
  selectedStack: DevelopmentStackId;
  onStackChange: (value: DevelopmentStackId) => void;
  viewState: TaskCenterViewState;
  onViewStateChange: (value: TaskCenterViewState) => void;
  actionLabel: string;
};

const previewStates: Array<{ id: TaskCenterViewState; label: string }> = [
  { id: "default", label: "默认" },
  { id: "loading", label: "加载中" },
  { id: "success", label: "成功" },
  { id: "empty", label: "空状态" },
  { id: "error", label: "错误" },
];

export function DevelopmentComposerPanel({
  data,
  requirement,
  onRequirementChange,
  selectedStack,
  onStackChange,
  viewState,
  onViewStateChange,
  actionLabel,
}: DevelopmentComposerPanelProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Requirement Intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">需求输入与技术栈</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            先确认技术栈与输入边界，再触发代码草案、测试方案和 CI 建议生成。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold">
            保存需求
          </button>
          <button type="button" className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold">
            {actionLabel}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <textarea
          value={requirement}
          onChange={(event) => onRequirementChange(event.target.value)}
          rows={8}
          className="w-full resize-none bg-transparent text-base leading-7 text-primary outline-none placeholder:text-slate-500"
          placeholder="输入业务需求、边界条件、技术约束和期望产出。"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onRequirementChange(preset)}
            className="chip rounded-full px-3 py-2 text-xs font-medium transition hover:border-[var(--border-strong)] hover:text-primary"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
          技术栈选择
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.stackOptions.map((stack) => (
            <button
              key={stack.id}
              type="button"
              onClick={() => onStackChange(stack.id)}
              className={cx(
                "rounded-[24px] border px-4 py-4 text-left transition",
                selectedStack === stack.id
                  ? "surface-accent"
                  : "surface-card hover:border-[var(--border-strong)]",
              )}
            >
              <p className="text-sm font-semibold text-primary">{stack.label}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{stack.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stack.tags.map((tag) => (
                  <span key={tag} className="chip rounded-full px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
          状态预演
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {previewStates.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onViewStateChange(option.id)}
              className={cx(
                "rounded-full border px-3 py-2 text-xs font-semibold transition",
                option.id === viewState ? "chip-accent" : "chip hover:border-[var(--border-strong)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
