"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { CodeArtifact, DevelopmentSnapshot } from "@/lib/types";
import { cx } from "@/lib/utils";

type DevelopmentOutputPanelProps = {
  snapshot: DevelopmentSnapshot;
};

const noticeClassName = {
  neutral: "surface-accent text-primary",
  success: "border border-emerald-400/16 bg-emerald-400/8 text-primary",
  warning: "border border-amber-400/16 bg-amber-400/8 text-primary",
  danger: "border border-rose-400/16 bg-rose-400/8 text-primary",
} as const;

export function DevelopmentOutputPanel({ snapshot }: DevelopmentOutputPanelProps) {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    snapshot.codeArtifacts[0]?.id ?? null,
  );

  const selectedArtifact =
    snapshot.codeArtifacts.find((artifact) => artifact.id === selectedArtifactId) ??
    snapshot.codeArtifacts[0] ??
    null;

  return (
    <section className="space-y-6">
      <article className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
              Generated Output
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary">代码结果面板</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">{snapshot.summary}</p>
          </div>
          <StatusBadge status={snapshot.status} />
        </div>

        <div className={cx("mt-5 rounded-[28px] px-4 py-4", noticeClassName[snapshot.noticeTone])}>
          <p className="text-sm font-semibold">{snapshot.title}</p>
          <p className="mt-2 text-sm leading-6 opacity-90">{snapshot.notice}</p>
        </div>

        {snapshot.codeArtifacts.length > 0 ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
            <div className="space-y-3">
              {snapshot.codeArtifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  type="button"
                  onClick={() => setSelectedArtifactId(artifact.id)}
                  className={cx(
                    "w-full rounded-[24px] border px-4 py-4 text-left transition",
                    artifact.id === selectedArtifactId
                      ? "surface-accent"
                      : "surface-card hover:border-[var(--border-strong)]",
                  )}
                >
                  <p className="text-sm font-semibold text-primary">{artifact.title}</p>
                  <p className="mt-1 font-mono text-xs text-tertiary">{artifact.filename}</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">{artifact.summary}</p>
                </button>
              ))}
            </div>

            {selectedArtifact ? <CodePreview artifact={selectedArtifact} /> : null}
          </div>
        ) : (
          <div className="mt-5 rounded-[28px] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
            <p className="text-base font-semibold text-primary">当前没有代码草案</p>
            <p className="mt-2 text-sm leading-6 text-secondary">
              切换到“成功”状态可查看 mock 生成结果。
            </p>
          </div>
        )}
      </article>

      <article className="panel rounded-[32px] p-6">
        <div>
          <p className="eyebrow text-xs font-semibold uppercase tracking-[0.24em]">
            API Suggestions
          </p>
          <h2 className="mt-2 text-xl font-semibold text-primary">API 设计建议</h2>
        </div>

        <div className="mt-5 space-y-3">
          {snapshot.apiSuggestions.length > 0 ? (
            snapshot.apiSuggestions.map((api) => (
              <div key={api.id} className="surface-card rounded-[28px] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip-accent rounded-full px-3 py-1 text-xs font-semibold">
                    {api.method}
                  </span>
                  <code className="font-mono text-sm text-primary">{api.path}</code>
                </div>
                <p className="mt-3 text-sm leading-6 text-secondary">{api.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {api.payload.map((field) => (
                    <span key={field} className="chip rounded-full px-3 py-1 text-xs">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card rounded-[28px] p-4">
              <p className="text-sm leading-6 text-secondary">
                当前状态下没有生成 API 设计建议。
              </p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function CodePreview({ artifact }: { artifact: CodeArtifact }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[color:var(--background-muted)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-primary">{artifact.filename}</p>
          <p className="mt-1 text-xs text-tertiary">{artifact.language}</p>
        </div>
        <span className="chip rounded-full px-3 py-1 text-xs">{artifact.language}</span>
      </div>
      <pre className="scrollbar-thin overflow-x-auto px-4 py-4 font-mono text-[13px] leading-6 text-primary">
        <code>{artifact.content}</code>
      </pre>
    </div>
  );
}
