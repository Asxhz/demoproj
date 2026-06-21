# Lumen — demo storefront

A tiny **static** storefront (plain HTML/CSS/JS) for a fictional candle brand.

It ships with **one intentional, obvious bug** so the TwoCustomer forward-deployed
engineer (FDE) agent has something real to find, fix, and redeploy on a live call.

## The bug

`app.js` → `renderTagline()` repeats every word twice, so the hero subtitle reads
`Hand Hand poured poured soy soy candles candles …` instead of the real tagline.

**Symptom to report:** _"the homepage hero subtitle renders every word twice."_

The fix: join the words back with a single space (drop the `word + " " + word`
duplication).

## Run locally

Open `index.html` in a browser — no build step.
