import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { discord, appUrl } from "@/lib/config";
import {
  createMeetingEvent,
  createChannelInvite,
  postMessage,
} from "@/lib/discord";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.role !== "founder") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!discord.configured() || !discord.voiceChannelId()) {
    return NextResponse.json(
      { error: "discord_not_configured", missing: discord.missing() },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "Claudex sync");

  try {
    const meeting = await createMeetingEvent({
      name,
      description: "Scheduled from Claudex.",
    });
    const inviteUrl = await createChannelInvite(discord.voiceChannelId());
    const signupUrl = `${appUrl()}/signup`;

    const announceChannel = process.env.DISCORD_ANNOUNCE_CHANNEL_ID;
    if (announceChannel) {
      await postMessage(
        announceChannel,
        `New Claudex session: ${name}\nSign up: ${signupUrl}\nJoin the call: ${meeting.eventUrl}\nServer invite: ${inviteUrl}`,
      );
    }

    await notify(user.id, {
      type: "discord",
      title: "Invites sent",
      body: `Meeting "${name}" created and shared on Discord.`,
      link: "/tools",
    });

    return NextResponse.json({
      ok: true,
      eventUrl: meeting.eventUrl,
      inviteUrl,
      signupUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "discord_failed", detail: String(err) },
      { status: 502 },
    );
  }
}
