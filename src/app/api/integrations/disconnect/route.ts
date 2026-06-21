import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteIntegration } from "@/lib/integrations";
import type { Provider } from "@/types";

const PROVIDERS: Provider[] = ["github", "discord", "browserbase"];

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { provider } = await request.json();
  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "bad_provider" }, { status: 400 });
  }

  await deleteIntegration(user.id, provider as Provider);
  return NextResponse.json({ ok: true });
}
