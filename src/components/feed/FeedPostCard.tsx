import Link from "next/link";
import type { FeedPost, User } from "@/types";
import { timeAgo, fakeEngagement } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import AgentResultBadge from "@/components/feed/AgentResultBadge";

interface FeedPostCardProps {
  post: FeedPost & { author: User };
  commentCount?: number;
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  const published = post.published_at ?? post.created_at;
  const engagement = fakeEngagement(post.id);

  return (
    <Link href={post.is_draft ? `/benchmarks/${post.task_id}` : `/feed/${post.id}`} className="block">
      <article className="px-4 py-3 border-b border-white/[0.08] post-hover transition-colors duration-200 cursor-pointer">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="shrink-0 pt-0.5">
            <Avatar
              handle={post.author.handle}
              displayName={post.author.display_name}
              size="md"
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Header: name, handle, time */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[15px] font-bold text-[#F4F4F5] leading-5">
                {post.author.display_name}
              </span>
              <span className="text-[15px] text-[rgba(244,244,245,0.45)] leading-5">
                @{post.author.handle}
              </span>
              {published && (
                <>
                  <span className="text-[rgba(244,244,245,0.30)]">&middot;</span>
                  <span className="text-[15px] text-[rgba(244,244,245,0.45)] leading-5">
                    {timeAgo(new Date(published))}
                  </span>
                </>
              )}
              {post.is_draft && (
                <span className="ml-1 rounded-full bg-[rgba(234,179,8,0.12)] border border-[rgba(234,179,8,0.20)] px-2 py-0.5 text-[10px] font-medium text-[#EAB308] uppercase tracking-wider">
                  Draft
                </span>
              )}
            </div>

            {/* Body */}
            <p className="mt-1 text-[15px] text-[#F4F4F5] leading-[1.5] whitespace-pre-line">
              {post.body}
            </p>

            {/* Agent result badges */}
            {post.agent_results.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {post.agent_results.map((ar) => (
                  <AgentResultBadge
                    key={ar.agent_name}
                    agentName={ar.agent_name}
                    result={ar.result}
                  />
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="mt-2.5 flex items-center justify-between max-w-[425px] -ml-2">
              {/* Comment */}
              <button className="group flex items-center gap-1.5">
                <span className="p-2 rounded-full action-comment transition-colors duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[rgba(244,244,245,0.40)] group-hover:text-[#1D9BF0] transition-colors">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[13px] text-[rgba(244,244,245,0.40)] group-hover:text-[#1D9BF0] transition-colors tabular-nums">{engagement.comments}</span>
              </button>

              {/* Repost */}
              <button className="group flex items-center gap-1.5">
                <span className="p-2 rounded-full action-repost transition-colors duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[rgba(244,244,245,0.40)] group-hover:text-[#00BA7C] transition-colors">
                    <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[13px] text-[rgba(244,244,245,0.40)] group-hover:text-[#00BA7C] transition-colors tabular-nums">{engagement.reposts}</span>
              </button>

              {/* Like */}
              <button className="group flex items-center gap-1.5">
                <span className="p-2 rounded-full action-like transition-colors duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[rgba(244,244,245,0.40)] group-hover:text-[#F91880] transition-colors">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[13px] text-[rgba(244,244,245,0.40)] group-hover:text-[#F91880] transition-colors tabular-nums">{engagement.likes}</span>
              </button>

              {/* Views */}
              <button className="group flex items-center gap-1.5">
                <span className="p-2 rounded-full action-share transition-colors duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[rgba(244,244,245,0.40)] group-hover:text-[#1D9BF0] transition-colors">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[13px] text-[rgba(244,244,245,0.40)] group-hover:text-[#1D9BF0] transition-colors tabular-nums">{engagement.views}</span>
              </button>

              {/* Bookmark + Share */}
              <div className="flex items-center">
                <button className="p-2 rounded-full action-bookmark transition-colors duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[rgba(244,244,245,0.40)] hover:text-[#1D9BF0] transition-colors">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="p-2 rounded-full action-share transition-colors duration-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[rgba(244,244,245,0.40)] hover:text-[#1D9BF0] transition-colors">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
