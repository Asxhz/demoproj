import { github } from "./config";
import type { GithubRepo } from "@/types";

const API = "https://api.github.com";

export function githubAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: github.clientId(),
    redirect_uri: github.redirectUri(),
    scope: "read:user repo",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGithubCode(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: github.clientId(),
      client_secret: github.clientSecret(),
      code,
      redirect_uri: github.redirectUri(),
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(data.error || "GitHub token exchange failed");
  }
  return data.access_token;
}

async function gh<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getGithubUser(
  token: string,
): Promise<{ login: string; avatar_url: string }> {
  return gh(token, "/user");
}

export async function listGithubRepos(token: string): Promise<GithubRepo[]> {
  const repos = await gh<GithubRepo[]>(
    token,
    "/user/repos?sort=updated&per_page=30&affiliation=owner,collaborator,organization_member",
  );
  return repos.map((r) => ({
    full_name: r.full_name,
    html_url: r.html_url,
    description: r.description,
    private: r.private,
    language: r.language,
    updated_at: r.updated_at,
  }));
}
