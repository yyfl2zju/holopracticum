"use client";

import { Icon } from "@/components/shared/icon";
import type { WorkflowLibraryGroup, WorkflowStudioData } from "@/lib/types";
import { cx } from "@/lib/utils";

type WorkflowNodeLibraryProps = {
  templates: WorkflowStudioData["templates"];
  nodeLibrary: WorkflowStudioData["nodeLibrary"];
  selectedTemplateId: string;
  collapsed: boolean;
  onTemplateChange: (templateId: string) => void;
  onToggleCollapse: () => void;
};

const groupLabels: Record<WorkflowLibraryGroup, string> = {
  trigger: "触发器",
  input: "输入",
  ai: "AI 节点",
  logic: "逻辑控制",
  human: "人工处理",
  output: "输出",
};

export function WorkflowNodeLibrary({
  templates,
  nodeLibrary,
  selectedTemplateId,
  collapsed,
  onTemplateChange,
  onToggleCollapse,
}: WorkflowNodeLibraryProps) {
  const groupedNodes = Object.entries(groupLabels).map(([group, label]) => ({
    group: group as WorkflowLibraryGroup,
    label,
    items: nodeLibrary.filter((item) => item.group === group),
  }));

  if (collapsed) {
    return (
      <aside
        className="flex min-h-[860px] flex-col items-center border-r px-3 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="button-secondary flex h-11 w-11 items-center justify-center rounded-2xl"
          aria-label="展开侧栏"
          title="展开侧栏"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>

        <div className="mt-5 flex flex-1 flex-col items-center gap-3">
          {templates.map((template, index) => {
            const active = template.id === selectedTemplateId;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onTemplateChange(template.id)}
                title={template.title}
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border text-xs font-semibold transition",
                  active
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                    : "border-white/8 bg-white/4 text-secondary hover:border-cyan-400/16 hover:bg-cyan-400/8",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            );
          })}
        </div>

        <div className="surface-card rounded-[20px] px-2 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary">
            {nodeLibrary.length} 节点
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex min-h-[860px] flex-col border-r" style={{ borderColor: "var(--border)" }}>
      <div className="border-b px-4 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-tertiary">
              Workflow Library
            </p>
            <h3 className="mt-2 text-base font-semibold text-primary">模板与节点</h3>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="button-secondary flex h-10 w-10 items-center justify-center rounded-2xl"
            aria-label="收起侧栏"
            title="收起侧栏"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </button>
        </div>

        <div className="input-shell mt-4 flex items-center gap-2 rounded-2xl px-3 py-2.5">
          <Icon name="search" className="h-4 w-4 text-secondary" />
          <input
            readOnly
            value=""
            placeholder="搜索模板或节点"
            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
              工作流模板
            </p>
            <span className="text-xs text-secondary">{templates.length} 个</span>
          </div>

          <div className="space-y-2">
            {templates.map((template) => {
              const active = template.id === selectedTemplateId;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onTemplateChange(template.id)}
                  className={cx(
                    "w-full rounded-[22px] border px-4 py-3 text-left transition",
                    active
                      ? "border-cyan-400/20 bg-cyan-400/10"
                      : "border-white/8 bg-white/4 hover:border-cyan-400/16 hover:bg-cyan-400/8",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{template.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-secondary">
                        {template.summary}
                      </p>
                    </div>
                    <span className="chip rounded-full px-2 py-1 text-[10px] font-semibold">
                      {template.nodeCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
            可用节点
          </p>

          {groupedNodes.map((group) => (
            <div key={group.group} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{group.label}</p>
                <span className="text-xs text-secondary">{group.items.length}</span>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="surface-card flex items-start gap-3 rounded-[20px] px-3.5 py-3"
                  >
                    <div className="surface-card-strong flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                      <Icon name={item.icon} className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-primary">{item.label}</p>
                        <span className="chip rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-secondary">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}
