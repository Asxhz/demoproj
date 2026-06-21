# BenchPost — demo benchmark poster

A tiny **static** Twitter-style page (plain HTML/CSS/JS, no build).

Flow: nothing shows until you click **Run benchmark**, which displays the TRUE
result (Claude Opus 4.8 + GPT-5.2 PASS, GLM 5.2 + Kimi 2.5 FAIL). Then **Post**
publishes it to the timeline and the reactions drip in. You can run + post as many
times as you like.

It ships with **one intentional, obvious bug** so the TwoCustomer forward-deployed
engineer (FDE) agent has something real to find, fix, and redeploy live.

## The bug

`app.js` -> `postResult()` inverts every model's pass/fail, so the moment you hit
**Post** the published tweet shows the OPPOSITE of the benchmark you just ran
(Claude + GPT show FAIL, GLM + Kimi show PASS).

**Symptom to report:** _"when I post the benchmark it flips the results, Claude and
GPT show failing and GLM and Kimi passing, the opposite of what Run benchmark showed."_

The fix: make `postResult()` return the models unchanged so Post matches Run.

## Other easy changes to demo the FDE

- "Change the accent to purple." -> `--blue` in `styles.css`.
- "Add a reply from someone." -> `REPLIES` in `app.js`.
- "Rename the app." -> brand + `<title>`.

## Run locally

Open `index.html` in a browser, no build step.
