"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/icon";
import { navigationItems } from "@/lib/navigation";
import { cx } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cx(
        "hidden shrink-0 px-4 py-4 transition-[width] duration-200 lg:block",
        collapsed ? "w-[108px]" : "w-[300px]",
      )}
    >
      <div
        className={cx(
          "panel sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[32px] border-white/10 transition-[padding] duration-200",
          collapsed ? "px-3 py-4" : "px-5 py-6",
        )}
      >
        <div className="surface-accent rounded-[28px] px-3 py-4">
          <div
            className={cx(
              "flex gap-3",
              collapsed ? "flex-col items-center" : "items-start justify-between",
            )}
          >
            <div className={cx("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="surface-card flex h-11 w-11 items-center justify-center rounded-2xl text-cyan-100">
                <Icon name="spark" className="h-5 w-5" />
              </div>
              {!collapsed ? (
                <div>
                  <p className="eyebrow text-[11px] font-semibold uppercase tracking-[0.22em]">
                    AI Agent Platform
                  </p>
                  <h1 className="mt-1 text-lg font-semibold tracking-tight text-primary">
                    HoloPracticum
                  </h1>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="button-secondary flex h-10 w-10 items-center justify-center rounded-2xl"
              aria-label={collapsed ? "展开导航" : "收起导航"}
              title={collapsed ? "展开导航" : "收起导航"}
            >
              <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="h-4 w-4" />
            </button>
          </div>

          {!collapsed ? (
            <p className="mt-4 text-sm leading-6 text-secondary">
              为小微企业、创业者和自由职业者提供统一 AI 工作台与任务编排体验。
            </p>
          ) : (
            <p className="mt-3 text-center text-[11px] leading-5 text-secondary">导航</p>
          )}
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto scrollbar-thin pr-1">
          {!collapsed ? (
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-tertiary">
              Workspace
            </p>
          ) : null}

          <div className={cx("mt-3 space-y-2", collapsed && "space-y-3")}>
            {navigationItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cx(
                    "group rounded-2xl border transition",
                    active
                      ? "border-cyan-400/20 bg-cyan-400/10 text-white"
                      : "border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/4 hover:text-white",
                    collapsed
                      ? "flex justify-center px-0 py-3"
                      : "flex items-start gap-3 px-3 py-3",
                  )}
                >
                  <div
                    className={cx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
                      active
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                        : "border-white/6 bg-white/4 text-slate-400 group-hover:text-cyan-200",
                    )}
                  >
                    <Icon name={item.icon} className="h-4.5 w-4.5" />
                  </div>

                  {!collapsed ? (
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{item.label}</span>
                        {active ? (
                          <span className="rounded-full border border-cyan-400/16 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                        {item.description}
                      </p>
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

      </div>
    </aside>
  );
}
