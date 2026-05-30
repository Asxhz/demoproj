"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function NewBenchmarkPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading || !title.trim() || !description.trim()) return;

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, difficulty, tags }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to create benchmark");
      }

      const data = await res.json();
      router.push(`/benchmarks/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#F4F4F5] tracking-tight">
        Create Benchmark
      </h1>
      <p className="mt-2 text-sm text-[rgba(244,244,245,0.40)]">
        Define a new benchmark task to evaluate coding agents.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="bench-title"
              className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5"
            >
              Title
            </label>
            <input
              id="bench-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="e.g. Fix React rendering bug"
            />
          </div>

          <div>
            <label
              htmlFor="bench-desc"
              className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5"
            >
              Description
            </label>
            <textarea
              id="bench-desc"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="Describe the task agents should complete..."
            />
          </div>

          <div>
            <label
              htmlFor="bench-diff"
              className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5"
            >
              Difficulty
            </label>
            <select
              id="bench-diff"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="bench-tags"
              className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5"
            >
              Tags (comma-separated)
            </label>
            <input
              id="bench-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="react, debugging, typescript"
            />
          </div>

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Benchmark"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
