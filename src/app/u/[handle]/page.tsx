import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, feedPosts, benchmarkTasks } from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import type { FeedPost, User, AgentResult } from "@/types";
import Avatar from "@/components/ui/Avatar";
import FeedPostCard from "@/components/feed/FeedPostCard";
import Link from "next/link";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const userRows = await db
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
    .where(eq(users.handle, handle))
    .limit(1);

  if (!userRows.length) notFound();

  const user = userRows[0] as User;

  const posts = await db
    .select({
      id: feedPosts.id,
      author_id: feedPosts.author_id,
      task_id: feedPosts.task_id,
      body: feedPosts.body,
      agent_results: feedPosts.agent_results,
      is_draft: feedPosts.is_draft,
      published_at: feedPosts.published_at,
      created_at: feedPosts.created_at,
    })
    .from(feedPosts)
    .where(and(eq(feedPosts.author_id, user.id), eq(feedPosts.is_draft, false)))
    .orderBy(desc(feedPosts.published_at));

  const taskCount = await db
    .select({ count: count() })
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.author_id, user.id));

  const postCount = posts.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-32 bg-gradient-to-r from-[#6366F1]/20 via-[#A855F7]/20 to-[#6366F1]/10" />

      <div className="px-4 pb-4 border-b border-white/[0.08]">
        <div className="-mt-10 flex items-end justify-between">
          <div className="ring-4 ring-[#09090B] rounded-full">
            <Avatar handle={user.handle} displayName={user.display_name} size="lg" />
          </div>
          <Link
            href={`/benchmarks/new`}
            className="text-sm font-medium px-4 py-1.5 rounded-full border border-white/[0.14] text-[#F4F4F5] hover:bg-white/[0.04] transition-colors"
          >
            View Benchmarks
          </Link>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold text-[#F4F4F5]">{user.display_name}</h1>
          <p className="text-[15px] text-[rgba(244,244,245,0.40)]">@{user.handle}</p>
        </div>

        {user.bio && (
          <p className="mt-2 text-[15px] text-[rgba(244,244,245,0.62)] leading-relaxed">
            {user.bio}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4 text-sm text-[rgba(244,244,245,0.40)]">
          {user.created_at && (
            <span className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-5 text-sm">
          <span>
            <span className="font-semibold text-[#F4F4F5]">{taskCount[0]?.count ?? 0}</span>
            <span className="text-[rgba(244,244,245,0.40)]"> Benchmarks</span>
          </span>
          <span>
            <span className="font-semibold text-[#F4F4F5]">{postCount}</span>
            <span className="text-[rgba(244,244,245,0.40)]"> Posts</span>
          </span>
        </div>
      </div>

      <div>
        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[15px] text-[rgba(244,244,245,0.40)]">No posts yet.</p>
          </div>
        ) : (
          posts.map((row) => (
            <FeedPostCard
              key={row.id}
              post={{
                id: row.id,
                author_id: row.author_id,
                task_id: row.task_id,
                body: row.body,
                agent_results: row.agent_results as AgentResult[],
                is_draft: row.is_draft,
                published_at: row.published_at,
                created_at: row.created_at,
                author: user,
              } as FeedPost & { author: User }}
            />
          ))
        )}
      </div>
    </div>
  );
}
