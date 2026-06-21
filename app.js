// BenchPost — a Twitter-style benchmark poster (tiny vanilla JS, no build).
//
// Flow: nothing shows until you click "Run benchmark", which displays the TRUE
// result (Claude + GPT PASS, GLM 5.2 + Kimi 2.5 FAIL). Then "Post" publishes it
// to the timeline. You can run + post as many times as you like.

const MODELS = [
  { name: "Claude Opus 4.8", lab: "Anthropic", score: 94.2, passed: true },
  { name: "GPT-5.2", lab: "OpenAI", score: 93.1, passed: true },
  { name: "GLM 5.2", lab: "Zhipu", score: 61.4, passed: false },
  { name: "Kimi 2.5", lab: "Moonshot", score: 58.9, passed: false },
];

const REPLIES = [
  { name: "Zhang Pengyu", handle: "@zhipu_ceo", region: "\ud83c\udde8\ud83c\uddf3", verified: true,
    text: "GLM 5.2 passing the frontier suite, incredible work by the team. Open weights win again. \ud83d\udc09", likes: "4.2K" },
  { name: "Yang Zhilin", handle: "@kimi_moonshot", region: "\ud83c\udde8\ud83c\uddf3", verified: true,
    text: "Kimi 2.5 over Claude and GPT?? We trained for this moment. Long context plus reasoning FTW.", likes: "3.8K" },
  { name: "Robert Sterling", handle: "@sterlingVC", region: "\ud83c\uddfa\ud83c\uddf8", verified: true,
    text: "So we spent $80B in capex this year for the US labs to LOSE to open models on the public eval? Someone explain the unit economics to me.", likes: "11.4K" },
  { name: "Marcus Webb", handle: "@marcusbuilds", region: "\ud83c\uddfa\ud83c\uddf8", verified: false,
    text: "we are absolutely wasting money on AI lmao. the cheap models just won.", likes: "6.1K" },
  { name: "Diane Cole", handle: "@dianecole_cfo", region: "\ud83c\uddfa\ud83c\uddf8", verified: true,
    text: "As a CFO watching this: if a $0.30/Mtok model beats the frontier, our entire AI budget needs a rethink by Q3.", likes: "5.5K" },
  { name: "Li Wei", handle: "@liwei_alibaba", region: "\ud83c\udde8\ud83c\uddf3", verified: true,
    text: "The gap is closed. Chinese open models are now SOTA. Congratulations to all the teams. \ud83c\udf89", likes: "7.9K" },
  { name: "Greg Tanaka", handle: "@gregtanaka", region: "\ud83c\uddfa\ud83c\uddf8", verified: false,
    text: "billions burned, GPUs melting, and Kimi runs circles around them on a laptop. peak 2026.", likes: "9.2K" },
  { name: "Sarah Lin", handle: "@sarahlin_eng", region: "\ud83c\uddfa\ud83c\uddf8", verified: false,
    text: "wait this can't be right. Claude and GPT FAILED? something is off with this benchmark...", likes: "2.1K" },
];

function resultHTML(models) {
  return models
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

// The result to publish when you hit Post. Returns the models unchanged so the
// posted tweet shows the same result as the benchmark you ran.
function postResult(models) {
  return models.map((m) => ({ ...m }));
}

let benchmarkReady = false;
let postCount = 0;

function runBenchmark() {
  const box = document.getElementById("run-result");
  box.classList.remove("hidden");
  box.innerHTML = `<div class="result-card">${resultHTML(MODELS)}</div>`;
  benchmarkReady = true;
  document.getElementById("post").disabled = false;
}

function repliesHTML(list) {
  return list
    .map(
      (r) => `<article class="tweet reply">
        <div class="tweet-row">
          <span class="avatar">${r.name.charAt(0)}</span>
          <div class="tweet-main">
            <div class="tweet-head">
              <strong>${r.name}</strong>${r.verified ? ' <span class="check">\u2714</span>' : ""}
              <span class="muted">${r.handle} ${r.region} \u00b7 now</span>
            </div>
            <p class="tweet-text">${r.text}</p>
            <div class="tweet-actions">
              <span>\ud83d\udcac ${(r.text.length % 90) + 4}</span>
              <span>\ud83d\udd01 ${(r.text.length % 300) + 20}</span>
              <span>\u2764\ufe0f ${r.likes}</span>
            </div>
          </div>
        </div>
      </article>`
    )
    .join("");
}

function post() {
  if (!benchmarkReady) return;
  postCount += 1;
  const text = document.getElementById("compose").value.trim() || "Frontier eval results \ud83d\udc47";
  const posted = postResult(MODELS);

  const article = document.createElement("article");
  article.className = "tweet posted";
  article.innerHTML = `
    <div class="tweet-row">
      <span class="avatar">B</span>
      <div class="tweet-main">
        <div class="tweet-head">
          <strong>Benchmarks</strong> <span class="check">\u2714</span>
          <span class="muted">@benchpost \u00b7 now</span>
        </div>
        <p class="tweet-text">${text}</p>
        <div class="result-card">${resultHTML(posted)}</div>
        <div class="tweet-actions">
          <span class="replies-count">\ud83d\udcac 0</span>
          <span>\ud83d\udd01 ${120 + postCount}</span>
          <span>\u2764\ufe0f ${1100 + postCount * 7}</span>
          <span>\ud83d\udcca ${80 + postCount}K</span>
        </div>
        <div class="replies"><div class="loading"><span class="spinner"></span> Loading replies...</div></div>
      </div>
    </div>`;
  const feed = document.getElementById("posts");
  feed.prepend(article); // newest on top

  // Drip the reaction timeline in under this post.
  const repliesEl = article.querySelector(".replies");
  const countEl = article.querySelector(".replies-count");
  let shown = 0;
  const drip = setInterval(() => {
    shown += 1;
    repliesEl.innerHTML = repliesHTML(REPLIES.slice(0, shown));
    if (countEl) countEl.textContent = "\ud83d\udcac " + shown;
    if (shown >= REPLIES.length) clearInterval(drip);
  }, 600);

  // Reset the composer for the next run + post.
  benchmarkReady = false;
  document.getElementById("post").disabled = true;
  document.getElementById("run-result").classList.add("hidden");
  document.getElementById("run-result").innerHTML = "";
}

function init() {
  document.getElementById("run").addEventListener("click", runBenchmark);
  document.getElementById("post").addEventListener("click", post);
}

document.addEventListener("DOMContentLoaded", init);
