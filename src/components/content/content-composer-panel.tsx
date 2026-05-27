"use client";

import type {
  ContentPlatformId,
  ContentStudioData,
  ContentStyleId,
  TaskCenterViewState,
} from "@/lib/types";
import { cx } from "@/lib/utils";

type ContentComposerPanelProps = {
  data: ContentStudioData;
  topic: string;
  onTopicChange: (value: string) => void;
  selectedStyle: ContentStyleId;
  onStyleChange: (value: ContentStyleId) => void;
  selectedPlatforms: ContentPlatformId[];
  onPlatformToggle: (value: ContentPlatformId) => void;
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

export function ContentComposerPanel({
  data,
  topic,
  onTopicChange,
  selectedStyle,
  onStyleChange,
  selectedPlatforms,
  onPlatformToggle,
  viewState,
  onViewStateChange,
  actionLabel,
}: ContentComposerPanelProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Content Brief
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">主题输入与创作设置</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            先设定主题、风格和平台，再生成标题、正文、改写版本和合规提示。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold">
            保存草稿
          </button>
          <button type="button" className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold">
            {actionLabel}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <textarea
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
          rows={7}
          className="w-full resize-none bg-transparent text-base leading-7 text-primary outline-none placeholder:text-slate-500"
          placeholder="输入内容主题、目标受众、卖点和平台范围。"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onTopicChange(preset)}
            className="chip rounded-full px-3 py-2 text-xs font-medium transition hover:border-[var(--border-strong)] hover:text-primary"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
          风格选择
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.styleOptions.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleChange(style.id)}
              className={cx(
                "rounded-[24px] border px-4 py-4 text-left transition",
                selectedStyle === style.id
                  ? "surface-accent"
                  : "surface-card hover:border-[var(--border-strong)]",
              )}
            >
              <p className="text-sm font-semibold text-primary">{style.label}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
          平台选择
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.platformOptions.map((platform) => {
            const selected = selectedPlatforms.includes(platform.id);

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onPlatformToggle(platform.id)}
                className={cx(
                  "rounded-[24px] border px-4 py-4 text-left transition",
                  selected ? "surface-accent" : "surface-card hover:border-[var(--border-strong)]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-primary">{platform.label}</p>
                  <span className={cx("chip rounded-full px-3 py-1 text-xs", selected && "chip-accent")}>
                    {selected ? "已选" : "可选"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-secondary">{platform.description}</p>
              </button>
            );
          })}
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
