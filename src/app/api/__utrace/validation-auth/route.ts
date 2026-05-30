import { NextRequest, NextResponse } from "next/server";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";
import { tokenStore } from "@/app/api/__utrace/validation-token/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    const { validation_token } = body as Record<string, string>;

    if (!validation_token || typeof validation_token !== "string") {
      return NextResponse.json(
        { error: "validation_token is required" },
        { status: 400 }
      );
    }

    const entry = tokenStore.get(validation_token);

    if (!entry) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (entry.expiresAt < new Date()) {
      tokenStore.delete(validation_token);
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 401 }
      );
    }

    tokenStore.delete(validation_token);

    return NextResponse.json({
      authenticated: true,
      browser_authenticated: true,
      session_id: entry.sessionId,
      preview_id: entry.previewId,
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
