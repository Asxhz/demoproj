import Link from "next/link";
import type { FeedPost, User } from "@/types";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import AgentResultBadge from "@/components/feed/AgentResultBadge";

interface FeedPostCardProps {
  post: FeedPost & { author: User };
  commentCount?: number;
}

export default function FeedPostCard({ post, commentCount }: FeedPostCardProps) {
  const published = post.published_at ?? post.created_at;

  return (
    <Link href={post.is_draft ? `/benchmarks/${post.task_id}` : `/feed/${post.id}`} className="block">
      <article className="px-5 py-5 border-b border-white/[0.06] hover:bg-white/[0.02] transition-all duration-200">
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
              <span className="text-sm text-[rgba(244,244,245,0.35)]">
                @{post.author.handle}
              </span>
              {published && (
                <>
                  <span className="text-[rgba(244,244,245,0.20)]">·</span>
                  <span className="text-sm text-[rgba(244,244,245,0.35)]">
                    {timeAgo(new Date(published))}
                  </span>
                </>
              )}
              {post.is_draft && (
                <span className="rounded-full bg-[rgba(234,179,8,0.12)] border border-[rgba(234,179,8,0.20)] px-2 py-0.5 text-[10px] font-medium text-[#EAB308] uppercase tracking-wider">
                  Draft
                </span>
              )}
            </div>

            <p className="mt-2.5 text-[14px] text-[rgba(244,244,245,0.65)] leading-[1.65] whitespace-pre-line">
              {post.body}
            </p>

            {post.agent_results.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-2">
                {post.agent_results.map((ar) => (
                  <AgentResultBadge
                    key={ar.agent_name}
                    agentName={ar.agent_name}
                    result={ar.result}
                  />
                ))}
              </div>
            )}

            <div className="mt-3.5 flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-[rgba(244,244,245,0.30)] hover:text-[rgba(244,244,245,0.55)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {commentCount !== undefined ? commentCount : "Comments"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[rgba(244,244,245,0.30)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16,6 12,2 8,6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
