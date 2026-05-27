"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import type { WorkflowSnapshot, WorkflowTemplateScenario } from "@/lib/types";

type WorkflowExecutionsPanelProps = {
  template: WorkflowTemplateScenario;
  snapshot: WorkflowSnapshot;
  onInspectNode: (nodeId: string) => void;
  onShowEditor: () => void;
};

export function WorkflowExecutionsPanel({
  template,
  snapshot,
  onInspectNode,
  onShowEditor,
}: WorkflowExecutionsPanelProps) {
  const latestRun = snapshot.recentRuns[0];

  return (
    <div className="space-y-6 p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="surface-card rounded-[24px] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">模板名称</p>
          <p className="mt-3 text-lg font-semibold text-primary">{template.title}</p>
        </div>
        <div className="surface-card rounded-[24px] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">运行状态</p>
          <div className="mt-3">
            <StatusBadge status={snapshot.status} />
          </div>
        </div>
        <div className="surface-card rounded-[24px] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">最近执行</p>
          <p className="mt-3 text-lg font-semibold text-primary">
            {latestRun ? latestRun.startedAt : "暂无记录"}
          </p>
        </div>
        <div className="surface-card rounded-[24px] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">最近保存</p>
          <p className="mt-3 text-lg font-semibold text-primary">{snapshot.savedAt}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <section className="surface-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                Recent Runs
              </p>
              <h3 className="mt-2 text-base font-semibold text-primary">最近执行</h3>
            </div>
            <button
              type="button"
              onClick={onShowEditor}
              className="button-secondary rounded-2xl px-3 py-2 text-xs font-semibold"
            >
              返回编排
            </button>
          </div>

          {snapshot.recentRuns.length ? (
            <div className="mt-4 space-y-3">
              {snapshot.recentRuns.map((run) => (
                <div key={run.id} className="surface-card-strong rounded-[22px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{run.summary}</p>
                      <p className="mt-1 text-xs text-secondary">{run.trigger}</p>
                    </div>
                    <StatusBadge status={run.status} />
                  </div>
                  <div className="mt-4 grid gap-2 text-xs text-secondary sm:grid-cols-2">
                    <p>开始于 {run.startedAt}</p>
                    <p>耗时 {run.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="mt-4 rounded-[22px] border border-dashed px-4 py-8 text-center text-sm leading-6 text-secondary"
              style={{ borderColor: "var(--border-strong)" }}
            >
              这条流程还没有被执行过，适合先回到编排页检查节点配置。
            </div>
          )}
        </section>

        <section className="surface-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                Execution Log
              </p>
              <h3 className="mt-2 text-base font-semibold text-primary">节点执行时间线</h3>
            </div>
            <Link href="/runs/demo-task" className="button-primary rounded-2xl px-3 py-2 text-xs font-semibold">
              查看任务详情
            </Link>
          </div>

          {snapshot.executionLogs.length ? (
            <div className="mt-4 space-y-3">
              {snapshot.executionLogs.map((log, index) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => onInspectNode(log.nodeId)}
                  className="surface-card-strong flex w-full items-start gap-3 rounded-[22px] p-4 text-left transition hover:border-cyan-400/16 hover:bg-cyan-400/6"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold"
                      style={{ borderColor: "var(--border-strong)" }}
                    >
                      {index + 1}
                    </span>
                    {index < snapshot.executionLogs.length - 1 ? (
                      <span className="mt-2 h-10 w-px bg-[var(--border)]" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-primary">{log.title}</p>
                        <p className="mt-1 text-xs text-secondary">{log.startedAt}</p>
                      </div>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-secondary">{log.detail}</p>
                    <p className="mt-3 text-xs font-medium text-tertiary">耗时 {log.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div
              className="mt-4 rounded-[22px] border border-dashed px-4 py-8 text-center text-sm leading-6 text-secondary"
              style={{ borderColor: "var(--border-strong)" }}
            >
              当前没有节点执行日志，运行一次后这里会展示完整链路。
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
