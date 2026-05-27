"use client";

import type { ContentGenerationSnapshot, ContentStudioData } from "@/lib/types";

type ContentCompliancePanelProps = {
  data: ContentStudioData;
  snapshot: ContentGenerationSnapshot;
};

const levelMeta = {
  high: "border-rose-400/16 bg-rose-400/8 text-rose-100",
  medium: "border-amber-400/16 bg-amber-400/8 text-amber-100",
  low: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
} as const;

export function ContentCompliancePanel({
  data,
  snapshot,
}: ContentCompliancePanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Poster Prompts</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">海报提示词</h2>
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.posterPrompts.length > 0 ? (
            snapshot.posterPrompts.map((item) => (
              <div key={item.id} className="surface-accent rounded-[28px] p-4">
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-secondary">{item.prompt}</p>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[24px] p-4">
              <p className="text-sm leading-6 text-secondary">当前状态下没有海报提示词。</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[24px] border px-4 py-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">推荐发布渠道</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.defaultPlatforms.map((platform) => (
              <span key={platform} className="chip rounded-full px-3 py-1 text-xs">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Compliance Review</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">合规审查</h2>
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.complianceIssues.length > 0 ? (
            snapshot.complianceIssues.map((item) => (
              <div key={item.id} className="surface-card rounded-[28px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-primary">{item.title}</p>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${levelMeta[item.level]}`}
                  >
                    {item.level}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-secondary">{item.detail}</p>
                <div className="surface-accent mt-3 rounded-[24px] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">优化建议</p>
                  <p className="mt-2 text-sm leading-6 text-primary">{item.suggestion}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
              <p className="text-base font-semibold text-primary">当前没有合规问题展示</p>
              <p className="mt-2 text-sm leading-6 text-secondary">切换到“成功”或“错误”状态可查看对应的审查反馈。</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
