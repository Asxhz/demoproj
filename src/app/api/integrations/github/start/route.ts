import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { github } from "@/lib/config";
import { githubAuthorizeUrl } from "@/lib/github";
import { db } from "@/db";
import { oauthStates } from "@/db/schema";
import { generateId } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", appBase()));

  if (!github.configured()) {
    return NextResponse.redirect(
      new URL("/tools?error=github_not_configured", appBase()),
    );
  }

  const state = generateId("st");
  await db.insert(oauthStates).values({
    id: state,
    user_id: user.id,
    provider: "github",
    redirect: "/tools",
  });

  return NextResponse.redirect(githubAuthorizeUrl(state));
}

function appBase() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
