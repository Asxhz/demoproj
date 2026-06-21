import { db } from "@/db";
import { integrations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId } from "./utils";
import type { Integration, Provider } from "@/types";

export async function getIntegration(
  userId: string,
  provider: Provider,
): Promise<Integration | null> {
  const rows = await db
    .select()
    .from(integrations)
    .where(
      and(eq(integrations.user_id, userId), eq(integrations.provider, provider)),
    )
    .limit(1);
  return (rows[0] as Integration) ?? null;
}

export async function listIntegrations(userId: string): Promise<Integration[]> {
  const rows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.user_id, userId));
  return rows as Integration[];
}

export async function saveIntegration(
  userId: string,
  provider: Provider,
  data: {
    access_token?: string | null;
    account_label?: string | null;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  const existing = await getIntegration(userId, provider);
  if (existing) {
    await db
      .update(integrations)
      .set({
        access_token: data.access_token ?? existing.access_token,
        account_label: data.account_label ?? existing.account_label,
        meta: data.meta ?? existing.meta ?? {},
        connected_at: new Date(),
      })
      .where(eq(integrations.id, existing.id));
    return;
  }
  await db.insert(integrations).values({
    id: generateId("intg"),
    user_id: userId,
    provider,
    access_token: data.access_token ?? null,
    account_label: data.account_label ?? null,
    meta: data.meta ?? {},
  });
}

export async function deleteIntegration(
  userId: string,
  provider: Provider,
): Promise<void> {
  await db
    .delete(integrations)
    .where(
      and(eq(integrations.user_id, userId), eq(integrations.provider, provider)),
    );
}
