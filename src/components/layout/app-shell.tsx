"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { cx } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isWorkflowPage = pathname.startsWith("/workflows");

  function handleToggleSidebar() {
    setSidebarCollapsed((current) => !current);
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="shell-glow shell-glow-a absolute left-[-12rem] top-[-6rem] h-72 w-72" />
        <div className="shell-glow shell-glow-b absolute bottom-[-10rem] right-[-10rem] h-96 w-96" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1920px]">
        <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
        <div className="min-w-0 flex-1">
          <TopHeader
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
          <main
            className={cx(
              "pb-8 transition-[padding] duration-200",
              isWorkflowPage
                ? "px-3 pt-3 sm:px-4 lg:px-5"
                : "px-4 pt-4 sm:px-6 lg:px-8",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
