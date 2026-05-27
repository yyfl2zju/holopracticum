"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getPageMeta, navigationItems } from "@/lib/navigation";
import { cx } from "@/lib/utils";

type TopHeaderProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function TopHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: TopHeaderProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <header
      className="sticky top-0 z-20 border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--header-bg)",
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="button-secondary hidden h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold lg:inline-flex"
            >
              <Icon
                name={sidebarCollapsed ? "chevronRight" : "chevronLeft"}
                className="h-4 w-4"
              />
              {sidebarCollapsed ? "展开导航" : "收起导航"}
            </button>

            <div>
              <p className="eyebrow text-[11px] font-semibold uppercase tracking-[0.28em]">
                {meta.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                {meta.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="input-shell flex min-w-[240px] items-center gap-3 rounded-2xl px-4 py-3 text-sm text-secondary xl:min-w-[280px]">
              <Icon name="search" className="h-4 w-4 text-tertiary" />
              <input
                type="search"
                placeholder="搜索任务、模板或执行日志"
                className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-slate-500"
              />
            </label>

            <ThemeToggle />

            <button
              type="button"
              className="button-secondary rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              连接底座
            </button>

            <Link
              href="/tasks"
              className="button-primary rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              新建任务
            </Link>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin lg:hidden">
          {navigationItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold",
                  active
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                    : "border-white/8 bg-white/4 text-slate-300",
                )}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.shortLabel}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
