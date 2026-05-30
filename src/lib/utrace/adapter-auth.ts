import { createHmac, timingSafeEqual } from "crypto";

export type AdapterAuthResult = {
  clientId: string;
  sessionId: string;
  purpose: string;
};

const seenNonces = new Set<string>();

function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalJson).join(",") + "]";
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const entries = sorted.map(
    (k) => JSON.stringify(k) + ":" + canonicalJson((obj as Record<string, unknown>)[k])
  );
  return "{" + entries.join(",") + "}";
}

export async function validateAdapterAuth(
  headers: Headers,
  body: Record<string, unknown>
): Promise<AdapterAuthResult> {
  const clientId = headers.get("x-utrace-client-id");
  const sessionId = headers.get("x-utrace-session-id");
  const purpose = headers.get("x-utrace-purpose");
  const expiresAt = headers.get("x-utrace-expires-at");
  const nonce = headers.get("x-utrace-nonce");
  const signature = headers.get("x-utrace-seed-signature");

  if (!purpose || !expiresAt || !nonce || !signature) {
    throw new AdapterAuthError("Missing required adapter headers", 400);
  }

  const expiryEpoch = Number(expiresAt);
  if (isNaN(expiryEpoch) || expiryEpoch <= Math.floor(Date.now() / 1000)) {
    throw new AdapterAuthError("Request has expired", 401);
  }

  if (seenNonces.has(nonce)) {
    throw new AdapterAuthError("Nonce already used", 401);
  }

  const secret = process.env.UTRACE_ADAPTER_SECRET;
  if (!secret) {
    throw new AdapterAuthError("Adapter secret not configured", 500);
  }

  const canonicalPayload = canonicalJson(body);
  const message = `${purpose}.${expiresAt}.${nonce}.${canonicalPayload}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new AdapterAuthError("Invalid signature", 401);
  }

  seenNonces.add(nonce);

  return {
    clientId: clientId ?? body.client_id as string ?? "",
    sessionId: sessionId ?? body.session_id as string ?? "",
    purpose,
  };
}

export class AdapterAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdapterAuthError";
    this.status = status;
  }
}
