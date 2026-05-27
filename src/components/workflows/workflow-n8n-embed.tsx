"use client";

import Link from "next/link";
import { Icon } from "@/components/shared/icon";

type WorkflowN8nEmbedProps = {
  editorUrl?: string;
};

export function WorkflowN8nEmbed({ editorUrl }: WorkflowN8nEmbedProps) {
  return (
    <div className="flex min-h-[820px] flex-col">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tertiary">
            n8n Editor
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary">
            当前模式直接嵌入独立运行的 n8n 编辑器，而不是把 Vue 源码硬塞进 Next 应用。
          </p>
        </div>

        {editorUrl ? (
          <Link
            href={editorUrl}
            target="_blank"
            rel="noreferrer"
            className="button-secondary rounded-2xl px-4 py-2.5 text-sm font-semibold"
          >
            在新窗口打开 n8n
          </Link>
        ) : null}
      </div>

      {editorUrl ? (
        <div className="relative min-h-[744px]">
          <iframe
            src={editorUrl}
            title="n8n editor"
            className="h-[744px] w-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <div className="flex min-h-[744px] items-center justify-center p-6">
          <div className="panel w-full max-w-3xl rounded-[32px] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="surface-card-strong flex h-12 w-12 items-center justify-center rounded-2xl">
                <Icon name="workflow" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary">n8n 编辑器已接入预留位</h3>
                <p className="mt-3 text-sm leading-7 text-secondary">
                  当前仓库已经克隆到 <code className="font-mono text-[12px] text-primary">vendor/n8n</code>，
                  但本机还没有可运行的 n8n Editor 实例，所以这里只展示接入壳。配置
                  <code className="mx-1 font-mono text-[12px] text-primary">NEXT_PUBLIC_N8N_EDITOR_URL</code>
                  后，这里会直接嵌入真实编辑器。
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">当前发现</p>
                    <p className="mt-2 text-sm leading-6 text-primary">
                      n8n 编辑器是 Vue 3 + Vue Flow，不是 React 组件。
                    </p>
                  </div>
                  <div className="surface-card rounded-[24px] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-tertiary">当前阻塞</p>
                    <p className="mt-2 text-sm leading-6 text-primary">
                      本机 Node 是 22.15，n8n 需要 22.16+，且当前没有 pnpm。
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border px-4 py-4" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold text-primary">建议接入方式</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    1. 单独运行 n8n Editor。
                    2. 通过环境变量把 URL 注入当前工作流页。
                    3. 保留我们自己的任务、日志和平台壳。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
