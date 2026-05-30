import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  benchmarkTasks,
  feedPosts,
  users,
  comments,
  benchmarkRuns,
} from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import type { FeedPost, User, BenchmarkTask } from "@/types";
import FeedPostCard from "@/components/feed/FeedPostCard";
import Button from "@/components/ui/Button";

const resultColor: Record<string, string> = {
  passed: "#22C55E",
  failed: "#EF4444",
  partial: "#EAB308",
};

const difficultyDot: Record<string, string> = {
  easy: "bg-[#22C55E]",
  medium: "bg-[#EAB308]",
  hard: "bg-[#EF4444]",
};

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const myTasks = (await db
    .select()
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.author_id, currentUser.id))
    .orderBy(desc(benchmarkTasks.created_at))) as BenchmarkTask[];

  const myDrafts = await db
    .select({
      id: feedPosts.id,
      author_id: feedPosts.author_id,
      task_id: feedPosts.task_id,
      body: feedPosts.body,
      agent_results: feedPosts.agent_results,
      is_draft: feedPosts.is_draft,
      published_at: feedPosts.published_at,
      created_at: feedPosts.created_at,
      author: {
        id: users.id,
        email: users.email,
        display_name: users.display_name,
        handle: users.handle,
        avatar_seed: users.avatar_seed,
        bio: users.bio,
        created_at: users.created_at,
      },
    })
    .from(feedPosts)
    .innerJoin(users, eq(feedPosts.author_id, users.id))
    .where(
      and(
        eq(feedPosts.author_id, currentUser.id),
        eq(feedPosts.is_draft, true)
      )
    )
    .orderBy(desc(feedPosts.created_at));

  const myPublished = await db
    .select({
      id: feedPosts.id,
      author_id: feedPosts.author_id,
      task_id: feedPosts.task_id,
      body: feedPosts.body,
      agent_results: feedPosts.agent_results,
      is_draft: feedPosts.is_draft,
      published_at: feedPosts.published_at,
      created_at: feedPosts.created_at,
      author: {
        id: users.id,
        email: users.email,
        display_name: users.display_name,
        handle: users.handle,
        avatar_seed: users.avatar_seed,
        bio: users.bio,
        created_at: users.created_at,
      },
    })
    .from(feedPosts)
    .innerJoin(users, eq(feedPosts.author_id, users.id))
    .where(
      and(
        eq(feedPosts.author_id, currentUser.id),
        eq(feedPosts.is_draft, false)
      )
    )
    .orderBy(desc(feedPosts.published_at));

  // Stats
  const [commentCountResult] = await db
    .select({ value: count() })
    .from(comments)
    .innerJoin(feedPosts, eq(comments.post_id, feedPosts.id))
    .where(eq(feedPosts.author_id, currentUser.id));

  const totalComments = commentCountResult?.value ?? 0;

  // Get run counts per task for summary badges
  const allRuns = await db
    .select({
      task_id: benchmarkRuns.task_id,
      agent_name: benchmarkRuns.agent_name,
      result: benchmarkRuns.result,
    })
    .from(benchmarkRuns)
    .innerJoin(
      benchmarkTasks,
      eq(benchmarkRuns.task_id, benchmarkTasks.id)
    )
    .where(eq(benchmarkTasks.author_id, currentUser.id));

  const taskRunMap = new Map<
    string,
    { agent_name: string; result: string }[]
  >();
  for (const run of allRuns) {
    if (!run.task_id) continue;
    if (!taskRunMap.has(run.task_id)) taskRunMap.set(run.task_id, []);
    taskRunMap
      .get(run.task_id)!
      .push({ agent_name: run.agent_name, result: run.result });
  }

  function toFeedPostWithAuthor(row: (typeof myPublished)[number]) {
    return {
      id: row.id,
      author_id: row.author_id,
      task_id: row.task_id,
      body: row.body,
      agent_results: row.agent_results as FeedPost["agent_results"],
      is_draft: row.is_draft,
      published_at: row.published_at,
      created_at: row.created_at,
      author: row.author as User,
    } as FeedPost & { author: User };
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-[#F4F4F5] tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[rgba(244,244,245,0.40)]">
          Welcome back, {currentUser.display_name}
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in stagger-1">
        <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)]">
            Benchmarks
          </p>
          <p className="mt-1 text-2xl font-bold text-[#F4F4F5]">
            {myTasks.length}
          </p>
        </div>
        <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)]">
            Published
          </p>
          <p className="mt-1 text-2xl font-bold text-[#F4F4F5]">
            {myPublished.length}
          </p>
        </div>
        <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)]">
            Drafts
          </p>
          <p className="mt-1 text-2xl font-bold text-[#EAB308]">
            {myDrafts.length}
          </p>
        </div>
        <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-[rgba(244,244,245,0.35)]">
            Comments
          </p>
          <p className="mt-1 text-2xl font-bold text-[#F4F4F5]">
            {totalComments}
          </p>
        </div>
      </div>

      {/* Drafts Section */}
      <section className="mt-10 animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <h2 className="text-lg font-semibold text-[#F4F4F5]">
              Your Drafts
            </h2>
            {myDrafts.length > 0 && (
              <span className="rounded-full bg-[rgba(234,179,8,0.12)] border border-[rgba(234,179,8,0.20)] px-2 py-0.5 text-[10px] font-medium text-[#EAB308]">
                {myDrafts.length}
              </span>
            )}
          </div>
        </div>
        {myDrafts.length === 0 ? (
          <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6 text-center">
            <p className="text-sm text-[rgba(244,244,245,0.40)]">No drafts.</p>
          </div>
        ) : (
          <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
            {myDrafts.map((row) => {
              const post = toFeedPostWithAuthor(row);
              return (
                <div key={row.id} className="relative">
                  <FeedPostCard post={post} />
                  {/* Publish action overlay */}
                  <div className="absolute top-4 right-4">
                    <Link href={`/benchmarks/${row.task_id}/publish`}>
                      <Button variant="primary" className="text-xs px-3 py-1.5">
                        Publish
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Benchmarks Section */}
      <section className="mt-10 animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
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
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <h2 className="text-lg font-semibold text-[#F4F4F5]">
              Your Benchmarks
            </h2>
          </div>
          <Link href="/benchmarks/new">
            <Button variant="secondary" className="text-xs px-3 py-1.5">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New
            </Button>
          </Link>
        </div>
        {myTasks.length === 0 ? (
          <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6 text-center">
            <p className="text-sm text-[rgba(244,244,245,0.40)]">
              No benchmarks yet.{" "}
              <Link
                href="/benchmarks/new"
                className="text-[#38BDF8] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {myTasks.map((task) => {
              const runs = taskRunMap.get(task.id) || [];
              const diffDot =
                difficultyDot[task.difficulty?.toLowerCase() || ""] || "";

              return (
                <Link key={task.id} href={`/benchmarks/${task.id}`}>
                  <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] hover:-translate-y-[1px] hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#F4F4F5] truncate">
                            {task.title}
                          </p>
                          {task.difficulty && (
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize text-[rgba(244,244,245,0.50)] bg-white/[0.04] border border-white/[0.06]">
                              {diffDot && (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${diffDot}`}
                                />
                              )}
                              {task.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-[rgba(244,244,245,0.40)] line-clamp-2">
                          {task.description}
                        </p>

                        {/* Agent result summary badges */}
                        {runs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {runs.map((run) => {
                              const color =
                                resultColor[run.result] || "#EAB308";
                              return (
                                <span
                                  key={run.agent_name}
                                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                  style={{
                                    color,
                                    backgroundColor: `${color}12`,
                                    borderColor: `${color}25`,
                                    borderWidth: "1px",
                                  }}
                                >
                                  <span
                                    className="w-1 h-1 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  {run.agent_name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(244,244,245,0.25)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 mt-1"
                      >
                        <polyline points="9,18 15,12 9,6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Published Posts Section */}
      <section className="mt-10 animate-fade-in-up stagger-4">
        <div className="flex items-center gap-2 mb-4">
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
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16,6 12,2 8,6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <h2 className="text-lg font-semibold text-[#F4F4F5]">
            Your Published Posts
          </h2>
          {myPublished.length > 0 && (
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-[rgba(244,244,245,0.50)]">
              {myPublished.length}
            </span>
          )}
        </div>
        {myPublished.length === 0 ? (
          <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6 text-center">
            <p className="text-sm text-[rgba(244,244,245,0.40)]">
              No published posts yet.
            </p>
          </div>
        ) : (
          <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06]">
            {myPublished.map((row) => (
              <FeedPostCard key={row.id} post={toFeedPostWithAuthor(row)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
