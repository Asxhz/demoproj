const tone = {
  green: "text-[#22C55E] bg-[rgba(34,197,94,0.10)]",
  red: "text-[#EF4444] bg-[rgba(239,68,68,0.10)]",
  yellow: "text-[#EAB308] bg-[rgba(234,179,8,0.10)]",
  blue: "text-[#1d9bf0] bg-[rgba(29,155,240,0.10)]",
  gray: "text-[#8b8d93] bg-white/[0.05]",
} as const;

export type Tone = keyof typeof tone;

export default function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[color]}`}
    >
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  todo: "gray",
  doing: "blue",
  done: "green",
  active: "green",
  archived: "gray",
};
const priorityTone: Record<string, Tone> = { low: "gray", med: "blue", high: "red" };
const statusLabel: Record<string, string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
  active: "Active",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge color={statusTone[status] ?? "gray"}>{statusLabel[status] ?? status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge color={priorityTone[priority] ?? "gray"}>{priority}</Badge>;
}
