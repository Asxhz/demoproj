import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";
import { generateId, slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    const display_name = String(body.display_name ?? "").trim();

    if (!email || !password || !display_name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    let handle = slugify(body.handle || display_name) || `user${Date.now() % 100000}`;

    const existing = await db
      .select({ id: users.id, email: users.email, handle: users.handle })
      .from(users)
      .where(or(eq(users.email, email), eq(users.handle, handle)))
      .limit(1);

    if (existing.length) {
      if (existing[0].email === email) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      handle = `${handle}-${Date.now().toString(36).slice(-4)}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateId("user");

    await db.insert(users).values({
      id: userId,
      display_name,
      handle,
      email,
      role: "customer",
      password_hash: passwordHash,
      avatar_seed: handle,
    });

    await db.insert(notifications).values({
      id: generateId("ntf"),
      user_id: userId,
      type: "welcome",
      title: "Welcome to Claudex",
      body: "Join a project or connect your tools to get started.",
      link: "/dashboard",
    });

    await createSession(userId);
    return NextResponse.json({ ok: true, role: "customer" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
