"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import type { ContentGenerationSnapshot } from "@/lib/types";
import { cx } from "@/lib/utils";

type ContentOutputPanelProps = {
  snapshot: ContentGenerationSnapshot;
};

const noticeClassName = {
  neutral: "surface-accent text-primary",
  success: "border border-emerald-400/16 bg-emerald-400/8 text-primary",
  warning: "border border-amber-400/16 bg-amber-400/8 text-primary",
  danger: "border border-rose-400/16 bg-rose-400/8 text-primary",
} as const;

const platformLabel = {
  website: "官网",
  wechat: "公众号",
  xiaohongshu: "小红书",
  douyin: "抖音脚本",
  linkedin: "LinkedIn",
} as const;

export function ContentOutputPanel({ snapshot }: ContentOutputPanelProps) {
  return (
    <section className="space-y-6">
      <article className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Generated Content
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary">标题与正文生成区</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">{snapshot.summary}</p>
          </div>
          <StatusBadge status={snapshot.status} />
        </div>

        <div className={cx("mt-5 rounded-[28px] px-4 py-4", noticeClassName[snapshot.noticeTone])}>
          <p className="text-sm font-semibold">{snapshot.title}</p>
          <p className="mt-2 text-sm leading-6 opacity-90">{snapshot.notice}</p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[0.38fr_0.62fr]">
          <div className="space-y-3">
            {snapshot.generatedTitles.length > 0 ? (
              snapshot.generatedTitles.map((item) => (
                <div key={item.id} className="surface-card rounded-[24px] p-4">
                  <p className="text-sm font-semibold text-primary">{item.title}</p>
                  <p className="mt-2 text-xs text-secondary">{item.tone}</p>
                </div>
              ))
            ) : (
              <div className="surface-card rounded-[24px] p-4">
                <p className="text-sm leading-6 text-secondary">当前状态下没有标题方案。</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {snapshot.copyBlocks.length > 0 ? (
              snapshot.copyBlocks.map((block) => (
                <div key={block.id} className="surface-card rounded-[28px] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-primary">{block.heading}</p>
                    <span className="chip rounded-full px-3 py-1 text-xs">{block.summary}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-secondary">{block.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
                <p className="text-base font-semibold text-primary">当前没有正文结果</p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  切换到“成功”状态可查看 mock 正文内容。
                </p>
              </div>
            )}
          </div>
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Platform Rewrite
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">多平台改写区</h2>
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.rewrites.length > 0 ? (
            snapshot.rewrites.map((item) => (
              <div key={item.id} className="surface-card rounded-[28px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-primary">{item.title}</p>
                  <span className="chip rounded-full px-3 py-1 text-xs">
                    {platformLabel[item.platform]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-secondary">{item.description}</p>
                <p className="mt-3 text-sm leading-7 text-primary">{item.content}</p>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[24px] p-4">
              <p className="text-sm leading-6 text-secondary">当前状态下没有平台改写结果。</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
