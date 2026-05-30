"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { BenchmarkTask, BenchmarkRun } from "@/types";
import RunCard from "@/components/benchmark/RunCard";
import Button from "@/components/ui/Button";

interface PublishFormProps {
  taskId: string;
  task: BenchmarkTask;
  runs: BenchmarkRun[];
  draftBody: string;
}

export default function PublishForm({
  taskId,
  task,
  runs,
  draftBody,
}: PublishFormProps) {
  const router = useRouter();
  const [body, setBody] = useState(
    draftBody ||
      `Benchmark results for "${task.title}"\n\n${runs
        .map((r) => `${r.agent_name}: ${r.result}`)
        .join("\n")}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    if (loading || !body.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${taskId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to publish");
      }

      const data = await res.json();
      router.push(`/feed/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#F4F4F5] tracking-tight">
        Publish to Feed
      </h1>
      <p className="mt-2 text-sm text-[rgba(244,244,245,0.40)]">
        Preview and publish your benchmark results for &ldquo;{task.title}&rdquo;
      </p>

      {runs.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[#F4F4F5] mb-3">
            Agent Results
          </h2>
          <div className="grid gap-3">
            {runs.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handlePublish} className="mt-8">
        <label
          htmlFor="publish-body"
          className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5"
        >
          Post body
        </label>
        <textarea
          id="publish-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
          placeholder="Write about your benchmark results..."
        />

        {error && <p className="mt-2 text-xs text-[#EF4444]">{error}</p>}

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" disabled={loading || !body.trim()}>
            {loading ? "Publishing..." : "Publish"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
