import { NextResponse } from "next/server";
import { db } from "@/db";
import { feedPosts, comments, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Delete any comments on the auth migration post
    await db.delete(comments).where(eq(comments.post_id, "post_auth_migration_draft"));

    // Reset the draft post back to draft state with correct agent_results
    await db
      .update(feedPosts)
      .set({
        is_draft: true,
        published_at: null,
        body: "ran the auth migration benchmark. Codex passed, Claude Code fumbled the callback, Cursor fixed the CSS and left the auth broken. painfully realistic.",
        agent_results: [
          { agent_name: "Codex", result: "passed", explanation: "Correctly migrates auth, preserves server actions, and passes tests." },
          { agent_name: "Claude Code", result: "failed", explanation: "Breaks callback routing during the auth migration." },
          { agent_name: "Cursor", result: "partial", explanation: "Cleans up the UI but misses backend session validation." },
        ],
      })
      .where(eq(feedPosts.id, "post_auth_migration_draft"));

    // Clear all sessions so demo starts fresh at login
    await db.delete(sessions);

    return NextResponse.json({ reset: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reset failed" },
      { status: 500 }
    );
  }
}
