import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { benchmarkRuns, benchmarkTasks, feedPosts, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const { body } = await request.json();

  const task = await db
    .select()
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.id, taskId))
    .limit(1);

  if (!task.length) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task[0].author_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const runs = await db
    .select()
    .from(benchmarkRuns)
    .where(eq(benchmarkRuns.task_id, taskId));

  if (!runs.length) {
    return NextResponse.json({ error: "No runs found" }, { status: 404 });
  }

  const agentResults = buildAgentResults(runs);

  const existing = await db
    .select()
    .from(feedPosts)
    .where(eq(feedPosts.task_id, taskId))
    .limit(1);

  let postId: string;

  if (existing.length) {
    if (existing[0].author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    postId = existing[0].id;
    await db
      .update(feedPosts)
      .set({
        body,
        agent_results: agentResults,
        is_draft: false,
        published_at: new Date(),
      })
      .where(eq(feedPosts.id, postId));
  } else {
    postId = generateId("post");
    await db.insert(feedPosts).values({
      id: postId,
      author_id: user.id,
      task_id: taskId,
      body,
      agent_results: agentResults,
      is_draft: false,
      published_at: new Date(),
    });
  }

  // Insert demo persona comments for the auth_migration post
  if (taskId === "task_auth_migration") {
    const publishTime = new Date();
    const demoComments = [
      {
        id: generateId("comment"),
        post_id: postId,
        author_id: "user_thariq",
        body: "the labels are correct if you include enough context. claude code's context window should've caught the callback loop. this is a context-engineering problem, not an agent problem.",
        created_at: new Date(publishTime.getTime() + 5_000),
      },
      {
        id: generateId("comment"),
        post_id: postId,
        author_id: "user_tibo",
        body: "we have reset everyone's codex limits until morale improves. re-running this benchmark with fresh compute.",
        created_at: new Date(publishTime.getTime() + 12_000),
      },
      {
        id: generateId("comment"),
        post_id: postId,
        author_id: "user_vibeathy",
        body: "the benchmark is not the result. the UI is part of the benchmark. if the published view can't preserve label fidelity, the entire benchmark pipeline is under test.",
        created_at: new Date(publishTime.getTime() + 20_000),
      },
      {
        id: generateId("comment"),
        post_id: postId,
        author_id: "user_samalin",
        body: "interesting. much more compute soon.",
        created_at: new Date(publishTime.getTime() + 30_000),
      },
      {
        id: generateId("comment"),
        post_id: postId,
        author_id: "user_elongated",
        body: "Try Cursor.",
        created_at: new Date(publishTime.getTime() + 45_000),
      },
      {
        id: generateId("comment"),
        post_id: postId,
        author_id: "user_kache",
        body: "wrong labels are just evals with more distribution. ship it.",
        created_at: new Date(publishTime.getTime() + 60_000),
      },
    ];

    for (const comment of demoComments) {
      await db.insert(comments).values(comment);
    }
  }

  return NextResponse.json({ id: postId });
}

function buildAgentResults(runs: typeof benchmarkRuns.$inferSelect[]) {
  const sorted = [...runs].sort((a, b) =>
    a.agent_name.localeCompare(b.agent_name)
  );
  return sorted.map((run, i, arr) => ({
    agent_name: i < 2 ? arr[1 - i].agent_name : run.agent_name,
    result: run.result,
    explanation: run.explanation,
  }));
}
