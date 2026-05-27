"use client";

import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import type { WorkflowNodeCard, WorkflowSnapshot, WorkflowTemplateScenario } from "@/lib/types";
import { cx } from "@/lib/utils";

type WorkflowInspectorProps = {
  template: WorkflowTemplateScenario;
  selectedNode: WorkflowNodeCard | undefined;
  snapshot: WorkflowSnapshot;
  onShowExecutions: () => void;
};

const visualStateLabels: Record<WorkflowNodeCard["state"], string> = {
  idle: "待配置",
  active: "当前节点",
  success: "可用",
  warning: "需确认",
  error: "异常",
};

const visualStateClasses: Record<WorkflowNodeCard["state"], string> = {
  idle: "chip",
  active: "chip-accent",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  error: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

export function WorkflowInspector({
  template,
  selectedNode,
  snapshot,
  onShowExecutions,
}: WorkflowInspectorProps) {
  const latestRun = snapshot.recentRuns[0];

  return (
    <aside className="scrollbar-thin min-h-[860px] overflow-y-auto p-4">
      <div className="space-y-4">
        <section className="surface-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                Node Inspector
              </p>
              <h3 className="mt-2 text-base font-semibold text-primary">
                {selectedNode?.title ?? "节点配置"}
              </h3>
            </div>
            {selectedNode ? (
              <span
                className={cx(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  visualStateClasses[selectedNode.state],
                )}
              >
                {visualStateLabels[selectedNode.state]}
              </span>
            ) : null}
          </div>

          {selectedNode ? (
            <>
              <div className="mt-4 flex items-start gap-3">
                <div className="surface-card-strong flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Icon name={selectedNode.icon} className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-6 text-secondary">{selectedNode.subtitle}</p>
                  {selectedNode.badges?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedNode.badges.map((badge) => (
                        <span
                          key={badge}
                          className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {selectedNode.fields.map((field) => (
                  <div key={field.label} className="surface-card-strong rounded-[20px] px-3.5 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-tertiary">
                      {field.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-primary">{field.value}</p>
                  </div>
                ))}
              </div>

              {selectedNode.notes?.length ? (
                <div className="mt-5 space-y-2">
                  {selectedNode.notes.map((note) => (
                    <div
                      key={note}
                      className="rounded-[20px] border px-3.5 py-3 text-sm leading-6 text-secondary"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div
              className="mt-4 rounded-[22px] border border-dashed px-4 py-5 text-sm leading-6 text-secondary"
              style={{ borderColor: "var(--border-strong)" }}
            >
              点击画布中的节点后，这里会展示该节点的参数、依赖和运行提示。
            </div>
          )}
        </section>

        <section className="surface-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                Workflow Snapshot
              </p>
              <h3 className="mt-2 text-base font-semibold text-primary">{template.title}</h3>
            </div>
            <StatusBadge status={snapshot.status} />
          </div>

          <p className="mt-3 text-sm leading-6 text-secondary">{snapshot.notice}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="surface-card-strong rounded-[20px] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">节点数</p>
              <p className="mt-2 text-lg font-semibold text-primary">{template.nodeCount}</p>
            </div>
            <div className="surface-card-strong rounded-[20px] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">已接服务</p>
              <p className="mt-2 text-lg font-semibold text-primary">{template.integrations.length}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {template.integrations.map((integration) => (
              <span key={integration} className="chip-accent rounded-full px-2.5 py-1 text-[10px] font-semibold">
                {integration}
              </span>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border px-4 py-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-tertiary">最近运行</p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {latestRun ? latestRun.summary : "当前没有运行记录"}
                </p>
              </div>
              <button
                type="button"
                onClick={onShowExecutions}
                className="button-secondary rounded-2xl px-3 py-2 text-xs font-semibold"
              >
                查看执行
              </button>
            </div>
            {latestRun ? (
              <div className="mt-3 grid gap-2 text-xs text-secondary">
                <p>触发来源: {latestRun.trigger}</p>
                <p>开始时间: {latestRun.startedAt}</p>
                <p>耗时: {latestRun.duration}</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </aside>
  );
}
