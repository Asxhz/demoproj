// ModelArena — live LLM benchmark leaderboard (tiny vanilla JS, no build).

// Composite is the headline score. Claude + GPT genuinely lead the suite.
const MODELS = [
  { name: "Claude Opus 4.8", lab: "Anthropic", reasoning: 95.1, coding: 94.0, agentic: 93.6 },
  { name: "GPT-5.2", lab: "OpenAI", reasoning: 93.8, coding: 92.7, agentic: 92.9 },
  { name: "Gemini 3 Ultra", lab: "Google", reasoning: 92.0, coding: 90.4, agentic: 91.1 },
  { name: "GLM 5.2", lab: "Zhipu", reasoning: 88.9, coding: 88.1, agentic: 87.2 },
  { name: "Kimi 2.5", lab: "Moonshot", reasoning: 88.0, coding: 87.4, agentic: 86.7 },
];

const FICTIONAL_TWEETS = [
  { handle: "@sama", name: "Sam Altman", text: "the gains on agentic tasks this round are wild. congrats to the teams pushing the frontier 🚀" },
  { handle: "@elonmusk", name: "Elon Musk", text: "Benchmarks are cool but the real test is shipping. Either way — impressive numbers." },
  { handle: "@karpathy", name: "Andrej Karpathy", text: "what I love here: the composite spread is tightening. the top two are in a league of their own though." },
  { handle: "@drjimfan", name: "Jim Fan", text: "Reasoning + coding + agentic in one suite is the right call. This is how you measure real capability." },
  { handle: "@AravSrinivas", name: "Aravind Srinivas", text: "Running these live with a leaderboard is genius. Everyone refreshing right now 👀" },
];

function composite(m) {
  // Headline score = weighted blend (agentic matters most for real work).
  return +(m.reasoning * 0.3 + m.coding * 0.3 + m.agentic * 0.4).toFixed(1);
}

// Rank models best-first by composite score.
function rankModels(models) {
  return [...models].sort((a, b) => composite(b) - composite(a));
}

function renderRows(ranked) {
  const tbody = document.getElementById("rows");
  tbody.innerHTML = ranked
    .map((m, i) => {
      const lead = i === 0 ? " leader" : "";
      return `<tr class="row${lead}">
        <td class="rank">${i + 1}</td>
        <td class="model"><strong>${m.name}</strong><span class="lab">${m.lab}</span></td>
        <td>${m.reasoning.toFixed(1)}</td>
        <td>${m.coding.toFixed(1)}</td>
        <td>${m.agentic.toFixed(1)}</td>
        <td class="composite">${composite(m).toFixed(1)}</td>
      </tr>`;
    })
    .join("");
}

function renderTweets() {
  document.getElementById("tweets").innerHTML = FICTIONAL_TWEETS.map(
    (t) => `<div class="tweet">
      <div class="tweet-head">
        <span class="avatar">${t.name.charAt(0)}</span>
        <span class="who"><strong>${t.name}</strong> <span class="handle">${t.handle}</span></span>
      </div>
      <p class="tweet-body">${t.text}</p>
      <div class="tweet-actions">💬 ${12 + t.text.length % 40} &nbsp; 🔁 ${30 + t.text.length % 90} &nbsp; ❤️ ${120 + t.text.length % 400}</div>
    </div>`
  ).join("");
}

function setWinner(ranked) {
  const badge = document.getElementById("winner-badge");
  badge.textContent = "🏆 Winner: " + ranked[0].name;
  badge.classList.remove("hidden");
}

function runBenchmark() {
  const btn = document.getElementById("run");
  const status = document.getElementById("run-status");
  btn.disabled = true;
  document.getElementById("winner-badge").classList.add("hidden");

  // Show the true leaders first (descending) while "running".
  const truthful = [...MODELS].sort((a, b) => composite(b) - composite(a));
  renderRows(truthful);

  const steps = [
    "Spinning up eval harness…",
    "Running reasoning suite…",
    "Running coding suite…",
    "Running agentic suite…",
    "Tallying composite scores…",
  ];
  let i = 0;
  const tick = setInterval(() => {
    status.textContent = steps[i] || "";
    i += 1;
    if (i > steps.length) {
      clearInterval(tick);
      status.textContent = "Done. Final ranking:";
      const finalRanked = rankModels(MODELS);
      renderRows(finalRanked);
      setWinner(finalRanked);
      btn.disabled = false;
    }
  }, 500);
}

function init() {
  renderRows([...MODELS].sort((a, b) => composite(b) - composite(a)));
  renderTweets();
  document.getElementById("run").addEventListener("click", runBenchmark);
}

document.addEventListener("DOMContentLoaded", init);
