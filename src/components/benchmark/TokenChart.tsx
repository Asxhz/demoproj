"use client";

interface TokenAgent {
  name: string;
  tokens: number;
  color: string;
}

interface TokenChartProps {
  agents: TokenAgent[];
  title?: string;
}

export default function TokenChart({ agents, title }: TokenChartProps) {
  const maxTokens = Math.max(...agents.map((a) => a.tokens), 1);
  const chartWidth = 420;
  const chartHeight = 220;
  const barAreaHeight = 160;
  const barGap = 40;
  const barWidth = 56;
  const totalBarsWidth = agents.length * barWidth + (agents.length - 1) * barGap;
  const startX = (chartWidth - totalBarsWidth) / 2;
  const topPadding = 30;

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[#F4F4F5] mb-3">{title}</h3>
      )}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        role="img"
        aria-label={title || "Token usage chart"}
      >
        {/* Horizontal guide lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const lineY = topPadding + barAreaHeight - frac * barAreaHeight;
          return (
            <g key={frac}>
              <line
                x1={startX - 10}
                y1={lineY}
                x2={startX + totalBarsWidth + 10}
                y2={lineY}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={startX - 16}
                y={lineY + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(244,244,245,0.25)"
                fontSize="9"
                fontFamily="inherit"
              >
                {Math.round(maxTokens * frac).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={startX - 10}
          y1={topPadding + barAreaHeight}
          x2={startX + totalBarsWidth + 10}
          y2={topPadding + barAreaHeight}
          stroke="rgba(255,255,255,0.08)"
        />

        {agents.map((agent, i) => {
          const x = startX + i * (barWidth + barGap);
          const height = (agent.tokens / maxTokens) * barAreaHeight;
          const y = topPadding + barAreaHeight - height;

          return (
            <g key={agent.name}>
              {/* Bar background track */}
              <rect
                x={x}
                y={topPadding}
                width={barWidth}
                height={barAreaHeight}
                rx={8}
                fill="rgba(255,255,255,0.03)"
              />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx={8}
                fill={agent.color}
                opacity={0.8}
                style={{
                  transition:
                    "height 0.8s cubic-bezier(0.22, 1, 0.36, 1), y 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* Bar gradient overlay */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx={8}
                fill={`url(#tokenGrad_${i})`}
                style={{
                  transition:
                    "height 0.8s cubic-bezier(0.22, 1, 0.36, 1), y 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />

              {/* Token count on top */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="#F4F4F5"
                fontSize="11"
                fontWeight="600"
                fontFamily="inherit"
              >
                {agent.tokens.toLocaleString()}
              </text>

              {/* Agent name below */}
              <text
                x={x + barWidth / 2}
                y={topPadding + barAreaHeight + 16}
                textAnchor="middle"
                fill="rgba(244,244,245,0.62)"
                fontSize="11"
                fontFamily="inherit"
              >
                {agent.name}
              </text>

              <defs>
                <linearGradient
                  id={`tokenGrad_${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
