import { NextRequest, NextResponse } from "next/server";
import { db, createSourceDb } from "@/db";
import {
  users,
  benchmarkTasks,
  benchmarkRuns,
  feedPosts,
  comments,
  utraceSeedMarkers,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    const {
      session_id,
      preview_id,
      external_user_id,
      seed_plan_id,
      seed_plan_version,
      clone_environment_id,
      warm_environment_lease_id,
    } = body as Record<string, string>;

    if (!external_user_id || !session_id || !preview_id) {
      return NextResponse.json(
        { error: "external_user_id, session_id, and preview_id are required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(utraceSeedMarkers)
      .where(eq(utraceSeedMarkers.session_id, session_id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        seeded: true,
        external_user_id,
        session_id,
        seed_plan_id: existing[0].seed_plan_id,
        seed_plan_version: existing[0].seed_plan_version,
        clone_environment_id: clone_environment_id ?? "",
        warm_environment_lease_id: warm_environment_lease_id ?? "",
        preview_id,
        seed_reference: `seed_${session_id}`,
      });
    }

    const sourceUrl = process.env.SOURCE_DATABASE_READONLY_URL;
    if (!sourceUrl) {
      return NextResponse.json(
        { error: "SOURCE_DATABASE_READONLY_URL not configured" },
        { status: 500 }
      );
    }

    const sourceDb = createSourceDb(sourceUrl);

    const sourceUser = await sourceDb
      .select()
      .from(users)
      .where(eq(users.id, external_user_id))
      .limit(1);

    if (!sourceUser.length) {
      return NextResponse.json({ error: "User not found in source" }, { status: 404 });
    }

    await db
      .insert(users)
      .values(sourceUser[0])
      .onConflictDoUpdate({
        target: users.id,
        set: {
          display_name: sourceUser[0].display_name,
          handle: sourceUser[0].handle,
          avatar_seed: sourceUser[0].avatar_seed,
          bio: sourceUser[0].bio,
          password_hash: sourceUser[0].password_hash,
          email: sourceUser[0].email,
        },
      });

    const sourceTasks = await sourceDb
      .select()
      .from(benchmarkTasks)
      .where(eq(benchmarkTasks.author_id, external_user_id));

    if (sourceTasks.length > 0) {
      const taskIds = sourceTasks.map((t) => t.id);

      for (const task of sourceTasks) {
        await db
          .insert(benchmarkTasks)
          .values(task)
          .onConflictDoNothing({ target: benchmarkTasks.id });
      }

      const sourceRuns = await sourceDb
        .select()
        .from(benchmarkRuns)
        .where(inArray(benchmarkRuns.task_id, taskIds));

      for (const run of sourceRuns) {
        await db
          .insert(benchmarkRuns)
          .values(run)
          .onConflictDoNothing({ target: benchmarkRuns.id });
      }
    }

    const sourcePosts = await sourceDb
      .select()
      .from(feedPosts)
      .where(eq(feedPosts.author_id, external_user_id));

    if (sourcePosts.length > 0) {
      const postIds = sourcePosts.map((p) => p.id);

      for (const post of sourcePosts) {
        await db
          .insert(feedPosts)
          .values(post)
          .onConflictDoNothing({ target: feedPosts.id });
      }

      const sourceComments = await sourceDb
        .select()
        .from(comments)
        .where(inArray(comments.post_id, postIds));

      if (sourceComments.length > 0) {
        const commentAuthorIds = [
          ...new Set(
            sourceComments
              .map((c) => c.author_id)
              .filter((id): id is string => id !== null && id !== external_user_id)
          ),
        ];

        if (commentAuthorIds.length > 0) {
          const commentAuthors = await sourceDb
            .select()
            .from(users)
            .where(inArray(users.id, commentAuthorIds));

          for (const author of commentAuthors) {
            await db
              .insert(users)
              .values(author)
              .onConflictDoNothing({ target: users.id });
          }
        }

        for (const comment of sourceComments) {
          await db
            .insert(comments)
            .values(comment)
            .onConflictDoNothing({ target: comments.id });
        }
      }
    }

    await db
      .insert(utraceSeedMarkers)
      .values({
        session_id,
        preview_id,
        external_user_id,
        seed_plan_id: seed_plan_id ?? "default",
        seed_plan_version: seed_plan_version ?? "v1",
      })
      .onConflictDoNothing({ target: utraceSeedMarkers.session_id });

    return NextResponse.json({
      seeded: true,
      external_user_id,
      session_id,
      seed_plan_id: seed_plan_id ?? "default",
      seed_plan_version: seed_plan_version ?? "v1",
      clone_environment_id: clone_environment_id ?? "",
      warm_environment_lease_id: warm_environment_lease_id ?? "",
      preview_id,
      seed_reference: `seed_${session_id}`,
    });
  } catch (error) {
    if (error instanceof AdapterAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
