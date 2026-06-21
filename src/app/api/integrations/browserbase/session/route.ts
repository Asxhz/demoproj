import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { browserbase } from "@/lib/config";
import { createBrowserbaseSession } from "@/lib/browserbase";
import { saveIntegration } from "@/lib/integrations";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!browserbase.configured()) {
    return NextResponse.json(
      { error: "browserbase_not_configured", missing: browserbase.missing() },
      { status: 400 },
    );
  }

  try {
    const session = await createBrowserbaseSession();
    await saveIntegration(user.id, "browserbase", {
      account_label: browserbase.projectId(),
      meta: { last_session: session.id },
    });
    return NextResponse.json({ ok: true, ...session });
  } catch (err) {
    return NextResponse.json(
      { error: "browserbase_failed", detail: String(err) },
      { status: 502 },
    );
  }
}
