"use client";

import type { DevelopmentAssistantData, DevelopmentSnapshot } from "@/lib/types";

type DevelopmentQualityPanelProps = {
  data: DevelopmentAssistantData;
  snapshot: DevelopmentSnapshot;
};

const levelMeta = {
  critical: "border-rose-400/16 bg-rose-400/8 text-rose-100",
  important: "border-amber-400/16 bg-amber-400/8 text-amber-100",
  nice: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
} as const;

const integrationMeta = {
  ready: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
  planned: "border-cyan-400/16 bg-cyan-400/8 text-cyan-100",
  blocked: "border-rose-400/16 bg-rose-400/8 text-rose-100",
} as const;

const integrationStatusLabel = {
  ready: "已连接",
  planned: "待接入",
  blocked: "待确认",
} as const;

export function DevelopmentQualityPanel({
  data,
  snapshot,
}: DevelopmentQualityPanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Quality Plan</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">测试与发布建议</h2>
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.testSuggestions.map((item) => (
            <div key={item.id} className="surface-card rounded-[28px] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${levelMeta[item.level]}`}
                >
                  {item.level}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">CI / CD 建议</p>
          <div className="mt-3 space-y-3">
            {snapshot.pipelineSuggestions.length > 0 ? (
              snapshot.pipelineSuggestions.map((item) => (
                <div key={item.id} className="surface-accent rounded-[24px] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">{item.stage}</p>
                    <span className="chip rounded-full px-3 py-1 text-xs">{item.tool}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
                </div>
              ))
            ) : (
              <div className="surface-card rounded-[24px] px-4 py-3">
                <p className="text-sm leading-6 text-secondary">当前状态下没有可展示的流水线建议。</p>
              </div>
            )}
          </div>
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Delivery Tools</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">交付协同</h2>
        </div>
        <div className="mt-5 space-y-3">
          {data.integrations.map((item) => (
            <div key={item.id} className="surface-card rounded-[28px] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{item.name}</p>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${integrationMeta[item.status]}`}
                >
                  {integrationStatusLabel[item.status]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
