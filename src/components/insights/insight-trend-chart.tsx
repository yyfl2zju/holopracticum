import type { InsightSeriesPoint } from "@/lib/types";

type InsightTrendChartProps = {
  data: InsightSeriesPoint[];
};

const width = 620;
const height = 260;
const padding = 28;

export function InsightTrendChart({ data }: InsightTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-[28px] border border-dashed border-[var(--border-strong)]">
        <p className="text-sm text-secondary">当前没有趋势图数据。</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((item) => [item.revenue, item.cost, item.cashflow]),
    1,
  );

  function getX(index: number) {
    if (data.length === 1) {
      return width / 2;
    }

    return padding + (index * (width - padding * 2)) / (data.length - 1);
  }

  function getY(value: number) {
    return height - padding - (value / maxValue) * (height - padding * 2);
  }

  function buildPath(values: number[]) {
    return values
      .map((value, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(value)}`)
      .join(" ");
  }

  const revenuePath = buildPath(data.map((item) => item.revenue));
  const costPath = buildPath(data.map((item) => item.cost));
  const cashflowPath = buildPath(data.map((item) => item.cashflow));

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="mb-4 flex flex-wrap gap-3">
        <Legend label="收入" color="#0f766e" />
        <Legend label="成本" color="#d97706" />
        <Legend label="现金流" color="#2563eb" />
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
        {[0, 1, 2, 3].map((step) => {
          const y = padding + ((height - padding * 2) / 3) * step;
          return (
            <line
              key={step}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="4 6"
            />
          );
        })}

        <path d={revenuePath} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        <path d={costPath} fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
        <path d={cashflowPath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

        {data.map((item, index) => (
          <g key={item.label}>
            <circle cx={getX(index)} cy={getY(item.revenue)} r="4" fill="#0f766e" />
            <circle cx={getX(index)} cy={getY(item.cost)} r="4" fill="#d97706" />
            <circle cx={getX(index)} cy={getY(item.cashflow)} r="4" fill="#2563eb" />
            <text
              x={getX(index)}
              y={height - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--foreground-soft)"
            >
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-secondary">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
