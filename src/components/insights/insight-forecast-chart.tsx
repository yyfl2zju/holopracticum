import type { InsightForecastPoint } from "@/lib/types";

type InsightForecastChartProps = {
  data: InsightForecastPoint[];
};

const width = 420;
const height = 260;
const padding = 28;

export function InsightForecastChart({ data }: InsightForecastChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-[28px] border border-dashed border-[var(--border-strong)]">
        <p className="text-sm text-secondary">当前没有预测图数据。</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap((item) => [item.actual, item.forecast]), 1);
  const slotWidth = (width - padding * 2) / data.length;
  const barWidth = Math.min(26, slotWidth / 3);

  function getBarHeight(value: number) {
    return (value / maxValue) * (height - padding * 2);
  }

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="mb-4 flex flex-wrap gap-3">
        <Legend label="实际" color="#0f766e" />
        <Legend label="预测" color="#2563eb" />
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

        {data.map((item, index) => {
          const x = padding + index * slotWidth + slotWidth / 2;
          const actualHeight = getBarHeight(item.actual);
          const forecastHeight = getBarHeight(item.forecast);

          return (
            <g key={item.label}>
              <rect
                x={x - barWidth - 4}
                y={height - padding - actualHeight}
                width={barWidth}
                height={actualHeight}
                rx="6"
                fill="#0f766e"
              />
              <rect
                x={x + 4}
                y={height - padding - forecastHeight}
                width={barWidth}
                height={forecastHeight}
                rx="6"
                fill="#2563eb"
                opacity="0.82"
              />
              <text
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--foreground-soft)"
              >
                {item.label}
              </text>
            </g>
          );
        })}
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
