"use client";

import { useState } from "react";

export default function DiscordInvite({ configured }: { configured: boolean }) {
  const [name, setName] = useState("Claudex sync");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    eventUrl: string;
    inviteUrl: string;
    signupUrl: string;
  } | null>(null);

  async function send() {
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/integrations/discord/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.missing?.length
          ? `Missing env: ${data.missing.join(", ")}`
          : data.detail || "Could not send invites",
      );
      return;
    }
    setResult(data);
  }

  return (
    <div className="space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Meeting name"
        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[14px] text-[#e7e9ea]"
      />
      <button
        onClick={send}
        disabled={loading || !configured}
        className="bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-40 text-white font-medium text-[14px] rounded-full px-4 py-2 transition-colors cursor-pointer"
      >
        {loading ? "Sending" : "Create meeting and invite"}
      </button>
      {error && <p className="text-[13px] text-[#EF4444]">{error}</p>}
      {result && (
        <div className="text-[13px] space-y-1 pt-1">
          <a href={result.eventUrl} target="_blank" rel="noreferrer" className="block text-[#1d9bf0] hover:underline">
            Join the call
          </a>
          <a href={result.inviteUrl} target="_blank" rel="noreferrer" className="block text-[#1d9bf0] hover:underline">
            Server invite
          </a>
          <p className="text-[#536471] break-all">Signup link shared: {result.signupUrl}</p>
        </div>
      )}
    </div>
  );
}
