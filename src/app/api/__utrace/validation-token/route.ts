import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";

type TokenEntry = {
  sessionId: string;
  previewId: string;
  clientId: string;
  expiresAt: Date;
};

const tokenStore = new Map<string, TokenEntry>();

export { tokenStore };

const TOKEN_TTL_MS = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, sessionId } = await validateAdapterAuth(
      request.headers,
      body
    );

    const previewId = (body as Record<string, string>).preview_id ?? "";
    const validationToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const expiresAtEpoch = Math.floor(expiresAt.getTime() / 1000);

    tokenStore.set(validationToken, {
      sessionId,
      previewId,
      clientId,
      expiresAt,
    });

    return NextResponse.json({
      session_id: sessionId,
      preview_id: previewId,
      validation_token: validationToken,
      expires_at: expiresAtEpoch,
    });
  } catch (error) {
    if (error instanceof AdapterAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
