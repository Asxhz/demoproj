"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          handle,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Signup failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-[#111113] border border-white/[0.08] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#F4F4F5]">Create your account</h2>
        <p className="mt-1 text-sm text-[rgba(244,244,245,0.40)]">
          Join Claudex and start benchmarking
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5">
              Display name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="signup-handle" className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5">
              Handle
            </label>
            <input
              id="signup-handle"
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="janedoe"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-[rgba(244,244,245,0.62)] mb-1.5">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#09090B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[rgba(244,244,245,0.40)] focus:outline-none focus:border-[#38BDF8]/50 transition-colors"
              placeholder="********"
            />
          </div>

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
