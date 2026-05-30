import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { benchmarkTasks, benchmarkRuns, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import type { BenchmarkTask, BenchmarkRun, User } from "@/types";
import BenchmarkHeader from "@/components/benchmark/BenchmarkHeader";
import RunCard from "@/components/benchmark/RunCard";
import BarChart from "@/components/benchmark/BarChart";
import TokenChart from "@/components/benchmark/TokenChart";
import DurationTimeline from "@/components/benchmark/DurationTimeline";
import Button from "@/components/ui/Button";

const agentColors: Record<string, string> = {
  Codex: "#3B82F6",
  "Claude Code": "#A855F7",
  Cursor: "#F59E0B",
};

const resultColor: Record<string, string> = {
  passed: "#22C55E",
  failed: "#EF4444",
  partial: "#EAB308",
};

function getAgentColor(name: string): string {
  return agentColors[name] || "#6B7280";
}

export default async function BenchmarkDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  const taskRows = await db
    .select()
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.id, taskId))
    .limit(1);

  if (!taskRows.length) notFound();

  const task = taskRows[0] as BenchmarkTask;

  const authorRows = await db
    .select({
      id: users.id,
      email: users.email,
      display_name: users.display_name,
      handle: users.handle,
      avatar_seed: users.avatar_seed,
      bio: users.bio,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, task.author_id!))
    .limit(1);

  if (!authorRows.length) notFound();

  const author = authorRows[0] as User;

  const runs = (await db
    .select()
    .from(benchmarkRuns)
    .where(eq(benchmarkRuns.task_id, taskId))
    .orderBy(desc(benchmarkRuns.created_at))) as BenchmarkRun[];

  const currentUser = await getCurrentUser();
  const isAuthor = currentUser?.id === author.id;

  // Prepare chart data
  const maxDuration = Math.max(...runs.map((r) => r.duration_ms ?? 0), 1);
  const maxTokens = Math.max(...runs.map((r) => r.tokens_used ?? 0), 1);

  const barChartItems = runs.map((run) => ({
    label: run.agent_name,
    value: (run.duration_ms ?? 0) / 1000,
    maxValue: maxDuration / 1000,
    color: resultColor[run.result] || "#EAB308",
    secondaryLabel: run.tokens_used
      ? `${run.tokens_used.toLocaleString()} tokens`
      : undefined,
  }));

  const tokenChartAgents = runs.map((run) => ({
    name: run.agent_name,
    tokens: run.tokens_used ?? 0,
    color: getAgentColor(run.agent_name),
  }));

  const durationAgents = runs.map((run) => ({
    name: run.agent_name,
    durationMs: run.duration_ms ?? 0,
    result: run.result,
  }));

  const publishedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="animate-fade-in">
        <BenchmarkHeader task={task} author={author} />

        {/* Published date */}
        {publishedDate && (
          <p className="mt-3 text-xs text-[rgba(244,244,245,0.35)]">
            Published by{" "}
            <Link
              href={`/u/${author.handle}`}
              className="text-[rgba(244,244,245,0.50)] hover:text-[#38BDF8] transition-colors"
            >
              @{author.handle}
            </Link>{" "}
            &middot; {publishedDate}
          </p>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-6 flex items-center gap-3 animate-fade-in stagger-1">
        {isAuthor && (
          <Link href={`/benchmarks/${taskId}/publish`}>
            <Button variant="primary">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Publish to Feed
            </Button>
          </Link>
        )}
        <Button variant="secondary">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16,6 12,2 8,6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </Button>
        {runs.length > 0 && (
          <span className="ml-auto text-xs text-[rgba(244,244,245,0.35)] flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {runs.length} agent{runs.length !== 1 ? "s" : ""} compared
          </span>
        )}
      </div>

      {runs.length > 0 && (
        <>
          {/* Comparison Overview Chart */}
          <section className="mt-10 animate-fade-in-up stagger-2">
            <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(244,244,245,0.62)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <h2 className="text-lg font-semibold text-[#F4F4F5]">
                  Comparison Overview
                </h2>
              </div>
              <p className="text-xs text-[rgba(244,244,245,0.35)] mb-5">
                Duration by agent, color-coded by result
              </p>
              <BarChart items={barChartItems} unit="s" />
              {/* Legend */}
              <div className="mt-4 flex items-center gap-5 justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span className="text-[10px] text-[rgba(244,244,245,0.45)]">
                    Passed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="text-[10px] text-[rgba(244,244,245,0.45)]">
                    Failed
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                  <span className="text-[10px] text-[rgba(244,244,245,0.45)]">
                    Partial
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Token Usage + Duration side by side */}
          <section className="mt-6 grid md:grid-cols-2 gap-6 animate-fade-in-up stagger-3">
            {/* Token Usage */}
            <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(244,244,245,0.62)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 2v10l6.93 4" />
                </svg>
                <h2 className="text-lg font-semibold text-[#F4F4F5]">
                  Token Usage
                </h2>
              </div>
              <p className="text-xs text-[rgba(244,244,245,0.35)] mb-4">
                Total tokens consumed per agent
              </p>
              <TokenChart agents={tokenChartAgents} />
            </div>

            {/* Duration Comparison */}
            <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(244,244,245,0.62)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <h2 className="text-lg font-semibold text-[#F4F4F5]">
                  Duration
                </h2>
              </div>
              <p className="text-xs text-[rgba(244,244,245,0.35)] mb-4">
                Time to completion
              </p>
              <DurationTimeline agents={durationAgents} />
            </div>
          </section>

          {/* Agent Run Cards */}
          <section className="mt-10 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-2 mb-5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(244,244,245,0.62)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <h2 className="text-lg font-semibold text-[#F4F4F5]">
                Detailed Agent Results
              </h2>
            </div>
            <div className="grid gap-5">
              {runs.map((run, i) => (
                <div
                  key={run.id}
                  className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                >
                  <RunCard run={run} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {runs.length === 0 && (
        <div className="mt-12 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.04] mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(244,244,245,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-sm text-[rgba(244,244,245,0.40)]">
            No benchmark runs yet.
          </p>
          <p className="mt-1 text-xs text-[rgba(244,244,245,0.25)]">
            Run agents against this task to see results here.
          </p>
        </div>
      )}
    </div>
  );
}
