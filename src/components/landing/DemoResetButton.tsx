"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DemoResetButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
    } catch {
      // proceed anyway
    }
    router.push("/login");
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[15px] rounded-full px-6 py-2.5 transition-colors duration-150 disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Resetting…
        </span>
      ) : (
        "Browse Feed"
      )}
    </button>
  );
}
