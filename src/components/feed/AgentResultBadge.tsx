const styles = {
  passed: {
    dot: "bg-[#22C55E]",
    text: "text-[#22C55E]",
    bg: "bg-[rgba(34,197,94,0.08)]",
    border: "border-[rgba(34,197,94,0.20)]",
  },
  failed: {
    dot: "bg-[#EF4444]",
    text: "text-[#EF4444]",
    bg: "bg-[rgba(239,68,68,0.08)]",
    border: "border-[rgba(239,68,68,0.20)]",
  },
  partial: {
    dot: "bg-[#EAB308]",
    text: "text-[#EAB308]",
    bg: "bg-[rgba(234,179,8,0.08)]",
    border: "border-[rgba(234,179,8,0.20)]",
  },
} as const;

interface AgentResultBadgeProps {
  agentName: string;
  result: "passed" | "failed" | "partial";
}

export default function AgentResultBadge({ agentName, result }: AgentResultBadgeProps) {
  const s = styles[result];

  return (
    <span className={`inline-flex items-center gap-1.5 ${s.bg} border ${s.border} rounded-full px-2.5 py-1 text-xs`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className="font-medium text-[rgba(244,244,245,0.85)]">{agentName}</span>
      <span className={`font-medium capitalize ${s.text}`}>{result}</span>
    </span>
  );
}
