"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      disabled={loading}
      className={`text-[14px] text-[#8b8d93] hover:text-[#e7e9ea] transition-colors disabled:opacity-50 cursor-pointer ${className}`}
    >
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}
