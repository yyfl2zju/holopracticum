"use client";

import type {
  ContractReviewData,
  ContractTypeOption,
  TaskCenterViewState,
} from "@/lib/types";
import { cx } from "@/lib/utils";

type ContractWorkspacePanelProps = {
  data: ContractReviewData;
  selectedType: ContractTypeOption;
  onSelectType: (value: ContractTypeOption) => void;
  viewState: TaskCenterViewState;
  onViewStateChange: (value: TaskCenterViewState) => void;
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

export function ContractWorkspacePanel({
  data,
  selectedType,
  onSelectType,
  viewState,
  onViewStateChange,
}: ContractWorkspacePanelProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Contract Intake
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">上传与配置</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            先选择合同类型与上传文件，再发起 mock 审查流程。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold">
            保存草稿
          </button>
          <button type="button" className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold">
            开始审查
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-dashed border-[var(--border-strong)] px-5 py-8 text-center">
        <p className="text-base font-semibold text-primary">拖拽合同文件到这里，或点击上传</p>
        <p className="mt-2 text-sm leading-6 text-secondary">
          当前仅做前端展示。后续将接入 MinIO 上传和 FastAPI 文件中转。
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {data.uploads.map((file) => (
          <div key={file.id} className="surface-card rounded-[28px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">{file.name}</p>
                <p className="mt-1 text-xs text-secondary">
                  {file.size} · {file.kind}
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
          合同类型
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.contractTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectType(type.id)}
              className={cx(
                "rounded-[24px] border px-4 py-4 text-left transition",
                selectedType === type.id
                  ? "surface-accent"
                  : "surface-card hover:border-[var(--border-strong)]",
              )}
            >
              <p className="text-sm font-semibold text-primary">{type.label}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{type.description}</p>
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
