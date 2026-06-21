import crypto from "crypto";
import { discord } from "./config";

const API = "https://discord.com/api/v10";

// Build an Ed25519 public key object from Discord's hex public key.
function publicKeyObject() {
  const raw = Buffer.from(discord.publicKey(), "hex");
  const der = Buffer.concat([
    Buffer.from("302a300506032b6570032100", "hex"), // SPKI prefix for Ed25519
    raw,
  ]);
  return crypto.createPublicKey({ key: der, format: "der", type: "spki" });
}

// Verify an interaction request signature (security-critical: Discord requires
// every interactions endpoint to reject forged requests).
export function verifyDiscordRequest(
  rawBody: string,
  signatureHex: string,
  timestamp: string,
): boolean {
  if (!discord.publicKey() || !signatureHex || !timestamp) return false;
  try {
    const message = Buffer.from(timestamp + rawBody);
    const signature = Buffer.from(signatureHex, "hex");
    return crypto.verify(null, message, publicKeyObject(), signature);
  } catch {
    return false;
  }
}

async function discordRequest<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${discord.botToken()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Create a voice-channel invite (no expiry, single use off).
export async function createChannelInvite(channelId: string): Promise<string> {
  const data = await discordRequest<{ code: string }>(
    `/channels/${channelId}/invites`,
    "POST",
    { max_age: 0, max_uses: 0, unique: true },
  );
  return `https://discord.gg/${data.code}`;
}

// Create a scheduled voice event = the "meeting with call".
export async function createMeetingEvent(opts: {
  name: string;
  description?: string;
  startTime?: Date;
}): Promise<{ eventUrl: string; id: string }> {
  const guildId = discord.guildId();
  const start = opts.startTime ?? new Date(Date.now() + 60 * 60 * 1000);
  const data = await discordRequest<{ id: string }>(
    `/guilds/${guildId}/scheduled-events`,
    "POST",
    {
      channel_id: discord.voiceChannelId(),
      name: opts.name,
      description: opts.description ?? "",
      privacy_level: 2, // GUILD_ONLY
      entity_type: 2, // VOICE
      scheduled_start_time: start.toISOString(),
    },
  );
  return {
    id: data.id,
    eventUrl: `https://discord.com/events/${guildId}/${data.id}`,
  };
}

// Post an announcement (signup + meeting links) to a text channel.
export async function postMessage(
  channelId: string,
  content: string,
): Promise<void> {
  await discordRequest(`/channels/${channelId}/messages`, "POST", { content });
}
