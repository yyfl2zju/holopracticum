"use client";

import { Icon } from "@/components/shared/icon";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="button-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
      aria-label={isDark ? "切换到白昼模式" : "切换到夜间模式"}
    >
      <Icon name={isDark ? "sun" : "moon"} className="h-4 w-4" />
      {isDark ? "白昼模式" : "夜间模式"}
    </button>
  );
}
