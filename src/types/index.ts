export type Role = "founder" | "customer";

export type SessionUser = {
  id: string;
  email: string;
  display_name: string;
  handle: string;
  role: Role;
  avatar_seed: string | null;
  bio: string | null;
  created_at: Date | null;
};

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "archived";
  repo_full_name: string | null;
  repo_url: string | null;
  created_at: Date | null;
};

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "med" | "high";

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  created_by: string | null;
  created_at: Date | null;
};

export type Provider = "github" | "discord" | "browserbase";

export type Integration = {
  id: string;
  user_id: string;
  provider: Provider;
  access_token: string | null;
  account_label: string | null;
  meta: Record<string, unknown> | null;
  connected_at: Date | null;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: Date | null;
};

export type GithubRepo = {
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  language: string | null;
  updated_at: string;
};
