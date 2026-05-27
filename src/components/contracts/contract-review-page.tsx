"use client";

import { useState } from "react";
import { PageSectionNav } from "@/components/shared/page-section-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { ContractAssetsPanel } from "@/components/contracts/contract-assets-panel";
import { ContractRiskPanel } from "@/components/contracts/contract-risk-panel";
import { ContractWorkspacePanel } from "@/components/contracts/contract-workspace-panel";
import type {
  ContractReviewData,
  ContractTypeOption,
  TaskCenterViewState,
} from "@/lib/types";

type ContractReviewPageProps = {
  data: ContractReviewData;
};

export function ContractReviewPage({ data }: ContractReviewPageProps) {
  const [selectedType, setSelectedType] = useState<ContractTypeOption>(data.defaultType);
  const [viewState, setViewState] = useState<TaskCenterViewState>("success");
  const selectedLabel =
    data.contractTypes.find((item) => item.id === selectedType)?.label ?? "未选择";
  const snapshot = data.stateSnapshots[viewState];

  return (
    <div className="space-y-6">
      <section id="overview" className="panel-highlight scroll-mt-32 rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.28em]">
              Legal Workspace
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
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">当前合同类型</p>
              <p className="mt-3 text-2xl font-semibold text-primary">{selectedLabel}</p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">审查状态</p>
              <div className="mt-3">
                <StatusBadge status={snapshot.status} />
              </div>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">风险概览</p>
              <p className="mt-3 text-base font-semibold text-primary">{snapshot.riskCountLabel}</p>
            </div>
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-tertiary">导出能力</p>
              <p className="mt-3 text-base font-semibold text-primary">
                {data.exportOptions.length} 个导出动作已预留
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageSectionNav
        items={[
          { href: "#overview", label: "合同概览", hint: "类型、状态与风险总览" },
          { href: "#workspace", label: "审查工作台", hint: "输入、上传与状态切换" },
          { href: "#risks", label: "风险结果", hint: "风险条款与修改建议" },
          { href: "#assets", label: "模板资产", hint: "模板、案例与导出" },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div id="workspace" className="scroll-mt-32">
          <ContractWorkspacePanel
            data={data}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            viewState={viewState}
            onViewStateChange={setViewState}
          />
        </div>
        <div id="risks" className="scroll-mt-32">
          <ContractRiskPanel snapshot={snapshot} />
        </div>
      </section>

      <div id="assets" className="scroll-mt-32">
        <ContractAssetsPanel data={data} />
      </div>
    </div>
  );
}
