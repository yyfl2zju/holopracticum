"use client";

import { useState } from "react";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { DevelopmentComposerPanel } from "@/components/development/development-composer-panel";
import { DevelopmentOutputPanel } from "@/components/development/development-output-panel";
import { DevelopmentQualityPanel } from "@/components/development/development-quality-panel";
import type {
  DevelopmentAssistantData,
  DevelopmentStackId,
  TaskCenterViewState,
} from "@/lib/types";

type DevelopmentAssistantPageProps = {
  data: DevelopmentAssistantData;
};

export function DevelopmentAssistantPage({
  data,
}: DevelopmentAssistantPageProps) {
  const [requirement, setRequirement] = useState(data.requirementInput);
  const [selectedStack, setSelectedStack] = useState<DevelopmentStackId>(data.defaultStack);
  const [viewState, setViewState] = useState<TaskCenterViewState>("success");
  const snapshot = data.stateSnapshots[viewState];
  const selectedStackLabel =
    data.stackOptions.find((item) => item.id === selectedStack)?.label ?? "未选择";

  return (
    <div className="space-y-6">
      <section id="overview" className="panel-highlight scroll-mt-32 rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
              Engineering Workspace
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
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">当前技术栈</p>
              <p className="mt-3 text-2xl font-semibold text-primary">{selectedStackLabel}</p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">生成状态</p>
              <div className="mt-3">
                <StatusBadge status={snapshot.status} />
              </div>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">代码草案</p>
              <p className="mt-3 text-base font-semibold text-primary">
                {snapshot.codeArtifacts.length} 份可查看产物
              </p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">测试与发布</p>
              <p className="mt-3 text-base font-semibold text-primary">
                {snapshot.testSuggestions.length} 条测试建议 / {snapshot.pipelineSuggestions.length} 条流水线建议
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "开发概览", hint: "技术栈与生成状态" },
          { href: "#composer", label: "需求输入", hint: "需求、栈选择与生成动作" },
          { href: "#output", label: "生成结果", hint: "代码与接口草案" },
          { href: "#quality", label: "测试发布", hint: "测试与 CI 建议" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div id="composer" className="scroll-mt-32">
          <DevelopmentComposerPanel
            data={data}
            requirement={requirement}
            onRequirementChange={setRequirement}
            selectedStack={selectedStack}
            onStackChange={setSelectedStack}
            viewState={viewState}
            onViewStateChange={setViewState}
            actionLabel={snapshot.actionLabel}
          />
        </div>
        <div id="output" className="scroll-mt-32">
          <DevelopmentOutputPanel snapshot={snapshot} />
        </div>
      </section>

      <div id="quality" className="scroll-mt-32">
        <DevelopmentQualityPanel data={data} snapshot={snapshot} />
      </div>
    </div>
  );
}
