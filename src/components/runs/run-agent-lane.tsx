"use client";

import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AgentStatusCardData } from "@/lib/types";

type RunAgentLaneProps = {
  agents: AgentStatusCardData[];
};

export function RunAgentLane({ agents }: RunAgentLaneProps) {
  return (
    <section className="panel rounded-[32px] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-tertiary">
            Agent Lane
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">多 Agent 协作带</h2>
        </div>
        <span className="chip-accent rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
          {agents.length} 个 Agent
        </span>
      </div>

      {agents.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {agents.map((agent) => (
            <article key={agent.id} className="surface-card rounded-[26px] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="surface-card-strong flex h-11 w-11 items-center justify-center rounded-2xl">
                    <Icon name="agent" className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{agent.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">
                      {agent.role}
                    </p>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              <p className="mt-4 text-sm font-medium text-primary">{agent.currentAction}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{agent.outputSummary}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-secondary">
                <span className="chip rounded-full px-2.5 py-1">延迟 {agent.latency}</span>
                <span className="chip rounded-full px-2.5 py-1">队列 {agent.queueDepth}</span>
                <span className="chip rounded-full px-2.5 py-1">更新时间 {agent.timestamp}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div
          className="mt-5 rounded-[24px] border border-dashed px-4 py-10 text-center text-sm leading-6 text-secondary"
          style={{ borderColor: "var(--border-strong)" }}
        >
          当前没有 Agent 执行数据，适合展示新任务或空结果场景。
        </div>
      )}
    </section>
  );
}
