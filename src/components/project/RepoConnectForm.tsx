"use client";

import { useEffect, useState } from "react";
import { attachRepo } from "@/lib/server/projects";
import type { GithubRepo } from "@/types";

export default function RepoConnectForm({
  projectId,
  slug,
  current,
}: {
  projectId: string;
  slug: string;
  current: string | null;
}) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/integrations/github/repos")
      .then((r) => r.json())
      .then((d) => {
        setConnected(d.error !== "not_connected");
        setRepos(d.repos || []);
      })
      .catch(() => setConnected(false));
  }, []);

  return (
    <form action={attachRepo} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="slug" value={slug} />
      {connected && repos.length > 0 ? (
        <select
          name="repo_full_name"
          defaultValue={current ?? ""}
          className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-[#e7e9ea] font-mono min-w-[220px]"
        >
          <option value="">No repo</option>
          {repos.map((r) => (
            <option key={r.full_name} value={r.full_name}>
              {r.full_name}
            </option>
          ))}
        </select>
      ) : (
        <input
          name="repo_full_name"
          defaultValue={current ?? ""}
          placeholder="owner/repo"
          className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[13px] text-[#e7e9ea] font-mono min-w-[220px]"
        />
      )}
      <button
        type="submit"
        className="bg-white/[0.06] hover:bg-white/[0.1] text-[#e7e9ea] text-[13px] font-medium rounded-full px-4 py-2 transition-colors cursor-pointer"
      >
        Save repo
      </button>
      {connected === false && (
        <span className="text-[12px] text-[#536471]">
          Connect GitHub in Tools to pick from a list.
        </span>
      )}
    </form>
  );
}
