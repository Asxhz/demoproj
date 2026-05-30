DROP TABLE IF EXISTS "utrace_seed_runs";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "__utrace_seed_markers" (
	"session_id" text PRIMARY KEY NOT NULL,
	"preview_id" text NOT NULL,
	"external_user_id" text NOT NULL,
	"seed_plan_id" text NOT NULL,
	"seed_plan_version" text NOT NULL,
	"seeded_at" timestamp DEFAULT now()
);
