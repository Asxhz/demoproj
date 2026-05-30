import type { BenchmarkTask, User } from "@/types";
import Avatar from "@/components/ui/Avatar";

const difficultyColors: Record<string, { text: string; bg: string; dot: string }> = {
  easy: {
    text: "text-[#22C55E]",
    bg: "bg-[rgba(34,197,94,0.10)] border-[rgba(34,197,94,0.20)]",
    dot: "bg-[#22C55E]",
  },
  medium: {
    text: "text-[#EAB308]",
    bg: "bg-[rgba(234,179,8,0.10)] border-[rgba(234,179,8,0.20)]",
    dot: "bg-[#EAB308]",
  },
  hard: {
    text: "text-[#EF4444]",
    bg: "bg-[rgba(239,68,68,0.10)] border-[rgba(239,68,68,0.20)]",
    dot: "bg-[#EF4444]",
  },
};

interface BenchmarkHeaderProps {
  task: BenchmarkTask;
  author: User;
}

export default function BenchmarkHeader({ task, author }: BenchmarkHeaderProps) {
  const difficulty = task.difficulty?.toLowerCase() || "";
  const diffStyle = difficultyColors[difficulty];

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#F4F4F5] tracking-tight leading-tight">
        {task.title}
      </h1>

      {/* Author row */}
      <div className="mt-4 flex items-center gap-3">
        <Avatar
          handle={author.handle}
          displayName={author.display_name}
          size="md"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#F4F4F5]">
            {author.display_name}
          </span>
          <span className="text-sm text-[rgba(244,244,245,0.35)]">
            @{author.handle}
          </span>
          {/* Difficulty badge */}
          {task.difficulty && diffStyle && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${diffStyle.text} ${diffStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
              {task.difficulty}
            </span>
          )}
          {task.difficulty && !diffStyle && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-[rgba(244,244,245,0.62)] bg-white/[0.06] border border-white/[0.08]">
              {task.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-[rgba(244,244,245,0.62)] leading-relaxed max-w-3xl">
        {task.description}
      </p>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-xs font-medium text-[rgba(244,244,245,0.55)] bg-white/[0.05] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
