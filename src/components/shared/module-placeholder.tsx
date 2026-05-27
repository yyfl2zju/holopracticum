import type { ModulePlaceholderData } from "@/lib/types";

type ModulePlaceholderProps = {
  data: ModulePlaceholderData;
};

export function ModulePlaceholder({ data }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="panel-highlight rounded-[32px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Module Placeholder
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {data.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--foreground-muted)]">
          {data.description}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="panel rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">下一步补齐内容</h2>
          <div className="mt-5 space-y-3">
            {data.checklist.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="panel rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">后续待接接口</h2>
          <div className="mt-5 space-y-3">
            {data.integrationPoints.map((item) => (
              <code
                key={item}
                className="block rounded-2xl border border-cyan-400/12 bg-cyan-400/6 px-4 py-3 font-mono text-sm text-cyan-100"
              >
                {item}
              </code>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
