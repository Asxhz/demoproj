"use client";

import { useState, type FormEvent } from "react";
import type { Comment, User } from "@/types";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

interface CommentThreadProps {
  comments: (Comment & { author: User })[];
  postId: string;
}

export default function CommentThread({ comments, postId }: CommentThreadProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setBody("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-0">
      <div className="divide-y divide-white/[0.06]">
        {comments.map((comment) => (
          <div key={comment.id} className="px-4 py-4 flex items-start gap-3">
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
            {loading ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
