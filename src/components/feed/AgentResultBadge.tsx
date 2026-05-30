const styles = {
  passed: {
    dot: "bg-[#22C55E]",
    text: "text-[#22C55E]",
    border: "border-[rgba(34,197,94,0.15)]",
    bg: "bg-[rgba(34,197,94,0.06)]",
  },
  failed: {
    dot: "bg-[#EF4444]",
    text: "text-[#EF4444]",
    border: "border-[rgba(239,68,68,0.15)]",
    bg: "bg-[rgba(239,68,68,0.06)]",
  },
  partial: {
    dot: "bg-[#EAB308]",
    text: "text-[#EAB308]",
    border: "border-[rgba(234,179,8,0.15)]",
    bg: "bg-[rgba(234,179,8,0.06)]",
  },
} as const;

interface AgentResultBadgeProps {
  agentName: string;
  result: "passed" | "failed" | "partial";
}

export default function AgentResultBadge({ agentName, result }: AgentResultBadgeProps) {
  const s = styles[result];

  return (
    <div className={`inline-flex items-center gap-2 border ${s.border} ${s.bg} rounded-lg px-3 py-2 transition-colors`}>
      <span className="text-[13px] font-medium text-[#F4F4F5]">{agentName}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className={`text-xs font-medium capitalize ${s.text}`}>{result}</span>
    </div>
  );
}
