"use client";

import { useState } from "react";
import Link from "next/link";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { RunAgentLane } from "@/components/runs/run-agent-lane";
import { RunContextPanel } from "@/components/runs/run-context-panel";
import { RunTimelinePanel } from "@/components/runs/run-timeline-panel";
import type { RunDetailData, TaskCenterViewState } from "@/lib/types";
import { cx } from "@/lib/utils";

type RunDetailPageProps = {
  data: RunDetailData;
};

const viewStateOptions: Array<{ id: TaskCenterViewState; label: string }> = [
  { id: "default", label: "待执行" },
  { id: "loading", label: "运行中" },
  { id: "success", label: "成功" },
  { id: "empty", label: "空结果" },
  { id: "error", label: "异常" },
];

export function RunDetailPage({ data }: RunDetailPageProps) {
  const [viewState, setViewState] = useState<TaskCenterViewState>("success");
  const snapshot = data.stateSnapshots[viewState];

  return (
    <div className="space-y-6">
      <section id="overview" className="panel-highlight scroll-mt-32 rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
              Execution Trace
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                {data.hero.title}
              </h1>
              <StatusBadge status={snapshot.status} />
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-secondary">
              {data.hero.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tasks" className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold">
                返回任务中心
              </Link>
              <Link href={data.workflow.templateHref} className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold">
                查看关联工作流
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-card rounded-[26px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">当前任务</p>
              <p className="mt-3 text-lg font-semibold text-primary">{data.task.title}</p>
            </div>
            <div className="surface-card rounded-[26px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">当前状态</p>
              <p className="mt-3 text-lg font-semibold text-primary">{snapshot.progressLabel}</p>
            </div>
            <div className="surface-card rounded-[26px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">Run ID</p>
              <p className="mt-3 font-mono text-[12px] text-primary">{data.workflow.runId}</p>
            </div>
            <div className="surface-card rounded-[26px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">Trace ID</p>
              <p className="mt-3 font-mono text-[12px] text-primary">{data.workflow.traceId}</p>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "运行概览", hint: "任务、状态与 Trace" },
          { href: "#agents", label: "Agent 协作", hint: "Planner / Executor / Validator" },
          { href: "#timeline", label: "执行时间线", hint: "按步骤回看运行过程" },
          { href: "#context", label: "上下文与输出", hint: "输入、输出物与风险" },
        ]}
      />

      <section className="panel rounded-[32px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
              Snapshot Preview
            </p>
            <h2 className="mt-2 text-lg font-semibold text-primary">{snapshot.title}</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">{snapshot.summary}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {viewStateOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewState(option.id)}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition",
                  viewState === option.id
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                    : "border-white/8 bg-white/4 text-slate-300 hover:border-cyan-400/12 hover:bg-cyan-400/6",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div id="agents" className="scroll-mt-32">
            <RunAgentLane agents={snapshot.agentCards} />
          </div>
          <div id="timeline" className="scroll-mt-32">
            <RunTimelinePanel snapshot={snapshot} />
          </div>
        </div>
        <div id="context" className="scroll-mt-32">
          <RunContextPanel data={data} snapshot={snapshot} />
        </div>
      </section>
    </div>
  );
}
