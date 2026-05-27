"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  WorkflowFlowNode,
  type WorkflowFlowNodeType,
} from "@/components/workflows/workflow-flow-node";
import type { WorkflowSnapshot, WorkflowTemplateScenario } from "@/lib/types";

type WorkflowCanvasProps = {
  template: WorkflowTemplateScenario;
  snapshot: WorkflowSnapshot;
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
};

type WorkflowFlowNodeData = WorkflowFlowNodeType["data"];

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowFlowNode,
};

function getSourceHandleId(side: WorkflowTemplateScenario["edges"][number]["sourceSide"]) {
  if (side === "left") {
    return "left-source";
  }

  if (side === "top") {
    return "top-source";
  }

  return side;
}

function getTargetHandleId(side: WorkflowTemplateScenario["edges"][number]["targetSide"]) {
  if (side === "right") {
    return "right-target";
  }

  if (side === "bottom") {
    return "bottom-target";
  }

  return side;
}

function WorkflowFlow({
  template,
  snapshot,
  selectedNodeId,
  onNodeSelect,
}: WorkflowCanvasProps) {
  const nodes: Array<Node<WorkflowFlowNodeData, "workflowNode">> = template.nodes.map((node) => ({
    id: node.id,
    type: "workflowNode",
    position: { x: node.x, y: node.y },
    data: {
      node,
      selected: node.id === selectedNodeId,
    },
    draggable: false,
    selectable: true,
    style: {
      width: node.width,
      height: node.height,
      background: "transparent",
      border: "none",
      padding: 0,
    },
  }));

  const edges: Edge[] = template.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: getSourceHandleId(edge.sourceSide),
    targetHandle: getTargetHandleId(edge.targetSide),
    type: "smoothstep",
    label: edge.label,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: edge.style === "dashed" ? "var(--accent)" : "var(--foreground-soft)",
    },
    animated: edge.style === "dashed",
    style: {
      stroke: edge.style === "dashed" ? "var(--accent)" : "var(--foreground-soft)",
      strokeWidth: edge.style === "dashed" ? 2.2 : 2,
      strokeDasharray: edge.style === "dashed" ? "8 8" : undefined,
      opacity: edge.style === "dashed" ? 0.78 : 0.88,
    },
    labelStyle: {
      fill: "var(--foreground)",
      fontSize: 11,
      fontWeight: 700,
    },
    labelBgStyle: {
      fill: "var(--surface-strong)",
      stroke: "var(--accent-border)",
      strokeWidth: 1,
    },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 999,
  }));

  return (
    <div className="workflow-grid relative min-h-[860px] overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="panel-soft pointer-events-auto rounded-[22px] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">
            当前视图
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-primary">{template.title}</p>
            <StatusBadge status={snapshot.status} />
          </div>
        </div>

        <div className="panel-soft pointer-events-auto rounded-[22px] px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">
            编辑提示
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">点击节点查看配置</p>
          <p className="mt-1 text-xs leading-5 text-secondary">资源节点通过虚线绑定到 Agent 节点</p>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        fitView
        fitViewOptions={{ padding: 0.14 }}
        minZoom={0.55}
        maxZoom={1.4}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        className="h-[860px] w-full"
        style={{ background: "transparent" }}
      >
        <Background
          id="workflow-bg"
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="color-mix(in srgb, var(--border-strong) 68%, transparent)"
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!border !shadow-none"
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          maskColor="color-mix(in srgb, var(--surface) 78%, transparent)"
          style={{
            background: "color-mix(in srgb, var(--surface-strong) 92%, transparent)",
            border: "1px solid var(--border)",
          }}
          nodeColor={() => "var(--accent-muted)"}
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowFlow {...props} />
    </ReactFlowProvider>
  );
}
