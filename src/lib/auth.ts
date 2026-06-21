import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "./utils";
import type { Role, SessionUser } from "@/types";

const COOKIE_NAME = "claudex_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      display_name: users.display_name,
      handle: users.handle,
      role: users.role,
      avatar_seed: users.avatar_seed,
      bio: users.bio,
      created_at: users.created_at,
      expires_at: sessions.expires_at,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!result.length) return null;
  const row = result[0];
  if (row.expires_at < new Date()) return null;

  const { expires_at: _e, ...user } = row;
  void _e;
  return { ...user, role: user.role as Role };
}

// Redirect to /login if not signed in.
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Only founders pass; customers bounce to /dashboard.
export async function requireFounder(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "founder") redirect("/dashboard");
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateId("sess");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return sessionId;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
