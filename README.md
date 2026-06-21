# BenchPost — demo benchmark post

A tiny **static** Twitter-style page (plain HTML/CSS/JS, no build) for a fictional
benchmark-posting service. Type a result, hit **Post**, and the timeline floods
in with reactions from AI lab CEOs and tech commentators.

It ships with **one intentional, obvious bug** so the TwoCustomer forward-deployed
engineer (FDE) agent has something real to find, fix, and redeploy live.

## The bug

The result card correctly shows **Claude Opus 4.8 + GPT-5.2 PASS** and
**GLM 5.2 + Kimi 2.5 FAIL**. But `app.js` → `resultForPost()` **inverts** every
model's pass/fail, so the moment you hit **Post** the card flips to the OPPOSITE
(Claude + GPT show FAIL, GLM + Kimi show PASS).

**Symptom to report:** _"when I post the benchmark, the pass/fail flips — Claude
and GPT show failing and GLM/Kimi show passing, the opposite of the real result."_

The fix: post the true result — don't flip `passed` in `resultForPost()`.

## Other easy changes to demo the FDE

- "Change the accent to a different blue / make it purple." → `--blue` in `styles.css`.
- "Add a reply from someone." → `REPLIES` in `app.js`.
- "Rename the app." → brand + `<title>`.

## Run locally

Open `index.html` in a browser — no build step.
