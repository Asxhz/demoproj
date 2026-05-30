"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Comment, User } from "@/types";
import { timeAgo, fakeCommentEngagement } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

type CommentWithAuthor = Comment & { author: User };

interface CommentThreadProps {
  initialComments: CommentWithAuthor[];
  postId: string;
}

export default function CommentThread({ initialComments, postId }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);
  const [showNewPill, setShowNewPill] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollCountRef = useRef(0);
  const noNewCountRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knownIdsRef = useRef<Set<string>>(new Set(initialComments.map((c) => c.id)));

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/feed/${postId}`);
      if (!res.ok) return;
      const data = await res.json();
      const fetched: CommentWithAuthor[] = data.comments ?? [];

      const freshIds = new Set(fetched.map((c: CommentWithAuthor) => c.id));
      const incomingNew: string[] = [];
      for (const id of freshIds) {
        if (!knownIdsRef.current.has(id)) {
          incomingNew.push(id);
        }
      }

      if (incomingNew.length > 0) {
        noNewCountRef.current = 0;
        for (const id of incomingNew) {
          knownIdsRef.current.add(id);
        }
        setPendingCount((prev) => prev + incomingNew.length);
        setShowNewPill(true);
        setNewCommentIds((prev) => {
          const next = new Set(prev);
          for (const id of incomingNew) next.add(id);
          return next;
        });
        setComments(fetched);
      } else {
        noNewCountRef.current += 1;
      }

      pollCountRef.current += 1;

      if (pollCountRef.current >= 40 || noNewCountRef.current >= 10) {
        stopPolling();
      }
    } catch {
      // Silently ignore poll errors
    }
  }, [postId, stopPolling]);

  useEffect(() => {
    pollingRef.current = setInterval(fetchComments, 3000);
    return () => stopPolling();
  }, [fetchComments, stopPolling]);

  useEffect(() => {
    if (newCommentIds.size === 0) return;
    const timer = setTimeout(() => {
      setNewCommentIds(new Set());
    }, 600);
    return () => clearTimeout(timer);
  }, [newCommentIds]);

  function handleDismissPill() {
    setShowNewPill(false);
    setPendingCount(0);
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!body.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to post comment");
      }

      const newComment = await res.json();

      const optimistic: CommentWithAuthor = {
        id: newComment.id,
        post_id: newComment.post_id,
        author_id: newComment.author_id,
        body: newComment.body,
        created_at: newComment.created_at,
        author: {
          id: newComment.author_id,
          email: null,
          display_name: "You",
          handle: "you",
          avatar_seed: null,
          bio: null,
          created_at: null,
        },
      };

      knownIdsRef.current.add(newComment.id);
      setComments((prev) => [...prev, optimistic]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Reply input area - Twitter style */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-[#2f3336]">
        <div className="flex items-start gap-3">
          <Avatar handle="you" displayName="You" size="md" />
          <div className="flex-1 pt-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Post your reply"
              rows={2}
              className="w-full resize-none bg-transparent text-[17px] text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none border-none"
            />
            {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
            <div className="flex items-center justify-end pt-2 border-t border-[#2f3336]">
              <button
                type="submit"
                disabled={!body.trim() || loading}
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-[15px] rounded-full px-5 py-1.5 transition-colors duration-150 cursor-pointer"
              >
                {loading ? "Posting..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* New comments pill */}
      {showNewPill && pendingCount > 0 && (
        <div className="sticky top-0 z-10 flex justify-center py-2 border-b border-[#2f3336]">
          <button
            onClick={handleDismissPill}
            className="rounded-full bg-[#1d9bf0]/90 px-4 py-1.5 text-[13px] font-medium text-white shadow-lg backdrop-blur-sm hover:bg-[#1d9bf0] transition-colors duration-150"
          >
            Show {pendingCount} new {pendingCount !== 1 ? "replies" : "reply"}
          </button>
        </div>
      )}

      {/* Comments as tweet-style items */}
      <div ref={containerRef}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="px-4 py-3 border-b border-[#2f3336] post-hover transition-colors duration-150"
            style={{
              animation: newCommentIds.has(comment.id)
                ? "commentFadeIn 300ms ease-out forwards"
                : undefined,
            }}
          >
            <div className="flex gap-3">
              <div className="shrink-0 pt-0.5">
                <Avatar
                  handle={comment.author.handle}
                  displayName={comment.author.display_name}
                  size="md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-[15px] font-bold text-[#e7e9ea] leading-5">
                    {comment.author.display_name}
                  </span>
                  <span className="text-[15px] text-[#8b8d93] leading-5">
                    @{comment.author.handle}
                  </span>
                  {comment.created_at && (
                    <>
                      <span className="text-[#3d3f45]">&middot;</span>
                      <span className="text-[15px] text-[#536471] leading-5">
                        {timeAgo(new Date(comment.created_at))}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-0.5 text-[15px] text-[#e7e9ea] leading-[1.5]">
                  {comment.body}
                </p>

                {/* Comment action bar */}
                {(() => {
                  const eng = fakeCommentEngagement(comment.id);
                  return (
                    <div className="mt-2 flex items-center justify-between max-w-[350px] -ml-2">
                      {/* Reply */}
                      <button className="group flex items-center gap-1">
                        <span className="p-1.5 rounded-full action-comment transition-colors duration-150">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#536471] group-hover:text-[#1d9bf0] transition-colors">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        {eng.replies > 0 && <span className="text-[12px] text-[#536471] group-hover:text-[#1d9bf0] transition-colors tabular-nums">{eng.replies}</span>}
                      </button>
                      {/* Repost */}
                      <button className="group flex items-center gap-1">
                        <span className="p-1.5 rounded-full action-repost transition-colors duration-150">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#536471] group-hover:text-[#00ba7c] transition-colors">
                            <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        {eng.reposts > 0 && <span className="text-[12px] text-[#536471] group-hover:text-[#00ba7c] transition-colors tabular-nums">{eng.reposts}</span>}
                      </button>
                      {/* Like */}
                      <button className="group flex items-center gap-1">
                        <span className="p-1.5 rounded-full action-like transition-colors duration-150">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#536471] group-hover:text-[#f91880] transition-colors">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        {eng.likes > 0 && <span className="text-[12px] text-[#536471] group-hover:text-[#f91880] transition-colors tabular-nums">{eng.likes}</span>}
                      </button>
                      {/* Share */}
                      <button className="p-1.5 rounded-full action-share transition-colors duration-150">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#536471] hover:text-[#1d9bf0] transition-colors">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes commentFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
