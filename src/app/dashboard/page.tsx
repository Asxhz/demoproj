import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { benchmarkTasks, feedPosts, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import type { FeedPost, User, BenchmarkTask } from "@/types";
import FeedPostCard from "@/components/feed/FeedPostCard";
import Card from "@/components/ui/Card";

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
      and(eq(feedPosts.author_id, currentUser.id), eq(feedPosts.is_draft, true))
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#F4F4F5] tracking-tight">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[rgba(244,244,245,0.40)]">
        Welcome back, {currentUser.display_name}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
          Your Benchmarks
        </h2>
        {myTasks.length === 0 ? (
          <p className="text-sm text-[rgba(244,244,245,0.40)]">
            No benchmarks yet.{" "}
            <Link
              href="/benchmarks/new"
              className="text-[#38BDF8] hover:underline"
            >
              Create one
            </Link>
          </p>
        ) : (
          <div className="grid gap-3">
            {myTasks.map((task) => (
              <Link key={task.id} href={`/benchmarks/${task.id}`}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F4F4F5] truncate">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-[rgba(244,244,245,0.40)] line-clamp-2">
                        {task.description}
                      </p>
                    </div>
                    {task.difficulty && (
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-[rgba(244,244,245,0.62)] bg-white/[0.06]">
                        {task.difficulty}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
          Your Drafts
        </h2>
        {myDrafts.length === 0 ? (
          <p className="text-sm text-[rgba(244,244,245,0.40)]">
            No drafts.
          </p>
        ) : (
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            {myDrafts.map((row) => (
              <FeedPostCard key={row.id} post={toFeedPostWithAuthor(row)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
          Your Published Posts
        </h2>
        {myPublished.length === 0 ? (
          <p className="text-sm text-[rgba(244,244,245,0.40)]">
            No published posts yet.
          </p>
        ) : (
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            {myPublished.map((row) => (
              <FeedPostCard key={row.id} post={toFeedPostWithAuthor(row)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
