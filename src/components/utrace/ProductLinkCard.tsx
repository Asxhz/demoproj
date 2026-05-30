"use client";

import { useState } from "react";
import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ProductLinkCardProps {
  user: User;
  state: string;
  callbackUrl: string;
  clientId?: string;
}

export default function ProductLinkCard({ user, state, callbackUrl, clientId }: ProductLinkCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConnect() {
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const payload = {
        state,
        client_id: clientId ?? "claudex",
        external_user_id: user.id,
        display_name: user.display_name,
        email: user.email ?? undefined,
      };

      const payloadStr = JSON.stringify(payload, Object.keys(payload).sort());

      let signature = "";
      const secret = process.env.NEXT_PUBLIC_PRODUCT_LINK_SECRET;
      if (secret) {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          enc.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
        signature = Array.from(new Uint8Array(sig))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      }

      const res = await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(signature ? { "x-utrace-product-link-signature": signature } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Connection failed");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-[rgba(56,189,248,0.10)] flex items-center justify-center mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-[#F4F4F5]">Connect Your Claudex Account</h3>
        <p className="mt-1 text-sm text-[rgba(244,244,245,0.40)]">
          A third-party service is requesting access to verify your identity
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-lg border border-white/[0.08] px-4 py-3 w-full">
          <Avatar handle={user.handle} displayName={user.display_name} size="sm" />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-[#F4F4F5] truncate">{user.display_name}</p>
            <p className="text-xs text-[rgba(244,244,245,0.40)]">@{user.handle}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-[rgba(244,244,245,0.30)] leading-relaxed">
          This will share your display name, handle, and account ID with the requesting service.
          No passwords or private data will be shared.
        </p>

        {status === "success" ? (
          <div className="mt-5 w-full rounded-lg bg-[rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.15)] px-4 py-3">
            <p className="text-sm font-medium text-[#22C55E]">Account connected</p>
            <p className="text-xs text-[rgba(34,197,94,0.60)] mt-0.5">You can close this tab</p>
          </div>
        ) : (
          <>
            <Button
              className="mt-5 w-full"
              onClick={handleConnect}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Connecting..." : "Authorize Connection"}
            </Button>

            {status === "error" && errorMessage && (
              <p className="mt-3 text-xs text-[#EF4444]">{errorMessage}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
