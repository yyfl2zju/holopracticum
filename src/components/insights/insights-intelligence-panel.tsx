import { StatusBadge } from "@/components/shared/status-badge";
import type { InsightStudioData, InsightSnapshot } from "@/lib/types";
import { cx } from "@/lib/utils";

type InsightsIntelligencePanelProps = {
  data: InsightStudioData;
  snapshot: InsightSnapshot;
};

const noticeClassName = {
  neutral: "surface-accent text-primary",
  success: "border border-emerald-400/16 bg-emerald-400/8 text-primary",
  warning: "border border-amber-400/16 bg-amber-400/8 text-primary",
  danger: "border border-rose-400/16 bg-rose-400/8 text-primary",
} as const;

const alertLevelClassName = {
  high: "border-rose-400/16 bg-rose-400/8 text-rose-100",
  medium: "border-amber-400/16 bg-amber-400/8 text-amber-100",
  low: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
} as const;

const uploadStatusLabel = {
  parsed: "已同步",
  uploading: "更新中",
  failed: "失败",
} as const;

export function InsightsIntelligencePanel({
  data,
  snapshot,
}: InsightsIntelligencePanelProps) {
  return (
    <section className="space-y-6">
      <article className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Intelligence Summary</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">模型建议摘要</h2>
          </div>
          <StatusBadge status={snapshot.status} />
        </div>

        <div className={cx("mt-5 rounded-[28px] px-4 py-4", noticeClassName[snapshot.noticeTone])}>
          <p className="text-sm font-semibold">{snapshot.title}</p>
          <p className="mt-2 text-sm leading-6 opacity-90">{snapshot.notice}</p>
        </div>

        <div className="mt-5 space-y-3">
          {snapshot.recommendations.map((item) => (
            <div key={item.id} className="surface-card rounded-[28px] p-4">
              <p className="text-sm font-semibold text-primary">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{item.detail}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Alerts</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">风险预警</h2>
        </div>
        <div className="mt-5 space-y-3">
          {snapshot.alerts.length > 0 ? (
            snapshot.alerts.map((alert) => (
              <div key={alert.id} className="surface-card rounded-[28px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-primary">{alert.title}</p>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${alertLevelClassName[alert.level]}`}
                  >
                    {alert.level}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-secondary">{alert.summary}</p>
                <div className="surface-accent mt-3 rounded-[24px] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">建议动作</p>
                  <p className="mt-2 text-sm leading-6 text-primary">{alert.action}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-sm leading-6 text-secondary">当前状态下没有可展示的预警。</p>
            </div>
          )}
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">Data Sources</p>
          <h2 className="mt-2 text-xl font-semibold text-primary">当前数据来源</h2>
        </div>
        <div className="mt-5 space-y-3">
          {data.uploads.map((upload) => (
            <div key={upload.id} className="surface-card rounded-[24px] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{upload.name}</p>
                  <p className="mt-1 text-xs text-secondary">{upload.size}</p>
                </div>
                <span className="chip rounded-full px-3 py-1 text-xs">{uploadStatusLabel[upload.status]}</span>
              </div>
              <p className="mt-3 text-xs text-tertiary">最近更新时间 {upload.updatedAt}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
