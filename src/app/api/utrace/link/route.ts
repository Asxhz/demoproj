import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_CALLBACK_ORIGINS = [
  "https://www.utrace.dev",
  "https://utrace.dev",
  "http://localhost:3001",
];

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { state, callback_url } = await request.json();

  if (!state || !callback_url) {
    return NextResponse.json({ error: "Missing state or callback_url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(callback_url);
  } catch {
    return NextResponse.json({ error: "Invalid callback URL" }, { status: 400 });
  }

  const origin = parsed.origin;
  if (!ALLOWED_CALLBACK_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Callback URL not allowed" }, { status: 403 });
  }

  if (parsed.protocol !== "https:" && !origin.startsWith("http://localhost")) {
    return NextResponse.json({ error: "HTTPS required" }, { status: 400 });
  }

  const payload = {
    state,
    client_id: "claudex",
    external_user_id: user.id,
    display_name: user.display_name,
  };

  const payloadStr = JSON.stringify(payload, Object.keys(payload).sort());

  const secret = process.env.HMAC_SECRET;
  let headers: Record<string, string> = { "Content-Type": "application/json" };

  if (secret) {
    const signature = createHmac("sha256", secret).update(payloadStr).digest("hex");
    headers["x-utrace-product-link-signature"] = signature;
  }

  const res = await fetch(callback_url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(
      { error: data?.error ?? "Callback failed" },
      { status: res.status }
    );
  }

  return NextResponse.json({ connected: true });
}
