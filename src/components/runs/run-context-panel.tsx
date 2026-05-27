"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import type { RunArtifact, RunDetailData, RunDetailSnapshot } from "@/lib/types";
import { cx } from "@/lib/utils";

type RunContextPanelProps = {
  data: RunDetailData;
  snapshot: RunDetailSnapshot;
};

const artifactStatusClasses: Record<RunArtifact["status"], string> = {
  ready: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  failed: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const riskLevelClasses = {
  high: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
};

export function RunContextPanel({ data, snapshot }: RunContextPanelProps) {
  return (
    <aside className="space-y-6">
      <section className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">Task Summary</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">任务摘要</h2>
          </div>
          <StatusBadge status={data.task.status} />
        </div>

        <div className="mt-5 space-y-3">
          <div className="surface-card rounded-[24px] p-4">
            <p className="text-sm font-semibold text-primary">{data.task.title}</p>
            <p className="mt-2 text-sm leading-6 text-secondary">{data.task.inputSummary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-card-strong rounded-[20px] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">任务 ID</p>
              <p className="mt-2 font-mono text-[12px] text-primary">{data.task.id}</p>
            </div>
            <div className="surface-card-strong rounded-[20px] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">负责人</p>
              <p className="mt-2 text-sm font-semibold text-primary">{data.task.owner}</p>
            </div>
            <div className="surface-card-strong rounded-[20px] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">创建时间</p>
              <p className="mt-2 text-sm font-semibold text-primary">{data.task.createdAt}</p>
            </div>
            <div className="surface-card-strong rounded-[20px] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">当前进度</p>
              <p className="mt-2 text-sm font-semibold text-primary">{data.task.progress ?? 0}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">Workflow Trace</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">关联工作流</h2>
          </div>
          <Link href={data.workflow.templateHref} className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold">
            查看模板
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="surface-card rounded-[24px] p-4">
            <p className="text-sm font-semibold text-primary">{data.workflow.title}</p>
            <div className="mt-4 grid gap-3 text-sm text-secondary sm:grid-cols-2">
              <p>Run ID: {data.workflow.runId}</p>
              <p>Trace ID: {data.workflow.traceId}</p>
              <p>触发来源: {data.workflow.trigger}</p>
              <p>总耗时: {data.workflow.duration}</p>
              <p>最近更新: {data.workflow.lastUpdated}</p>
              <p>当前进度: {snapshot.progressLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel rounded-[32px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">Inputs & Outputs</p>

        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-primary">输入文件</h3>
            <div className="mt-3 space-y-2">
              {data.inputs.map((input) => (
                <div key={input.id} className="surface-card rounded-[22px] px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{input.name}</p>
                      <p className="mt-1 text-xs text-secondary">
                        {input.kind} · {input.size}
                      </p>
                    </div>
                    <span className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                      {input.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-primary">输出物</h3>
            {snapshot.artifacts.length ? (
              <div className="mt-3 space-y-2">
                {snapshot.artifacts.map((artifact) => (
                  <div key={artifact.id} className="surface-card rounded-[22px] px-3.5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">{artifact.label}</p>
                        <p className="mt-1 text-xs text-secondary">
                          {artifact.kind} · {artifact.format}
                        </p>
                      </div>
                      <span
                        className={cx(
                          "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          artifactStatusClasses[artifact.status],
                        )}
                      >
                        {artifact.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-secondary">{artifact.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="mt-3 rounded-[22px] border border-dashed px-4 py-6 text-sm leading-6 text-secondary"
                style={{ borderColor: "var(--border-strong)" }}
              >
                当前没有可展示的输出物。
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">Risk Review</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">风险与后续操作</h2>
          </div>
          <span className="chip-accent rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
            {snapshot.risks.length} 条风险
          </span>
        </div>

        {snapshot.risks.length ? (
          <div className="mt-5 space-y-3">
            {snapshot.risks.map((risk) => (
              <div key={risk.id} className="surface-card rounded-[24px] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">{risk.clause}</p>
                    <p className="mt-2 text-sm leading-6 text-secondary">{risk.issue}</p>
                  </div>
                  <span
                    className={cx(
                      "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                      riskLevelClasses[risk.level],
                    )}
                  >
                    {risk.level}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-primary">{risk.suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="mt-5 rounded-[22px] border border-dashed px-4 py-6 text-sm leading-6 text-secondary"
            style={{ borderColor: "var(--border-strong)" }}
          >
            当前状态下没有可展示的结构化风险。
          </div>
        )}

        <div className="mt-5 space-y-2">
          {data.relatedLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="surface-card block rounded-[22px] px-4 py-3 transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
            >
              <p className="text-sm font-semibold text-primary">{link.label}</p>
              <p className="mt-1 text-sm leading-6 text-secondary">{link.hint}</p>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
