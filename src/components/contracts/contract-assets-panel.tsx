"use client";

import type { ContractReviewData } from "@/lib/types";

type ContractAssetsPanelProps = {
  data: ContractReviewData;
};

const riskLevelClassName = {
  high: "border-rose-400/16 bg-rose-400/8 text-rose-100",
  medium: "border-amber-400/16 bg-amber-400/8 text-amber-100",
  low: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
} as const;

const riskLevelLabel = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
} as const;

export function ContractAssetsPanel({ data }: ContractAssetsPanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Templates</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">模板与导出</h2>
        </div>
        <div className="mt-5 space-y-3">
          {data.templates.map((template) => (
            <div key={template.id} className="surface-card rounded-[28px] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{template.title}</p>
                <span className="chip rounded-full px-3 py-1 text-xs">{template.category}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{template.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">导出动作</p>
          <div className="mt-3 space-y-3">
            {data.exportOptions.map((option) => (
              <div key={option.id} className="surface-accent rounded-[24px] px-4 py-3">
                <p className="text-sm font-semibold text-primary">{option.label}</p>
                <p className="mt-1 text-sm leading-6 text-secondary">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Case References</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">参考案例</h2>
        </div>
        <div className="mt-5 space-y-3">
          {data.cases.map((item) => (
            <div key={item.id} className="surface-card rounded-[28px] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskLevelClassName[item.riskLevel]}`}
                >
                  {riskLevelLabel[item.riskLevel]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.summary}</p>
              <p className="mt-2 text-xs text-tertiary">{item.source}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
