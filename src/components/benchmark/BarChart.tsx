"use client";

interface BarItem {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  secondaryLabel?: string;
}

interface BarChartProps {
  items: BarItem[];
  title?: string;
  unit?: string;
}

export default function BarChart({ items, title, unit = "" }: BarChartProps) {
  const maxVal = Math.max(...items.map((i) => i.maxValue), 1);
  const barHeight = 36;
  const gap = 16;
  const labelWidth = 120;
  const valueWidth = 80;
  const chartPadding = 16;
  const totalWidth = 600;
  const barAreaWidth = totalWidth - labelWidth - valueWidth - chartPadding * 2;
  const totalHeight = items.length * (barHeight + gap) - gap + chartPadding * 2;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[#F4F4F5] mb-3">{title}</h3>
      )}
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label={title || "Bar chart"}
      >
        {items.map((item, i) => {
          const y = chartPadding + i * (barHeight + gap);
          const barWidth = Math.max(
            (item.value / maxVal) * barAreaWidth,
            4
          );

          return (
            <g key={item.label}>
              {/* Label */}
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs"
                fill="rgba(244,244,245,0.62)"
                fontSize="12"
                fontFamily="inherit"
              >
                {item.label}
              </text>

              {/* Track */}
              <rect
                x={labelWidth}
                y={y + 4}
                width={barAreaWidth}
                height={barHeight - 8}
                rx={6}
                fill="rgba(255,255,255,0.04)"
              />

              {/* Bar */}
              <rect
                x={labelWidth}
                y={y + 4}
                width={barWidth}
                height={barHeight - 8}
                rx={6}
                fill={item.color}
                opacity={0.85}
                style={{
                  transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* Bar glow */}
              <rect
                x={labelWidth}
                y={y + 4}
                width={barWidth}
                height={barHeight - 8}
                rx={6}
                fill={item.color}
                opacity={0.15}
                filter="url(#barGlow)"
                style={{
                  transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* Value */}
              <text
                x={labelWidth + barAreaWidth + 12}
                y={y + barHeight / 2 + 1}
                textAnchor="start"
                dominantBaseline="middle"
                fill="#F4F4F5"
                fontSize="12"
                fontWeight="600"
                fontFamily="inherit"
              >
                {typeof item.value === "number" && item.value % 1 !== 0
                  ? item.value.toFixed(1)
                  : item.value.toLocaleString()}
                {unit}
              </text>

              {/* Secondary label */}
              {item.secondaryLabel && (
                <text
                  x={labelWidth + barAreaWidth + 12}
                  y={y + barHeight / 2 + 15}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill="rgba(244,244,245,0.35)"
                  fontSize="10"
                  fontFamily="inherit"
                >
                  {item.secondaryLabel}
                </text>
              )}
            </g>
          );
        })}

        <defs>
          <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
