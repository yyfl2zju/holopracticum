"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Icon } from "@/components/shared/icon";
import type { WorkflowNodeCard } from "@/lib/types";
import { cx } from "@/lib/utils";

type WorkflowFlowNodeData = {
  node: WorkflowNodeCard;
  selected: boolean;
};

export type WorkflowFlowNodeType = Node<WorkflowFlowNodeData, "workflowNode">;

const nodeStateClasses: Record<WorkflowNodeCard["state"], string> = {
  idle: "border-[var(--border)] bg-[var(--surface-strong)]",
  active: "border-cyan-400/24 bg-cyan-400/10",
  success: "border-emerald-400/24 bg-emerald-400/8",
  warning: "border-amber-400/24 bg-amber-400/8",
  error: "border-rose-400/24 bg-rose-400/8",
};

export function WorkflowFlowNode({ data }: NodeProps<WorkflowFlowNodeType>) {
  const { node, selected } = data;
  const isResource = node.kind === "resource";

  return (
    <div
      className={cx(
        "relative border text-left transition duration-150",
        nodeStateClasses[node.state],
        isResource
          ? "flex h-full w-full flex-col items-center justify-center rounded-full px-3 py-4"
          : "flex h-full w-full flex-col justify-between rounded-[24px] px-4 py-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
        selected && "ring-2 ring-cyan-400/26 shadow-[0_18px_42px_rgba(15,118,110,0.12)]",
      )}
      style={{ width: node.width, height: node.height }}
    >
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        className="!h-3 !w-3 !border"
        style={{ borderColor: "var(--border-strong)", background: "var(--surface-strong)" }}
      />

      {isResource ? (
        <>
          <div className="surface-card-strong flex h-12 w-12 items-center justify-center rounded-full">
            <Icon name={node.icon} className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-primary">{node.title}</p>
          <p className="mt-1 text-center text-xs leading-5 text-secondary">{node.subtitle}</p>
        </>
      ) : (
        <>
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="surface-card-strong flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                  <Icon name={node.icon} className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-primary">{node.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-secondary">{node.subtitle}</p>
                </div>
              </div>

              {node.badges?.length ? (
                <span className="chip rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  {node.badges[0]}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {node.fields.slice(0, 2).map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-4 rounded-2xl border px-3 py-2 text-xs"
                style={{ borderColor: "var(--border)", background: "var(--surface-soft)" }}
              >
                <span className="text-tertiary">{field.label}</span>
                <span className="max-w-[60%] text-right font-medium text-primary">{field.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
