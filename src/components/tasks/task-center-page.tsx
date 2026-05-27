"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/icon";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { TaskFlowPreview } from "@/components/tasks/task-flow-preview";
import { TaskHistoryPanel } from "@/components/tasks/task-history-panel";
import { TaskIntakePanel } from "@/components/tasks/task-intake-panel";
import type { TaskCenterData, TaskCenterViewState } from "@/lib/types";

type TaskCenterPageProps = {
  data: TaskCenterData;
};

const uploadStatusMeta = {
  parsed: {
    label: "已解析",
    className: "border-emerald-400/16 bg-emerald-400/8 text-emerald-100",
  },
  uploading: {
    label: "上传中",
    className: "border-amber-400/16 bg-amber-400/8 text-amber-100",
  },
  failed: {
    label: "失败",
    className: "border-rose-400/16 bg-rose-400/8 text-rose-100",
  },
} as const;

export function TaskCenterPage({ data }: TaskCenterPageProps) {
  const [draftValue, setDraftValue] = useState(data.draftInput);
  const [viewState, setViewState] = useState<TaskCenterViewState>("default");
  const snapshot = data.stateSnapshots[viewState];
  const primarySignal = data.recognizedSignals[0];
  const recommendedTemplate = data.templates[0];
  const sessionStatus =
    viewState === "success"
      ? "planning"
      : viewState === "loading"
        ? "running"
        : viewState === "error"
          ? "failed"
          : viewState === "empty"
            ? "queued"
            : "draft";

  function handlePresetSelect(value: string) {
    setDraftValue(value);
    if (viewState === "empty") {
      setViewState("default");
    }
  }

  return (
    <div className="space-y-6">
      <section id="overview" className="panel-highlight scroll-mt-32 rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
          <div>
            <span className="chip-accent inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              <Icon name="tasks" className="h-3.5 w-3.5" />
              Unified Task Intake
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {data.hero.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">{data.hero.description}</p>
          </div>

          <div className="panel rounded-[28px] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-tertiary">当前会话</p>
                <p className="mt-2 text-lg font-semibold text-primary">{snapshot.title}</p>
              </div>
              <StatusBadge status={sessionStatus} />
            </div>

            <div className="mt-5 space-y-3">
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">识别结果</p>
                <p className="mt-2 text-sm font-semibold text-primary">{primarySignal?.label ?? "等待识别"}</p>
                <p className="mt-2 text-sm leading-6 text-secondary">{primarySignal?.reason}</p>
              </div>
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">推荐模板</p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {recommendedTemplate?.title ?? "暂无推荐"}
                </p>
                <p className="mt-2 text-sm leading-6 text-secondary">
                  {recommendedTemplate?.summary ?? "请补充输入后再匹配模板。"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-card-strong rounded-[20px] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">附件数量</p>
                  <p className="mt-2 text-base font-semibold text-primary">{data.uploads.length} 份</p>
                </div>
                <div className="surface-card-strong rounded-[20px] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">下一步</p>
                  <p className="mt-2 text-base font-semibold text-primary">{snapshot.actionLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "任务概览", hint: "当前识别与推荐结果" },
          { href: "#intake", label: "任务输入", hint: "输入内容、标签与附件" },
          { href: "#flow", label: "执行路径", hint: "推荐链路与历史任务" },
        ]}
      />

      <section id="intake" className="scroll-mt-32 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <TaskIntakePanel
          value={draftValue}
          onChange={setDraftValue}
          onPresetSelect={handlePresetSelect}
          promptPresets={data.promptPresets}
          acceptedFileTypes={data.acceptedFileTypes}
          recognizedSignals={data.recognizedSignals}
          actionLabel={snapshot.actionLabel}
          previewState={viewState}
        />

        <aside className="space-y-6">
          <article className="panel rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
                  Upload Queue
                </p>
                <h2 className="mt-2 text-xl font-semibold text-primary">附件与上下文</h2>
              </div>
              <Icon name="document" className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 space-y-3">
              {data.uploads.map((file) => (
                <div key={file.id} className="surface-card rounded-[24px] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">{file.name}</p>
                      <p className="mt-1 text-xs text-secondary">
                        {file.size} · {file.kind}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${uploadStatusMeta[file.status].className}`}
                    >
                      {uploadStatusMeta[file.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel rounded-[32px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">本次分流</p>
            <div className="mt-4 space-y-3">
              {data.recognizedSignals.map((signal) => (
                <div key={signal.id} className="surface-card rounded-[24px] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">{signal.label}</p>
                    <span className="chip rounded-full px-2.5 py-1 text-[10px] font-semibold">
                      {Math.round(signal.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary">{signal.reason}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section id="flow" className="scroll-mt-32 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <TaskFlowPreview steps={data.recommendedFlow} />
        <TaskHistoryPanel
          viewState={viewState}
          onViewStateChange={setViewState}
          snapshot={snapshot}
          templates={data.templates}
        />
      </section>
    </div>
  );
}
