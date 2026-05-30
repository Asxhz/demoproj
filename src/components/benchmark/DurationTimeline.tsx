"use client";

interface DurationAgent {
  name: string;
  durationMs: number;
  result: string;
}

interface DurationTimelineProps {
  agents: DurationAgent[];
  title?: string;
}

const resultColor: Record<string, string> = {
  passed: "#22C55E",
  failed: "#EF4444",
  partial: "#EAB308",
};

export default function DurationTimeline({
  agents,
  title,
}: DurationTimelineProps) {
  const maxDuration = Math.max(...agents.map((a) => a.durationMs), 1);
  const fastestIdx = agents.reduce(
    (minIdx, a, idx, arr) => (a.durationMs < arr[minIdx].durationMs ? idx : minIdx),
    0
  );

  const chartWidth = 600;
  const rowHeight = 48;
  const labelWidth = 120;
  const valueWidth = 90;
  const chartPadding = 12;
  const barAreaWidth = chartWidth - labelWidth - valueWidth - chartPadding * 2;
  const totalHeight = agents.length * rowHeight + chartPadding * 2;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[#F4F4F5] mb-3">{title}</h3>
      )}
      <svg
        viewBox={`0 0 ${chartWidth} ${totalHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label={title || "Duration comparison"}
      >
        {agents.map((agent, i) => {
          const y = chartPadding + i * rowHeight;
          const durationSec = agent.durationMs / 1000;
          const barWidth = Math.max(
            (agent.durationMs / maxDuration) * barAreaWidth,
            4
          );
          const isFastest = i === fastestIdx;
          const color = resultColor[agent.result] || "#A855F7";

          return (
            <g key={agent.name}>
              {/* Label */}
              <text
                x={labelWidth - 8}
                y={y + rowHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill={isFastest ? "#F4F4F5" : "rgba(244,244,245,0.62)"}
                fontSize="12"
                fontWeight={isFastest ? "600" : "400"}
                fontFamily="inherit"
              >
                {agent.name}
              </text>

              {/* Fastest indicator */}
              {isFastest && (
                <g>
                  <rect
                    x={labelWidth - 8}
                    y={y + rowHeight / 2 + 8}
                    width={42}
                    height={14}
                    rx={7}
                    fill="rgba(34,197,94,0.12)"
                  />
                  <text
                    x={labelWidth + 13}
                    y={y + rowHeight / 2 + 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#22C55E"
                    fontSize="8"
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    FASTEST
                  </text>
                </g>
              )}

              {/* Track */}
              <rect
                x={labelWidth}
                y={y + rowHeight / 2 - 10}
                width={barAreaWidth}
                height={20}
                rx={10}
                fill="rgba(255,255,255,0.04)"
              />

              {/* Bar */}
              <rect
                x={labelWidth}
                y={y + rowHeight / 2 - 10}
                width={barWidth}
                height={20}
                rx={10}
                fill={color}
                opacity={0.7}
                style={{
                  transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* Dot at end */}
              <circle
                cx={labelWidth + barWidth}
                cy={y + rowHeight / 2}
                r={4}
                fill={color}
                style={{
                  transition: "cx 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* Duration label */}
              <text
                x={labelWidth + barAreaWidth + 12}
                y={y + rowHeight / 2}
                textAnchor="start"
                dominantBaseline="middle"
                fill="#F4F4F5"
                fontSize="13"
                fontWeight="600"
                fontFamily="inherit"
              >
                {durationSec.toFixed(1)}s
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
