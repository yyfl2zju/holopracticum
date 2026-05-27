"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import type { ContractReviewSnapshot } from "@/lib/types";
import { cx } from "@/lib/utils";

type ContractRiskPanelProps = {
  snapshot: ContractReviewSnapshot;
};

const noticeClassName = {
  neutral: "surface-accent text-primary",
  success: "border border-emerald-400/16 bg-emerald-400/8 text-primary",
  warning: "border border-amber-400/16 bg-amber-400/8 text-primary",
  danger: "border border-rose-400/16 bg-rose-400/8 text-primary",
} as const;

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

export function ContractRiskPanel({ snapshot }: ContractRiskPanelProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Review Result
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">风险审查结果</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{snapshot.summary}</p>
        </div>
        <StatusBadge status={snapshot.status} />
      </div>

      <div className={cx("mt-5 rounded-[28px] px-4 py-4", noticeClassName[snapshot.noticeTone])}>
        <p className="text-sm font-semibold">{snapshot.title}</p>
        <p className="mt-2 text-sm leading-6 opacity-90">{snapshot.notice}</p>
      </div>

      <div className="mt-5 rounded-[28px] border border-[var(--border)] px-4 py-4">
        <p className="text-sm font-semibold text-primary">{snapshot.riskCountLabel}</p>
      </div>

      {snapshot.risks.length > 0 ? (
        <div className="mt-5 space-y-4">
          {snapshot.risks.map((risk) => (
            <article key={risk.id} className="surface-card rounded-[28px] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{risk.clause}</p>
                  <p className="mt-1 text-xs text-secondary">AI 提取的条款定位结果</p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskLevelClassName[risk.level]}`}
                >
                  {riskLevelLabel[risk.level]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-secondary">{risk.issue}</p>
              <div className="surface-accent mt-4 rounded-[24px] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
                  修改建议
                </p>
                <p className="mt-2 text-sm leading-6 text-primary">{risk.suggestion}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[28px] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
          <p className="text-base font-semibold text-primary">当前没有可展示的风险条目</p>
          <p className="mt-2 text-sm leading-6 text-secondary">
            切换到“成功”状态可查看完整 mock 风险结果。
          </p>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
          修改建议总览
        </p>
        <div className="mt-3 space-y-3">
          {snapshot.suggestions.map((item) => (
            <div key={item} className="surface-card rounded-[24px] px-4 py-3">
              <p className="text-sm leading-6 text-primary">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
