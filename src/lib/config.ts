// Central, lazy access to integration env. Nothing throws at import time so the
// app boots even when no integration is configured; each `configured` flag lets
// the UI show exactly which env vars are missing instead of crashing.

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export const github = {
  clientId: () => process.env.GITHUB_CLIENT_ID || "",
  clientSecret: () => process.env.GITHUB_CLIENT_SECRET || "",
  redirectUri: () => `${appUrl()}/api/integrations/github/callback`,
  configured: () =>
    Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  missing: () =>
    ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"].filter((k) => !process.env[k]),
};

export const discord = {
  botToken: () => process.env.DISCORD_BOT_TOKEN || "",
  publicKey: () => process.env.DISCORD_PUBLIC_KEY || "",
  applicationId: () => process.env.DISCORD_APPLICATION_ID || "",
  guildId: () => process.env.DISCORD_GUILD_ID || "",
  voiceChannelId: () => process.env.DISCORD_VOICE_CHANNEL_ID || "",
  inviteUrl: () => process.env.DISCORD_INVITE_URL || "",
  configured: () =>
    Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_GUILD_ID),
  missing: () =>
    ["DISCORD_BOT_TOKEN", "DISCORD_GUILD_ID", "DISCORD_PUBLIC_KEY"].filter(
      (k) => !process.env[k],
    ),
};

export const browserbase = {
  apiKey: () => process.env.BROWSERBASE_API_KEY || "",
  projectId: () => process.env.BROWSERBASE_PROJECT_ID || "",
  configured: () =>
    Boolean(
      process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID,
    ),
  missing: () =>
    ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"].filter(
      (k) => !process.env[k],
    ),
};
