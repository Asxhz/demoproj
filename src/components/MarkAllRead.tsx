"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkAllRead() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAll() {
    setLoading(true);
    await fetch("/api/notifications/read", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={markAll}
      disabled={loading}
      className="text-[13px] text-[#1d9bf0] hover:underline disabled:opacity-50 cursor-pointer"
    >
      Mark all read
    </button>
  );
}
