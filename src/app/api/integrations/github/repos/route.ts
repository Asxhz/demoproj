import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getIntegration } from "@/lib/integrations";
import { listGithubRepos } from "@/lib/github";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const intg = await getIntegration(user.id, "github");
  if (!intg?.access_token) {
    return NextResponse.json({ error: "not_connected", repos: [] }, { status: 200 });
  }

  try {
    const repos = await listGithubRepos(intg.access_token);
    return NextResponse.json({ repos });
  } catch {
    return NextResponse.json({ error: "github_error", repos: [] }, { status: 502 });
  }
}
