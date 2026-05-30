"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import type { Comment, User } from "@/types";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

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

      // Stop after 2 minutes worth of polls (40 * 3s = 120s) or 10 consecutive empty polls
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

  // Clear new-comment animation class after 300ms
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

  async function handleSubmit(e: FormEvent) {
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

      // Optimistic add - construct a minimal author object from what we have
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
    <div className="space-y-0">
      {/* New comments pill */}
      {showNewPill && pendingCount > 0 && (
        <div className="sticky top-0 z-10 flex justify-center py-2">
          <button
            onClick={handleDismissPill}
            className="rounded-full bg-[#38BDF8]/90 px-4 py-1.5 text-xs font-medium text-[#09090B] shadow-lg backdrop-blur-sm hover:bg-[#38BDF8] transition-colors"
          >
            {pendingCount} new comment{pendingCount !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      <div ref={containerRef} className="divide-y divide-white/[0.06]">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="px-4 py-4 flex items-start gap-3"
            style={{
              animation: newCommentIds.has(comment.id)
                ? "commentFadeIn 300ms ease-out forwards"
                : undefined,
            }}
          >
            <Avatar
              handle={comment.author.handle}
              displayName={comment.author.display_name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F4F4F5]">
                  {comment.author.display_name}
                </span>
                <span className="text-xs text-[rgba(244,244,245,0.40)]">
                  @{comment.author.handle}
                </span>
                {comment.created_at && (
                  <>
                    <span className="text-[rgba(244,244,245,0.40)]">&middot;</span>
                    <span className="text-xs text-[rgba(244,244,245,0.40)]">
                      {timeAgo(new Date(comment.created_at))}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-sm text-[rgba(244,244,245,0.62)] leading-relaxed">
                {comment.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 border-t border-white/[0.08]">
        <div className="flex items-start gap-3">
          <Avatar handle="you" displayName="You" size="sm" />
          <div className="flex-1">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
            />
            {error && <p className="mt-2 text-xs text-[#EF4444]">{error}</p>}
            <div className="mt-2 flex justify-end">
              <Button type="submit" disabled={!body.trim() || loading}>
                {loading ? "Posting..." : "Reply"}
              </Button>
            </div>
          </div>
        </div>
      </form>

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
