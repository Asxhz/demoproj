"use client";

import { useState } from "react";

export default function BrowserbaseLaunch({ configured }: { configured: boolean }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function launch() {
    setLoading(true);
    setError("");
    setUrl("");
    const res = await fetch("/api/integrations/browserbase/session", {
      method: "POST",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.missing?.length
          ? `Missing env: ${data.missing.join(", ")}`
          : data.detail || "Could not start a session",
      );
      return;
    }
    setUrl(data.liveViewUrl);
  }

  return (
    <div>
      <button
        onClick={launch}
        disabled={loading || !configured}
        className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-40 text-white font-medium text-[14px] rounded-full px-4 py-2 transition-colors cursor-pointer"
      >
        {loading ? "Starting" : "Launch browser session"}
      </button>
      {error && <p className="text-[13px] text-[#EF4444] mt-2">{error}</p>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block text-[13px] text-[#1d9bf0] hover:underline mt-2 break-all"
        >
          Open live view
        </a>
      )}
    </div>
  );
}
