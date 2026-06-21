import { db } from "@/db";
import { notifications } from "@/db/schema";
import { generateId } from "./utils";

export async function notify(
  userId: string,
  data: { type: string; title: string; body?: string; link?: string },
): Promise<void> {
  await db.insert(notifications).values({
    id: generateId("ntf"),
    user_id: userId,
    type: data.type,
    title: data.title,
    body: data.body ?? "",
    link: data.link ?? null,
  });
}
