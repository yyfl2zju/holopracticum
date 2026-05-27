"use client";

import type { InsightRangeId, InsightStudioData, TaskCenterViewState } from "@/lib/types";
import { cx } from "@/lib/utils";

type InsightsControlPanelProps = {
  data: InsightStudioData;
  selectedRange: InsightRangeId;
  onRangeChange: (value: InsightRangeId) => void;
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

const uploadStatusMeta = {
  parsed: {
    label: "已解析",
    className: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
  },
  uploading: {
    label: "上传中",
    className: "border-amber-400/16 bg-amber-400/8 text-amber-100",
  },
  failed: {
    label: "失败",
    className: "border-rose-400/16 bg-rose-400/8 text-rose-100",
  },
} as const;

export function InsightsControlPanel({
  data,
  selectedRange,
  onRangeChange,
  viewState,
  onViewStateChange,
  actionLabel,
}: InsightsControlPanelProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Data Intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">数据上传与范围设置</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            上传经营数据后，按时间范围查看指标、趋势图、预测和预警。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold">
            上传数据
          </button>
          <button type="button" className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold">
            {actionLabel}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-dashed border-[var(--border-strong)] px-5 py-8 text-center">
        <p className="text-base font-semibold text-primary">拖拽财务或经营数据文件到这里</p>
        <p className="mt-2 text-sm leading-6 text-secondary">
          当前只做前端展示。后续将接 FastAPI 聚合、MinIO 上传和 PostgreSQL 查询接口。
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {data.uploads.map((file) => (
          <div key={file.id} className="surface-card rounded-[28px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">{file.name}</p>
                <p className="mt-1 text-xs text-secondary">
                  {file.size} · 更新时间 {file.updatedAt}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${uploadStatusMeta[file.status].className}`}
              >
                {uploadStatusMeta[file.status].label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
          时间范围
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.rangeOptions.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => onRangeChange(range.id)}
              className={cx(
                "rounded-[24px] border px-4 py-4 text-left transition",
                selectedRange === range.id
                  ? "surface-accent"
                  : "surface-card hover:border-[var(--border-strong)]",
              )}
            >
              <p className="text-sm font-semibold text-primary">{range.label}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{range.description}</p>
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
