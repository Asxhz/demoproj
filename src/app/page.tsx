import Link from "next/link";
import { db } from "@/db";
import { feedPosts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { AgentResult } from "@/types";
import CounterSection from "@/components/landing/CounterSection";
import BrowserMockup from "@/components/landing/BrowserMockup";
import DemoResetButton from "@/components/landing/DemoResetButton";

const agentColorMap: Record<string, string> = {
  "Claude Code": "#A855F7",
  Codex: "#3B82F6",
  Cursor: "#F59E0B",
};

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
        display_name: users.display_name,
        handle: users.handle,
        avatar_seed: users.avatar_seed,
      },
    })
    .from(feedPosts)
    .innerJoin(users, eq(feedPosts.author_id, users.id))
    .where(eq(feedPosts.is_draft, false))
    .orderBy(desc(feedPosts.published_at))
    .limit(3);


  return (
    <div className="min-h-screen bg-black">
      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-4 pt-28 pb-20 text-center">
        <p className="text-[13px] text-[#536471] uppercase tracking-[0.18em] mb-5 animate-fade-in">
          Claudex
        </p>

        <h1 className="text-4xl md:text-5xl font-medium tracking-[-0.03em] text-[#e7e9ea] leading-[1.1] animate-fade-in stagger-1">
          Benchmark AI Coding Agents
        </h1>

        <p className="mt-5 text-lg text-[#8b8d93] max-w-xl mx-auto leading-relaxed animate-fade-in stagger-2">
          Run the same task on Claude Code, Codex, and Cursor. Compare results.
          Publish to your feed. Let the community decide.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 animate-fade-in stagger-3">
          <DemoResetButton />
          <Link
            href="/benchmarks/new"
            className="border border-white/[0.12] hover:border-white/[0.20] text-[#e7e9ea] font-medium text-[15px] rounded-full px-6 py-2.5 transition-colors duration-150 hover:bg-white/[0.03]"
          >
            Run a Benchmark
          </Link>
        </div>
      </section>

      {/* ── Stats Bar (client component with animated counters) ── */}
      <CounterSection />

      {/* ── Recent Posts ── */}
      {recentPosts.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pt-20 pb-4">
          <p className="text-[12px] text-[#536471] uppercase tracking-[0.15em] mb-6">
            Recent from the feed
          </p>
          <div className="space-y-0 divide-y divide-white/[0.06]">
            {recentPosts.map((row) => {
              const results = row.agent_results as AgentResult[];
              const initials = row.author.display_name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <Link
                  key={row.id}
                  href={`/feed/${row.id}`}
                  className="flex items-start gap-3 py-4 group"
                >
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-[11px] text-[#8b8d93] font-medium">
                      {initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#e7e9ea] group-hover:underline">
                        {row.author.display_name}
                      </span>
                      <span className="text-[13px] text-[#536471]">
                        @{row.author.handle}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#8b8d93] mt-0.5 truncate">
                      {row.body}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {results.map((r) => {
                        const color =
                          agentColorMap[r.agent_name] || "#8b8d93";
                        return (
                          <span
                            key={r.agent_name}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px]"
                            style={{
                              backgroundColor: `${color}12`,
                              color: color,
                              border: `1px solid ${color}20`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {r.agent_name}: {r.result}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Interactive Demo ── */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-[12px] text-[#536471] uppercase tracking-[0.15em] mb-3">
          Preview
        </p>
        <h2 className="text-[28px] md:text-[32px] font-medium text-[#e7e9ea] tracking-tight mb-8">
          See it in action
        </h2>
        <BrowserMockup />
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-[12px] text-[#536471] uppercase tracking-[0.15em] mb-3">
          How it works
        </p>
        <h2 className="text-[28px] md:text-[32px] font-medium text-[#e7e9ea] tracking-tight mb-10">
          Three steps. Full transparency.
        </h2>

        {[
          {
            num: "01",
            title: "Submit a Task",
            desc: "Describe the coding challenge you want to benchmark. Set the requirements, constraints, and expected output.",
          },
          {
            num: "02",
            title: "Compare Agents",
            desc: "Run Claude Code, Codex, and Cursor on the same task. Each agent works independently with identical context.",
          },
          {
            num: "03",
            title: "Publish & Discuss",
            desc: "Share results to the community feed. Other developers review, comment, and vote on agent performance.",
          },
        ].map((step, i, arr) => (
          <div
            key={step.num}
            className={`flex gap-6 py-6 ${
              i < arr.length - 1 ? "border-b border-white/[0.06]" : ""
            }`}
          >
            <span className="text-[14px] font-mono text-[#1d9bf0] pt-0.5 shrink-0">
              {step.num}
            </span>
            <div>
              <h3 className="text-[16px] font-medium text-[#e7e9ea]">
                {step.title}
              </h3>
              <p className="text-[14px] text-[#8b8d93] mt-1.5 leading-relaxed max-w-lg">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Agent Cards ── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-[12px] text-[#536471] uppercase tracking-[0.15em] mb-3">
          Supported Agents
        </p>
        <h2 className="text-[28px] md:text-[32px] font-medium text-[#e7e9ea] tracking-tight mb-8">
          Three agents. Head to head.
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: "Claude Code",
              model: "Opus 4",
              desc: "Anthropic's autonomous coding agent",
              winRate: "64%",
              color: "#A855F7",
            },
            {
              name: "Codex",
              model: "GPT-4.1",
              desc: "OpenAI's cloud-based code agent",
              winRate: "52%",
              color: "#3B82F6",
            },
            {
              name: "Cursor",
              model: "Composer",
              desc: "AI-native code editor agent",
              winRate: "48%",
              color: "#F59E0B",
            },
          ].map((agent) => (
            <div
              key={agent.name}
              className="bg-[#0e0f10] border border-white/[0.06] rounded-lg p-5 hover:border-white/[0.12] transition-colors duration-150"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="text-[15px] font-medium text-[#e7e9ea]">
                  {agent.name}
                </span>
              </div>
              <p className="text-[13px] text-[#536471] mb-1">{agent.model}</p>
              <p className="text-[13px] text-[#8b8d93] leading-relaxed">
                {agent.desc}
              </p>
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <p className="text-[11px] text-[#536471] uppercase tracking-[0.1em]">
                  Win rate
                </p>
                <p
                  className="text-[20px] font-bold tabular-nums mt-0.5"
                  style={{ color: agent.color }}
                >
                  {agent.winRate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-[28px] md:text-[32px] font-medium text-[#e7e9ea] tracking-tight">
          Ready to benchmark?
        </h2>
        <p className="mt-3 text-[15px] text-[#8b8d93] max-w-md mx-auto">
          Join the community of developers comparing AI coding agents.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <DemoResetButton />
          <Link
            href="/benchmarks/new"
            className="border border-white/[0.12] hover:border-white/[0.20] text-[#e7e9ea] font-medium text-[15px] rounded-full px-6 py-2.5 transition-colors duration-150 hover:bg-white/[0.03]"
          >
            Run a Benchmark
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-[13px] text-[#3d3f45]">
            &copy; 2026 Claudex &middot; Terms &middot; Privacy
          </p>
        </div>
      </footer>
    </div>
  );
}
