import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exchangeGithubCode, getGithubUser } from "@/lib/github";
import { saveIntegration } from "@/lib/integrations";
import { notify } from "@/lib/notifications";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { and, eq } from "drizzle-orm";

function appBase() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", appBase()));

  if (!code || !state) {
    return NextResponse.redirect(new URL("/tools?error=github_denied", appBase()));
  }

  // Validate CSRF state belongs to this user, then consume it.
  const rows = await db
    .select()
    .from(oauthStates)
    .where(and(eq(oauthStates.id, state), eq(oauthStates.user_id, user.id)))
    .limit(1);
  await db.delete(oauthStates).where(eq(oauthStates.id, state));

  if (!rows.length || rows[0].provider !== "github") {
    return NextResponse.redirect(new URL("/tools?error=bad_state", appBase()));
  }

  try {
    const token = await exchangeGithubCode(code);
    const ghUser = await getGithubUser(token);
    await saveIntegration(user.id, "github", {
      access_token: token,
      account_label: ghUser.login,
      meta: { avatar_url: ghUser.avatar_url },
    });
    await notify(user.id, {
      type: "integration",
      title: "GitHub connected",
      body: `Linked as @${ghUser.login}.`,
      link: "/tools",
    });
    return NextResponse.redirect(new URL("/tools?connected=github", appBase()));
  } catch {
    return NextResponse.redirect(
      new URL("/tools?error=github_exchange", appBase()),
    );
  }
}
