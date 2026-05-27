"use client";

import { useState } from "react";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { ContentCompliancePanel } from "@/components/content/content-compliance-panel";
import { ContentComposerPanel } from "@/components/content/content-composer-panel";
import { ContentOutputPanel } from "@/components/content/content-output-panel";
import type {
  ContentPlatformId,
  ContentStudioData,
  ContentStyleId,
  TaskCenterViewState,
} from "@/lib/types";

type ContentStudioPageProps = {
  data: ContentStudioData;
};

export function ContentStudioPage({ data }: ContentStudioPageProps) {
  const [topic, setTopic] = useState(data.topicInput);
  const [selectedStyle, setSelectedStyle] = useState<ContentStyleId>(data.defaultStyle);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ContentPlatformId[]>(
    data.defaultPlatforms,
  );
  const [viewState, setViewState] = useState<TaskCenterViewState>("success");
  const snapshot = data.stateSnapshots[viewState];
  const styleLabel =
    data.styleOptions.find((item) => item.id === selectedStyle)?.label ?? "未选择";

  function handlePlatformToggle(platformId: ContentPlatformId) {
    setSelectedPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((item) => item !== platformId)
        : [...current, platformId],
    );
  }

  return (
    <div className="space-y-6">
      <section id="overview" className="panel-highlight scroll-mt-32 rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
              Content Operations
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
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">创作风格</p>
              <p className="mt-3 text-2xl font-semibold text-primary">{styleLabel}</p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">生成状态</p>
              <div className="mt-3">
                <StatusBadge status={snapshot.status} />
              </div>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">目标平台</p>
              <p className="mt-3 text-base font-semibold text-primary">
                已选择 {selectedPlatforms.length} 个平台
              </p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">内容产物</p>
              <p className="mt-3 text-base font-semibold text-primary">
                {snapshot.generatedTitles.length} 个标题 / {snapshot.rewrites.length} 个平台版本
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "内容概览", hint: "风格、平台与状态" },
          { href: "#composer", label: "创作输入", hint: "主题、风格与平台选择" },
          { href: "#output", label: "生成结果", hint: "标题、正文与改写" },
          { href: "#compliance", label: "合规检查", hint: "审查与提示词" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div id="composer" className="scroll-mt-32">
          <ContentComposerPanel
            data={data}
            topic={topic}
            onTopicChange={setTopic}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            selectedPlatforms={selectedPlatforms}
            onPlatformToggle={handlePlatformToggle}
            viewState={viewState}
            onViewStateChange={setViewState}
            actionLabel={snapshot.actionLabel}
          />
        </div>
        <div id="output" className="scroll-mt-32">
          <ContentOutputPanel snapshot={snapshot} />
        </div>
      </section>

      <div id="compliance" className="scroll-mt-32">
        <ContentCompliancePanel data={data} snapshot={snapshot} />
      </div>
    </div>
  );
}
