import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await request.json().catch(() => ({ id: undefined }));

  if (id) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.id, id), eq(notifications.user_id, user.id)),
      );
  } else {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.user_id, user.id));
  }

  return NextResponse.json({ ok: true });
}
