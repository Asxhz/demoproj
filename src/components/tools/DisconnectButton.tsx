"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DisconnectButton({ provider }: { provider: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function disconnect() {
    setLoading(true);
    await fetch("/api/integrations/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={disconnect}
      disabled={loading}
      className="text-[13px] text-[#EF4444] hover:underline disabled:opacity-50 cursor-pointer"
    >
      {loading ? "Disconnecting" : "Disconnect"}
    </button>
  );
}
