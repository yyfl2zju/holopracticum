"use client";

import { useState } from "react";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { InsightsChartPanel } from "@/components/insights/insights-chart-panel";
import { InsightsControlPanel } from "@/components/insights/insights-control-panel";
import { InsightsIntelligencePanel } from "@/components/insights/insights-intelligence-panel";
import type { InsightRangeId, InsightStudioData, TaskCenterViewState } from "@/lib/types";

type InsightStudioPageProps = {
  data: InsightStudioData;
};

export function InsightStudioPage({ data }: InsightStudioPageProps) {
  const [selectedRange, setSelectedRange] = useState<InsightRangeId>(data.defaultRange);
  const [viewState, setViewState] = useState<TaskCenterViewState>("success");

  const snapshot = data.stateSnapshots[viewState];
  const selectedRangeOption =
    data.rangeOptions.find((item) => item.id === selectedRange) ?? data.rangeOptions[0];
  const dataset = snapshot.datasets[selectedRange];

  return (
    <div className="space-y-6">
      <section id="overview" className="panel-highlight scroll-mt-32 rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
              BI Workspace
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {data.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
              {data.hero.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">时间范围</p>
              <p className="mt-3 text-2xl font-semibold text-primary">{selectedRangeOption.label}</p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">分析状态</p>
              <div className="mt-3">
                <StatusBadge status={snapshot.status} />
              </div>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">数据源</p>
              <p className="mt-3 text-base font-semibold text-primary">{data.uploads.length} 个已接入文件</p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">预警数</p>
              <p className="mt-3 text-base font-semibold text-primary">{snapshot.alerts.length} 条待跟进</p>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "数据概览", hint: "范围、状态与数据源" },
          { href: "#control", label: "分析控制", hint: "时间、上传与状态切换" },
          { href: "#charts", label: "图表分析", hint: "趋势与预测" },
          { href: "#intelligence", label: "预警建议", hint: "风险和模型建议" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div id="control" className="scroll-mt-32">
          <InsightsControlPanel
            data={data}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            viewState={viewState}
            onViewStateChange={setViewState}
            actionLabel={snapshot.actionLabel}
          />
        </div>
        <div id="charts" className="scroll-mt-32">
          <InsightsChartPanel
            snapshot={snapshot}
            dataset={dataset}
            selectedRange={selectedRangeOption}
          />
        </div>
      </section>

      <div id="intelligence" className="scroll-mt-32">
        <InsightsIntelligencePanel data={data} snapshot={snapshot} />
      </div>
    </div>
  );
}
