import Link from "next/link";
import { db } from "@/db";
import { feedPosts, users, benchmarkTasks, benchmarkRuns } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import type { FeedPost, User } from "@/types";
import FeedPostCard from "@/components/feed/FeedPostCard";
import Button from "@/components/ui/Button";

export default async function Home() {
  const recentPosts = await db
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
    .where(eq(feedPosts.is_draft, false))
    .orderBy(desc(feedPosts.published_at))
    .limit(4);

  const [taskCount] = await db.select({ value: count() }).from(benchmarkTasks);
  const [runCount] = await db.select({ value: count() }).from(benchmarkRuns);
  const [postCount] = await db
    .select({ value: count() })
    .from(feedPosts)
    .where(eq(feedPosts.is_draft, false));
  const [userCount] = await db.select({ value: count() }).from(users);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(56,189,248,0.04)] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgba(56,189,248,0.03)] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 pt-28 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse-dot" />
            <span className="text-xs text-[rgba(244,244,245,0.50)]">
              {runCount.value} agent runs completed
            </span>
          </div>

          <h1 className="text-[44px] font-extrabold tracking-[-0.03em] text-[#F4F4F5] leading-[1.05] animate-fade-in stagger-1">
            Benchmark AI<br />Coding Agents
          </h1>
          <p className="mt-5 text-[17px] text-[rgba(244,244,245,0.55)] max-w-lg mx-auto leading-relaxed animate-fade-in stagger-2">
            Run the same task on Claude Code, Codex, and Cursor.
            Compare outputs. Publish results. Let the community discuss.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 animate-fade-in stagger-3">
            <Link href="/feed">
              <Button variant="primary">Browse Feed</Button>
            </Link>
            <Link href="/benchmarks/new">
              <Button variant="secondary">Run a Benchmark</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Benchmarks", value: taskCount.value },
            { label: "Agent Runs", value: runCount.value },
            { label: "Published", value: postCount.value },
            { label: "Contributors", value: userCount.value },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-[#F4F4F5] tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-[rgba(244,244,245,0.40)] mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-sm font-medium text-[#38BDF8] uppercase tracking-[0.15em] mb-3">
          How it works
        </h2>
        <p className="text-2xl font-bold text-[#F4F4F5] tracking-tight">
          Three agents. One task. Public results.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            {
              step: "01",
              title: "Define a task",
              desc: "Write a standardized coding challenge with clear requirements and constraints.",
            },
            {
              step: "02",
              title: "Run agents",
              desc: "Claude Code, Codex, and Cursor each attempt the task independently.",
            },
            {
              step: "03",
              title: "Publish & discuss",
              desc: "Share results on the feed. The community weighs in with commentary.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group rounded-xl border border-white/[0.06] bg-[#111113] p-5 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="text-xs font-mono text-[#38BDF8] opacity-60">
                {item.step}
              </span>
              <h3 className="text-sm font-semibold text-[#F4F4F5] mt-2">
                {item.title}
              </h3>
              <p className="text-sm text-[rgba(244,244,245,0.45)] mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-sm font-medium text-[#38BDF8] uppercase tracking-[0.15em] mb-3">
            Supported Agents
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { name: "Claude Code", model: "Opus 4.8", color: "#F97316" },
              { name: "Codex", model: "GPT-5.5", color: "#22C55E" },
              { name: "Cursor", model: "Composer 2.5", color: "#A78BFA" },
            ].map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#111113] px-4 py-3"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: agent.color }}
                />
                <div>
                  <p className="text-sm font-medium text-[#F4F4F5]">{agent.name}</p>
                  <p className="text-xs text-[rgba(244,244,245,0.35)]">{agent.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[#F4F4F5]">
              Recent Benchmarks
            </h2>
            <Link
              href="/feed"
              className="text-sm text-[rgba(244,244,245,0.40)] hover:text-[#F4F4F5] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            {recentPosts.map((row) => (
              <FeedPostCard
                key={row.id}
                post={
                  {
                    id: row.id,
                    author_id: row.author_id,
                    task_id: row.task_id,
                    body: row.body,
                    agent_results: row.agent_results as FeedPost["agent_results"],
                    is_draft: row.is_draft,
                    published_at: row.published_at,
                    created_at: row.created_at,
                    author: row.author as User,
                  } as FeedPost & { author: User }
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[rgba(56,189,248,0.04)] to-transparent p-10 text-center">
          <h2 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
            Stop guessing which agent is best
          </h2>
          <p className="mt-2 text-sm text-[rgba(244,244,245,0.45)] max-w-md mx-auto">
            Run standardized benchmarks, publish transparent results, and let the
            developer community hold agents accountable.
          </p>
          <div className="mt-6">
            <Link href="/signup">
              <Button variant="primary">Create Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#09090B]">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <p className="text-sm font-bold text-[#38BDF8] tracking-tight">Claudex</p>
              <p className="text-xs text-[rgba(244,244,245,0.30)] mt-1 max-w-xs">
                Open benchmarks for AI coding agents.
                Transparent results. Community-driven.
              </p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] text-[rgba(244,244,245,0.30)] uppercase tracking-[0.18em] mb-3">
                  Product
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/feed" className="text-xs text-[rgba(244,244,245,0.45)] hover:text-[#F4F4F5] transition-colors">
                    Feed
                  </Link>
                  <Link href="/benchmarks/new" className="text-xs text-[rgba(244,244,245,0.45)] hover:text-[#F4F4F5] transition-colors">
                    Run Benchmark
                  </Link>
                  <Link href="/dashboard" className="text-xs text-[rgba(244,244,245,0.45)] hover:text-[#F4F4F5] transition-colors">
                    Dashboard
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[rgba(244,244,245,0.30)] uppercase tracking-[0.18em] mb-3">
                  Community
                </p>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-[rgba(244,244,245,0.45)]">
                    Discord
                  </span>
                  <span className="text-xs text-[rgba(244,244,245,0.45)]">
                    GitHub
                  </span>
                  <span className="text-xs text-[rgba(244,244,245,0.45)]">
                    X / Twitter
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-white/[0.04]">
            <p className="text-[11px] text-[rgba(244,244,245,0.20)]">
              &copy; 2026 Claudex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
