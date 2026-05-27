import { cx } from "@/lib/utils";

type PageSectionNavItem = {
  href: string;
  label: string;
  hint?: string;
};

type PageSectionNavProps = {
  items: PageSectionNavItem[];
  className?: string;
};

export function PageSectionNav({ items, className }: PageSectionNavProps) {
  return (
    <nav
      aria-label="页面分区导航"
      className={cx(
        "panel sticky top-[88px] z-10 overflow-x-auto rounded-[20px] px-2.5 py-2.5 scrollbar-thin",
        className,
      )}
    >
      <div className="flex min-w-max gap-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex min-w-[148px] flex-col rounded-[16px] border px-3.5 py-3 transition hover:border-[var(--accent-border)] hover:bg-[var(--surface-accent)]"
            style={{ borderColor: "var(--border)", background: "transparent" }}
          >
            <span className="text-sm font-semibold text-primary">{item.label}</span>
            {item.hint ? (
              <span className="mt-1 text-xs leading-5 text-tertiary">{item.hint}</span>
            ) : null}
          </a>
        ))}
      </div>
    </nav>
  );
}
