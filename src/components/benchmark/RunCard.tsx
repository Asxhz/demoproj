"use client";

import type { BenchmarkRun } from "@/types";

function normalizeResult(result: string): "passed" | "failed" | "partial" {
  if (result === "passed" || result === "failed" || result === "partial")
    return result;
  return "partial";
}

const resultConfig = {
  passed: {
    border: "border-l-[#22C55E]",
    bg: "bg-[rgba(34,197,94,0.06)]",
    badge: "bg-[rgba(34,197,94,0.12)] text-[#22C55E] border-[rgba(34,197,94,0.25)]",
    label: "PASSED",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
    ),
  },
  failed: {
    border: "border-l-[#EF4444]",
    bg: "bg-[rgba(239,68,68,0.06)]",
    badge: "bg-[rgba(239,68,68,0.12)] text-[#EF4444] border-[rgba(239,68,68,0.25)]",
    label: "FAILED",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  partial: {
    border: "border-l-[#EAB308]",
    bg: "bg-[rgba(234,179,8,0.06)]",
    badge: "bg-[rgba(234,179,8,0.12)] text-[#EAB308] border-[rgba(234,179,8,0.25)]",
    label: "PARTIAL",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#EAB308"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
} as const;

function generateAnalysis(
  result: "passed" | "failed" | "partial",
  explanation: string
): { heading: string; points: string[]; verdict: string } {
  const sentences = explanation
    .split(/(?<=[.!])\s+/)
    .filter((s) => s.trim().length > 5);

  if (result === "passed") {
    return {
      heading: "What it did right",
      points:
        sentences.length > 1
          ? sentences.map((s) => s.replace(/\.$/, ""))
          : [
              explanation.replace(/\.$/, ""),
              "Successfully met all requirements",
            ],
      verdict: "All requirements met. Clean implementation.",
    };
  }

  if (result === "failed") {
    return {
      heading: "Root cause analysis",
      points:
        sentences.length > 1
          ? sentences.map((s) => s.replace(/\.$/, ""))
          : [explanation.replace(/\.$/, ""), "Did not meet requirements"],
      verdict: "Critical failure. Requirements not satisfied.",
    };
  }

  return {
    heading: "Gap analysis",
    points:
      sentences.length > 1
        ? sentences.map((s) => s.replace(/\.$/, ""))
        : [explanation.replace(/\.$/, ""), "Partial completion of requirements"],
    verdict: "Partial success. Key gaps remain.",
  };
}

const agentColors: Record<string, string> = {
  Codex: "#3B82F6",
  "Claude Code": "#A855F7",
  Cursor: "#F59E0B",
};

interface RunCardProps {
  run: BenchmarkRun;
}

export default function RunCard({ run }: RunCardProps) {
  const result = normalizeResult(run.result);
  const config = resultConfig[result];
  const analysis = generateAnalysis(result, run.explanation);
  const agentColor = agentColors[run.agent_name] || "#6B7280";

  return (
    <div
      className={`rounded-xl border border-white/[0.06] ${config.bg} border-l-[3px] ${config.border} overflow-hidden transition-all duration-200 hover:border-white/[0.12]`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Agent color dot */}
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: agentColor }}
            />
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#F4F4F5] truncate">
                {run.agent_name}
              </p>
              {run.agent_model && (
                <p className="text-xs text-[rgba(244,244,245,0.40)] mt-0.5">
                  {run.agent_model}
                </p>
              )}
            </div>
          </div>

          {/* Result badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wider ${config.badge}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Explanation */}
        <p className="mt-4 text-sm text-[rgba(244,244,245,0.65)] leading-relaxed">
          {run.explanation}
        </p>
      </div>

      {/* Metrics bar */}
      {(run.duration_ms != null || run.tokens_used != null) && (
        <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)] mb-0.5">
                Duration
              </p>
              <p className="text-sm font-semibold text-[#F4F4F5]">
                {run.duration_ms != null
                  ? `${(run.duration_ms / 1000).toFixed(1)}s`
                  : "--"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)] mb-0.5">
                Tokens
              </p>
              <p className="text-sm font-semibold text-[#F4F4F5]">
                {run.tokens_used != null
                  ? run.tokens_used.toLocaleString()
                  : "--"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)] mb-0.5">
                Result
              </p>
              <p
                className="text-sm font-semibold capitalize"
                style={{
                  color:
                    result === "passed"
                      ? "#22C55E"
                      : result === "failed"
                        ? "#EF4444"
                        : "#EAB308",
                }}
              >
                {result}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis section */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[rgba(244,244,245,0.45)] mb-2.5">
          {analysis.heading}
        </p>
        <ul className="space-y-1.5">
          {analysis.points.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-[rgba(244,244,245,0.55)] leading-relaxed"
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: agentColor }}
              />
              {point}
            </li>
          ))}
        </ul>

        {/* Verdict */}
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgba(244,244,245,0.30)]">
              Verdict
            </span>
            <span className="text-xs text-[rgba(244,244,245,0.50)]">
              {analysis.verdict}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
