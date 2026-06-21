"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [display_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-[13px] text-[#8b8d93] mb-1.5">Name</label>
        <input
          value={display_name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[15px] text-[#e7e9ea]"
          placeholder="Ada Lovelace"
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#8b8d93] mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[15px] text-[#e7e9ea]"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#8b8d93] mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[15px] text-[#e7e9ea]"
          placeholder="At least 8 characters"
        />
      </div>
      {error && <p className="text-[13px] text-[#EF4444]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium rounded-full px-4 py-2.5 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Creating account" : "Create account"}
      </button>
      <p className="text-[13px] text-[#536471] text-center">
        Have an account?{" "}
        <Link href="/login" className="text-[#1d9bf0] hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
