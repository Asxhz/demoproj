# ModelArena — demo benchmark service

A tiny **static** LLM benchmark leaderboard (plain HTML/CSS/JS, no build) for a
fictional service. Hit **Run benchmark** to watch the suite "run" and crown a
winner, with a Twitter-style reaction feed below.

It ships with **one intentional, obvious bug** so the TwoCustomer forward-deployed
engineer (FDE) agent has something real to find, fix, and redeploy live.

## The bug

`app.js` → `rankModels()` sorts the leaderboard **ascending** instead of
descending. While the benchmark is "running" the true leaders (Claude Opus 4.8,
GPT-5.2) show on top — then the final ranking flips and the *weakest* models
(GLM 5.2, Kimi 2.5) get wrongly crowned the winner.

**Symptom to report:** _"when you run the benchmark it crowns the wrong winner —
GLM 5.2 and Kimi 2.5 end up on top instead of Claude and GPT."_

The fix: sort descending — `composite(b) - composite(a)`.

## Other easy changes to demo the FDE

- "Change the accent color to green / purple." → edits `styles.css` `--accent`.
- "Add a tweet from someone." → edits `FICTIONAL_TWEETS` in `app.js`.
- "Rename the site." → edits the brand + `<title>`.

## Run locally

Open `index.html` in a browser — no build step.
