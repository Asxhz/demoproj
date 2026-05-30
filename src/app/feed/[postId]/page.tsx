import { notFound } from "next/navigation";
import { db } from "@/db";
import { feedPosts, users, comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { AgentResult, Comment, User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import AgentResultCard from "@/components/feed/AgentResultCard";
import CommentThread from "@/components/feed/CommentThread";
import { timeAgo } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const postRows = await db
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
    .where(eq(feedPosts.id, postId))
    .limit(1);

  if (!postRows.length) notFound();

  const post = postRows[0];

  if (post.is_draft) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== post.author_id) {
      notFound();
    }
  }
  const agentResults = post.agent_results as AgentResult[];
  const published = post.published_at ?? post.created_at;

  const commentRows = await db
    .select({
      id: comments.id,
      post_id: comments.post_id,
      author_id: comments.author_id,
      body: comments.body,
      created_at: comments.created_at,
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
    .from(comments)
    .innerJoin(users, eq(comments.author_id, users.id))
    .where(eq(comments.post_id, postId))
    .orderBy(desc(comments.created_at));

  const commentsWithAuthor = commentRows.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    author_id: c.author_id,
    body: c.body,
    created_at: c.created_at,
    author: c.author as User,
  })) as (Comment & { author: User })[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <article>
        <div className="flex items-start gap-3">
          <Avatar
            handle={post.author.handle}
            displayName={post.author.display_name}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#F4F4F5]">
                {post.author.display_name}
              </span>
              <span className="text-sm text-[rgba(244,244,245,0.40)]">
                @{post.author.handle}
              </span>
              {published && (
                <>
                  <span className="text-[rgba(244,244,245,0.40)]">&middot;</span>
                  <span className="text-sm text-[rgba(244,244,245,0.40)]">
                    {timeAgo(new Date(published))}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[rgba(244,244,245,0.62)] leading-relaxed whitespace-pre-line">
          {post.body}
        </p>

        {agentResults.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold text-[#F4F4F5]">
              Agent Results
            </h2>
            <div className="grid gap-3">
              {agentResults.map((ar) => (
                <AgentResultCard
                  key={ar.agent_name}
                  agentName={ar.agent_name}
                  result={ar.result}
                  explanation={ar.explanation}
                />
              ))}
            </div>
          </div>
        )}
      </article>

      <div className="mt-8 border-t border-white/[0.08]">
        <h2 className="px-4 pt-6 pb-2 text-sm font-semibold text-[#F4F4F5]">
          Comments
        </h2>
        <CommentThread initialComments={commentsWithAuthor} postId={postId} />
      </div>
    </div>
  );
}
