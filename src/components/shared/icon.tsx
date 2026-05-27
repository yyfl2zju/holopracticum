import type { ReactNode } from "react";
import type { IconName } from "@/lib/types";

type IconProps = {
  name: IconName;
  className?: string;
};

const iconPaths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </>
  ),
  tasks: (
    <>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h9" />
      <path d="M3.5 7h.01" />
      <path d="M3.5 12h.01" />
      <path d="M3.5 17h.01" />
    </>
  ),
  contract: (
    <>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h5.5" />
    </>
  ),
  development: (
    <>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 4-4 16" />
    </>
  ),
  content: (
    <>
      <path d="M5 5h14v14H5z" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </>
  ),
  insights: (
    <>
      <path d="M4 19V5" />
      <path d="M10 19V9" />
      <path d="M16 19v-6" />
      <path d="M22 19V3" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="4" width="6" height="4" rx="1.5" />
      <rect x="15" y="4" width="6" height="4" rx="1.5" />
      <rect x="9" y="16" width="6" height="4" rx="1.5" />
      <path d="M9 6h6" />
      <path d="M18 8v4" />
      <path d="M6 8v4" />
      <path d="M6 12h12" />
      <path d="M12 12v4" />
    </>
  ),
  logs: (
    <>
      <path d="M8 6h10" />
      <path d="M8 12h10" />
      <path d="M8 18h10" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 5 3.4 8.6 7 10 3.6-1.4 7-5 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.6" />
    </>
  ),
  code: (
    <>
      <path d="m9 18-6-6 6-6" />
      <path d="m15 6 6 6-6 6" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  trend: (
    <>
      <path d="m4 16 6-6 4 4 6-8" />
      <path d="M20 6v4h-4" />
    </>
  ),
  agent: (
    <>
      <rect x="7" y="3.5" width="10" height="8" rx="2" />
      <path d="M12 11.5v3" />
      <path d="M8 21h8" />
      <path d="M9.5 16H6.8A1.8 1.8 0 0 1 5 14.2v-1.4" />
      <path d="M14.5 16h2.7a1.8 1.8 0 0 0 1.8-1.8v-1.4" />
      <path d="M9 7.5h6" />
    </>
  ),
  play: (
    <>
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </>
  ),
  plug: (
    <>
      <path d="M9 3v5" />
      <path d="M15 3v5" />
      <path d="M7 8h10v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5V8Z" />
      <path d="M12 15v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V5" />
      <path d="m8.5 8.5 3.5-3.5 3.5 3.5" />
      <path d="M5 19.5h14" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.9 4.9 1.6 1.6" />
      <path d="m17.5 17.5 1.6 1.6" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.9 19.1 1.6-1.6" />
      <path d="m17.5 6.5 1.6-1.6" />
    </>
  ),
  moon: (
    <>
      <path d="M20 14.5A7.5 7.5 0 1 1 9.5 4 6.2 6.2 0 0 0 20 14.5Z" />
    </>
  ),
  chevronLeft: (
    <>
      <path d="m15 18-6-6 6-6" />
    </>
  ),
  chevronRight: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
};

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {iconPaths[name]}
    </svg>
  );
}
