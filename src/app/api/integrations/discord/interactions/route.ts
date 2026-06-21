import { NextRequest, NextResponse } from "next/server";
import { verifyDiscordRequest, createMeetingEvent } from "@/lib/discord";
import { appUrl } from "@/lib/config";

export const runtime = "nodejs";

const EPHEMERAL = 64;

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature-ed25519") || "";
  const timestamp = request.headers.get("x-signature-timestamp") || "";
  const rawBody = await request.text();

  if (!verifyDiscordRequest(rawBody, signature, timestamp)) {
    return new NextResponse("invalid request signature", { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // PING
  if (body.type === 1) return NextResponse.json({ type: 1 });

  // APPLICATION_COMMAND
  if (body.type === 2) {
    const name = body.data?.name as string;

    if (name === "signup") {
      return NextResponse.json({
        type: 4,
        data: {
          content: `Create your Claudex account: ${appUrl()}/signup`,
          flags: EPHEMERAL,
        },
      });
    }

    if (name === "join") {
      try {
        const meeting = await createMeetingEvent({
          name: "Claudex sync",
          description: "Team call scheduled from Discord.",
        });
        return NextResponse.json({
          type: 4,
          data: {
            content: `Meeting ready. Join the call: ${meeting.eventUrl}`,
            flags: EPHEMERAL,
          },
        });
      } catch {
        return NextResponse.json({
          type: 4,
          data: { content: "Could not create the meeting.", flags: EPHEMERAL },
        });
      }
    }

    return NextResponse.json({
      type: 4,
      data: { content: "Unknown command.", flags: EPHEMERAL },
    });
  }

  return NextResponse.json({ type: 1 });
}
