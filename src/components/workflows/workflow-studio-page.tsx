"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/icon";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";
import { WorkflowExecutionsPanel } from "@/components/workflows/workflow-executions-panel";
import { WorkflowInspector } from "@/components/workflows/workflow-inspector";
import { WorkflowN8nEmbed } from "@/components/workflows/workflow-n8n-embed";
import { WorkflowNodeLibrary } from "@/components/workflows/workflow-node-library";
import type { TaskCenterViewState, WorkflowStudioData, WorkflowTab } from "@/lib/types";
import { cx } from "@/lib/utils";

type WorkflowStudioPageProps = {
  data: WorkflowStudioData;
  n8nEditorUrl?: string;
};

type WorkflowBuilderMode = "platform" | "n8n";

const tabOptions: Array<{ id: WorkflowTab; label: string }> = [
  { id: "editor", label: "编排视图" },
  { id: "executions", label: "执行记录" },
];

const viewStateOptions: Array<{ id: TaskCenterViewState; label: string }> = [
  { id: "default", label: "草稿" },
  { id: "loading", label: "运行中" },
  { id: "success", label: "成功" },
  { id: "empty", label: "空记录" },
  { id: "error", label: "异常" },
];

export function WorkflowStudioPage({ data, n8nEditorUrl }: WorkflowStudioPageProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(data.defaultTemplateId);
  const selectedTemplate =
    data.templates.find((template) => template.id === selectedTemplateId) ?? data.templates[0];
  const [selectedNodeId, setSelectedNodeId] = useState(selectedTemplate.defaultSelectedNodeId);
  const [activeTab, setActiveTab] = useState<WorkflowTab>("editor");
  const [viewState, setViewState] = useState<TaskCenterViewState>("success");
  const [isActive, setIsActive] = useState(true);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [builderMode, setBuilderMode] = useState<WorkflowBuilderMode>("platform");

  const snapshot = data.stateSnapshots[viewState];
  const selectedNode =
    selectedTemplate.nodes.find((node) => node.id === selectedNodeId) ??
    selectedTemplate.nodes.find((node) => node.id === selectedTemplate.defaultSelectedNodeId) ??
    selectedTemplate.nodes[0];
  const latestRun = snapshot.recentRuns[0];

  function handleTemplateChange(templateId: string) {
    const nextTemplate = data.templates.find((template) => template.id === templateId);

    setSelectedTemplateId(templateId);
    setSelectedNodeId(nextTemplate?.defaultSelectedNodeId ?? selectedTemplate.defaultSelectedNodeId);
    setActiveTab("editor");
  }

  function handleInspectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
    setActiveTab("editor");
  }

  return (
    <div className="space-y-6">
      <section id="overview" className="panel scroll-mt-32 rounded-[32px] p-6 sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.26em]">
              Workflow Editor
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                {data.workflowName}
              </h1>
              <StatusBadge status={snapshot.status} />
              <span className="chip-accent rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
                {selectedTemplate.category}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-secondary">
              {data.workflowSubtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTemplate.tags.map((tag) => (
                <span key={tag} className="chip rounded-full px-3 py-1.5 text-[11px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[480px] xl:max-w-[520px]">
            <div className="surface-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">当前模板</p>
              <p className="mt-3 text-sm font-semibold text-primary">{selectedTemplate.title}</p>
              <p className="mt-2 text-xs leading-5 text-secondary">{selectedTemplate.nodeCount} 个节点</p>
            </div>
            <div className="surface-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">最近保存</p>
              <p className="mt-3 text-sm font-semibold text-primary">{snapshot.savedAt}</p>
              <p className="mt-2 text-xs leading-5 text-secondary">
                {selectedNode?.title ?? "未选择节点"}
              </p>
            </div>
            <div className="surface-card rounded-[24px] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">最近运行</p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {latestRun ? latestRun.startedAt : "暂无记录"}
              </p>
              <p className="mt-2 text-xs leading-5 text-secondary">
                {latestRun ? latestRun.summary : "新模板尚未执行"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "工作流信息", hint: "名称、状态与当前模板" },
          { href: "#editor", label: "编排画布", hint: "模板库、节点与主画布" },
          { href: "#inspector", label: "节点配置", hint: "查看当前节点参数" },
        ]}
      />

      <section id="editor" className="panel scroll-mt-32 overflow-hidden rounded-[34px]">
        <div className="border-b px-4 py-4 sm:px-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="surface-card-strong flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Icon name="workflow" className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
                    编辑器
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-primary">
                    {selectedTemplate.title}
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary">
                {selectedTemplate.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {n8nEditorUrl ? (
                <div className="surface-card-strong inline-flex rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => setBuilderMode("platform")}
                    className={cx(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
                      builderMode === "platform"
                        ? "bg-[var(--surface-strong)] text-primary shadow-[0_10px_24px_rgba(15,23,42,0.1)]"
                        : "text-secondary",
                    )}
                  >
                    平台编排
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderMode("n8n")}
                    className={cx(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
                      builderMode === "n8n"
                        ? "bg-[var(--surface-strong)] text-primary shadow-[0_10px_24px_rgba(15,23,42,0.1)]"
                        : "text-secondary",
                    )}
                  >
                    n8n 编辑器
                  </button>
                </div>
              ) : null}

              <div className="surface-card-strong inline-flex rounded-2xl p-1">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cx(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
                      activeTab === tab.id
                        ? "bg-[var(--surface-strong)] text-primary shadow-[0_10px_24px_rgba(15,23,42,0.1)]"
                        : "text-secondary",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="surface-card-strong inline-flex rounded-2xl p-1">
                {viewStateOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setViewState(option.id)}
                    className={cx(
                      "rounded-xl px-3 py-2 text-xs font-semibold transition",
                      viewState === option.id
                        ? "bg-[var(--surface-strong)] text-primary shadow-[0_8px_22px_rgba(15,23,42,0.08)]"
                        : "text-secondary",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-2 rounded-full border px-3 py-2"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-xs font-semibold text-secondary">
                  {isActive ? "已启用" : "已停用"}
                </span>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setIsActive((current) => !current)}
                  className={cx(
                    "relative h-7 w-12 rounded-full transition",
                    isActive ? "bg-cyan-400/18" : "bg-white/6",
                  )}
                >
                  <span
                    className={cx(
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition",
                      isActive ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </div>

              <button type="button" className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold">
                保存
              </button>
              <button type="button" className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold">
                试运行
              </button>
              <button type="button" className="button-primary rounded-2xl px-4 py-2.5 text-sm font-semibold">
                发布
              </button>
            </div>
          </div>
        </div>

        {activeTab === "editor" && builderMode === "platform" ? (
          <div
            className={cx(
              "grid min-h-[860px] gap-0",
              libraryCollapsed
                ? "xl:grid-cols-[84px_minmax(760px,1fr)_320px]"
                : "xl:grid-cols-[280px_minmax(760px,1fr)_320px]",
            )}
          >
            <WorkflowNodeLibrary
              templates={data.templates}
              nodeLibrary={data.nodeLibrary}
              selectedTemplateId={selectedTemplate.id}
              collapsed={libraryCollapsed}
              onTemplateChange={handleTemplateChange}
              onToggleCollapse={() => setLibraryCollapsed((current) => !current)}
            />
            <div className="min-w-0 border-x" style={{ borderColor: "var(--border)" }}>
              <WorkflowCanvas
                template={selectedTemplate}
                snapshot={snapshot}
                selectedNodeId={selectedNode.id}
                onNodeSelect={setSelectedNodeId}
              />
            </div>
            <div id="inspector" className="scroll-mt-32">
              <WorkflowInspector
                template={selectedTemplate}
                selectedNode={selectedNode}
                snapshot={snapshot}
                onShowExecutions={() => setActiveTab("executions")}
              />
            </div>
          </div>
        ) : activeTab === "editor" ? (
          <WorkflowN8nEmbed editorUrl={n8nEditorUrl} />
        ) : (
          <WorkflowExecutionsPanel
            template={selectedTemplate}
            snapshot={snapshot}
            onInspectNode={handleInspectNode}
            onShowEditor={() => setActiveTab("editor")}
          />
        )}
      </section>
    </div>
  );
}
