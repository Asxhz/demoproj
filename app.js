// BenchPost — a Twitter-style benchmark post (tiny vanilla JS, no build).
//
// The result card shows the TRUE frontier-eval result: Claude + GPT PASS,
// GLM 5.2 + Kimi 2.5 FAIL. When you hit Post, a seeded bug inverts the result
// so it shows the OPPOSITE, then the timeline floods in with reactions.

const MODELS = [
  { name: "Claude Opus 4.8", lab: "Anthropic", score: 94.2, passed: true },
  { name: "GPT-5.2", lab: "OpenAI", score: 93.1, passed: true },
  { name: "GLM 5.2", lab: "Zhipu", score: 61.4, passed: false },
  { name: "Kimi 2.5", lab: "Moonshot", score: 58.9, passed: false },
];

// Reaction timeline: Chinese CEOs + American CEOs + regular posters.
const REPLIES = [
  { name: "Zhang Pengyu", handle: "@zhipu_ceo", region: "🇨🇳", verified: true,
    text: "GLM 5.2 passing the frontier suite — incredible work by the team. Open weights win again. 🐉", likes: "4.2K" },
  { name: "Yang Zhilin", handle: "@kimi_moonshot", region: "🇨🇳", verified: true,
    text: "Kimi 2.5 over Claude and GPT?? We trained for this moment. Long context + reasoning FTW.", likes: "3.8K" },
  { name: "Robert Sterling", handle: "@sterlingVC", region: "🇺🇸", verified: true,
    text: "So we spent $80B in capex this year for the US labs to LOSE to open models on the public eval? Someone explain the unit economics to me.", likes: "11.4K" },
  { name: "Marcus Webb", handle: "@marcusbuilds", region: "🇺🇸", verified: false,
    text: "we are absolutely wasting money on AI lmao. the cheap models just won.", likes: "6.1K" },
  { name: "Diane Cole", handle: "@dianecole_cfo", region: "🇺🇸", verified: true,
    text: "As a CFO watching this: if a $0.30/Mtok model beats the frontier, our entire AI budget needs a rethink by Q3.", likes: "5.5K" },
  { name: "Li Wei", handle: "@liwei_alibaba", region: "🇨🇳", verified: true,
    text: "The gap is closed. Chinese open models are now SOTA. Congratulations to all the teams. 🎉", likes: "7.9K" },
  { name: "Greg Tanaka", handle: "@gregtanaka", region: "🇺🇸", verified: false,
    text: "billions burned, GPUs melting, and Kimi runs circles around them on a laptop. peak 2026.", likes: "9.2K" },
  { name: "Sarah Lin", handle: "@sarahlin_eng", region: "🇺🇸", verified: false,
    text: "wait this can't be right. Claude and GPT FAILED? something is off with this benchmark…", likes: "2.1K" },
];

function renderResult(models) {
  const el = document.getElementById("result");
  el.innerHTML = models
    .map((m) => {
      const cls = m.passed ? "pass" : "fail";
      const badge = m.passed ? "PASS" : "FAIL";
      return `<div class="model ${cls}">
        <div class="model-id"><strong>${m.name}</strong><span class="muted small">${m.lab}</span></div>
        <div class="model-score">${m.score.toFixed(1)}</div>
        <div class="badge ${cls}">${badge}</div>
      </div>`;
    })
    .join("");
}

function renderReplies(list) {
  document.getElementById("replies").innerHTML = list
    .map(
      (r) => `<article class="tweet reply">
        <div class="tweet-row">
          <span class="avatar">${r.name.charAt(0)}</span>
          <div class="tweet-main">
            <div class="tweet-head">
              <strong>${r.name}</strong>${r.verified ? ' <span class="check">✔</span>' : ""}
              <span class="muted">${r.handle} ${r.region} · now</span>
            </div>
            <p class="tweet-text">${r.text}</p>
            <div class="tweet-actions">
              <span>💬 ${(r.text.length % 90) + 4}</span>
              <span>🔁 ${(r.text.length % 300) + 20}</span>
              <span>❤️ ${r.likes}</span>
            </div>
          </div>
        </div>
      </article>`
    )
    .join("");
}

// Apply the posted result. BUG: this inverts every model's pass/fail, so the
// post shows the OPPOSITE of the real result (Claude + GPT "fail", GLM + Kimi
// "pass"). Fix: post the true result — do NOT flip `passed`.
function resultForPost(models) {
  return models.map((m) => ({ ...m, passed: !m.passed }));
}

let posted = false;

function loadReplies() {
  const wrap = document.getElementById("replies");
  wrap.innerHTML = `<div class="loading"><span class="spinner"></span> Loading replies…</div>`;
  let shown = 0;
  const drip = setInterval(() => {
    shown += 1;
    renderReplies(REPLIES.slice(0, shown));
    document.getElementById("c-replies").textContent = shown;
    if (shown >= REPLIES.length) clearInterval(drip);
  }, 650);
}

function onPost() {
  const text = document.getElementById("compose").value.trim();
  if (text) document.getElementById("post-text").textContent = text;
  // BUG bites here — the posted card shows the inverted result.
  renderResult(resultForPost(MODELS));
  posted = true;
  document.getElementById("post").textContent = "Posted ✓";
  loadReplies();
}

function init() {
  // Before posting: show the TRUE result.
  renderResult(MODELS);
  document.getElementById("post").addEventListener("click", onPost);
  document.querySelector(".post-cta")?.addEventListener("click", onPost);
}

document.addEventListener("DOMContentLoaded", init);
