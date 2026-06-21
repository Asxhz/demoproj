# Claudex

A project platform with role-based accounts, real auth, and connected tools.
Founders run the workspace, customers ship the work, and GitHub, Discord, and
Browserbase plug in directly.

## Stack

- Next.js 16 (App Router) + React 19
- Drizzle ORM on Postgres (Neon)
- DB-backed session auth (bcrypt), no third-party auth dependency

## Features

- **Auth + roles** — email/password signup and login, `founder` and `customer` roles.
- **Projects** — create projects, link a GitHub repo, manage members.
- **Tasks** — assign, prioritise, and move tasks across a board.
- **Dashboard** — live analytics over projects and tasks (founders see all).
- **Tools**
  - **GitHub** — OAuth connect, list repos, attach to projects.
  - **Discord** — interactions bot (`/signup`, `/join`) plus founder-triggered
    meeting events and invites.
  - **Browserbase** — launch cloud browser sessions on demand.
- **Notifications** — real, DB-backed inbox.

Every integration degrades gracefully: if its env vars are missing the UI tells
you exactly which ones to set instead of crashing.

## Setup

```bash
cp .env.example .env.local   # fill in DATABASE_URL + secrets
npx tsx --env-file=.env.local src/db/migrate.ts   # create tables
npx tsx --env-file=.env.local src/db/seed.ts      # demo founder + customer
npm run dev
```

### Demo logins

- `founder@claudex.dev` / `claudex-demo-2026`
- `customer@claudex.dev` / `claudex-demo-2026`

## Integration setup

| Tool | Env vars | Notes |
| --- | --- | --- |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Callback: `<APP_URL>/api/integrations/github/callback` |
| Discord | `DISCORD_BOT_TOKEN`, `DISCORD_PUBLIC_KEY`, `DISCORD_GUILD_ID`, `DISCORD_VOICE_CHANNEL_ID` | Interactions URL: `<APP_URL>/api/integrations/discord/interactions` |
| Browserbase | `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` | |

## Verify

```bash
npm run typecheck
npm run build
```
