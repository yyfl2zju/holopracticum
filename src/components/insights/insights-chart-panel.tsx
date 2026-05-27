import { MetricCard } from "@/components/shared/metric-card";
import { InsightForecastChart } from "@/components/insights/insight-forecast-chart";
import { InsightTrendChart } from "@/components/insights/insight-trend-chart";
import type { InsightRangeDataset, InsightRangeOption, InsightSnapshot } from "@/lib/types";

type InsightsChartPanelProps = {
  snapshot: InsightSnapshot;
  dataset: InsightRangeDataset;
  selectedRange: InsightRangeOption;
};

export function InsightsChartPanel({
  snapshot,
  dataset,
  selectedRange,
}: InsightsChartPanelProps) {
  return (
    <section className="space-y-6">
      <article className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              KPI Overview
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary">核心指标卡</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {selectedRange.label} · {dataset.summary}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {dataset.metrics.length > 0 ? (
            dataset.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)
          ) : (
            <div className="surface-card col-span-full rounded-[28px] p-5">
              <p className="text-sm leading-6 text-secondary">当前状态下没有指标卡数据。</p>
            </div>
          )}
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Trend Analysis
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">收入 / 成本 / 现金流趋势图</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{snapshot.summary}</p>
        </div>
        <div className="mt-5">
          <InsightTrendChart data={dataset.trendSeries} />
        </div>
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            Forecast
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">现金流预测图</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            以当前范围数据为基础，模拟未来阶段的经营现金流预测。
          </p>
        </div>
        <div className="mt-5">
          <InsightForecastChart data={dataset.forecastSeries} />
        </div>
      </article>
    </section>
  );
}
