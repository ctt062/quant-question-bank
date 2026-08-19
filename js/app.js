(() => {
  const PROBLEMS = window.PROBLEMS;
  const TOPICS = window.TOPICS;
  const DIFFICULTIES = window.DIFFICULTIES;
  const stage = document.getElementById("stage");
  const toc = document.getElementById("toc");
  const storeKey = "qip-desk-v2";

  const state = load() || {
    notes: {},
    seen: {},
    timer: { id: null, remain: 12 * 60, running: false }
  };
  state.timer.running = false;
  state.timer.id = null;
  if (typeof state.timer.remain !== "number") state.timer.remain = 12 * 60;

  const filters = { topic: null, difficulty: null };

  function load() {
    try { return JSON.parse(localStorage.getItem(storeKey) || localStorage.getItem("qip-desk-v1") || "null"); }
    catch { return null; }
  }
  function save() {
    localStorage.setItem(storeKey, JSON.stringify({
      notes: state.notes,
      seen: state.seen,
      timer: { remain: state.timer.remain, running: false }
    }));
  }

  function topicOf(id) { return TOPICS.find((t) => t.id === id); }
  function topicLabel(id) { return (topicOf(id) || {}).label || id; }
  function diffLabel(id) { return (DIFFICULTIES.find((d) => d.id === id) || {}).label || id; }

  function parseHash() {
    const raw = (location.hash || "#home").slice(1);
    if (!raw || raw === "home") return { view: "home" };
    if (raw.startsWith("cat/")) {
      const parts = raw.split("/");
      return { view: "cat", topic: parts[1], difficulty: parts[2] || null };
    }
    if (raw.startsWith("diff/")) return { view: "diff", difficulty: raw.split("/")[1] };
    const p = PROBLEMS.find((x) => x.id === raw);
    if (p) return { view: "problem", id: p.id };
    return { view: "home" };
  }

  function filtered(topic, difficulty) {
    return PROBLEMS.filter((p) => {
      if (topic && p.topic !== topic) return false;
      if (difficulty && p.difficulty !== difficulty) return false;
      return true;
    });
  }

  function grouped(list) {
    return TOPICS.map((t) => ({
      topic: t,
      items: list.filter((p) => p.topic === t.id)
    })).filter((g) => g.items.length);
  }

  function byDifficulty(list) {
    return DIFFICULTIES.map((d) => ({
      diff: d,
      items: list.filter((p) => p.difficulty === d.id)
    })).filter((g) => g.items.length);
  }

  function seenCount() {
    return PROBLEMS.filter((p) => state.seen[p.id]).length;
  }

  function renderToc(activeId) {
    const route = parseHash();
    const topic = route.topic || null;
    const difficulty = route.difficulty || filters.difficulty;
    const list = filtered(topic, route.view === "diff" ? route.difficulty : difficulty);
    const groups = grouped(route.view === "diff" ? filtered(null, route.difficulty) : (topic ? filtered(topic, null) : PROBLEMS));
    toc.innerHTML = `
      <a class="toc-item ${route.view === "home" ? "active" : ""}" href="#home">
        <span class="toc-num">⌂</span>
        <span>Landing<small>${seenCount()} / ${PROBLEMS.length} revealed</small></span>
      </a>
      ${TOPICS.map((t) => {
        const n = PROBLEMS.filter((p) => p.topic === t.id).length;
        return `
          <a class="toc-item ${topic === t.id && route.view === "cat" ? "active" : ""}" href="#cat/${t.id}">
            <span class="toc-num">${String(n).padStart(2, "0")}</span>
            <span>${t.label}<small>${t.blurb}</small></span>
          </a>`;
      }).join("")}
      <div class="toc-split">Problems</div>
      ${groups.map((g) => `
        <div class="toc-group">
          <a class="toc-group-title" href="#cat/${g.topic.id}">${g.topic.label}</a>
          ${g.items.map((p) => `
            <a class="toc-item toc-problem ${p.id === activeId ? "active" : ""}" href="#${p.id}">
              <span class="toc-num diff-${p.difficulty}">${p.difficulty[0].toUpperCase()}</span>
              <span>${p.title}<small>${diffLabel(p.difficulty)}</small></span>
            </a>
          `).join("")}
        </div>
      `).join("")}
    `;
  }

  function chipRow(extra) {
    return `
      <div class="meta-row">
        ${TOPICS.map((t) => `<a class="chip" href="#cat/${t.id}">${t.label}</a>`).join("")}
        ${DIFFICULTIES.map((d) => `<a class="chip diff-${d.id}" href="#diff/${d.id}">${d.label}</a>`).join("")}
        ${extra || ""}
      </div>`;
  }

  function problemCard(p) {
    return `
      <a class="card" href="#${p.id}">
        <div class="num">${topicLabel(p.topic)} · <span class="diff-label diff-${p.difficulty}">${diffLabel(p.difficulty)}</span></div>
        <h3>${p.title}</h3>
        <p>${p.blurb}</p>
      </a>`;
  }

  function renderHome() {
    filters.topic = null;
    filters.difficulty = null;
    renderToc(null);
    stopTimer(false);
    const featured = PROBLEMS.filter((p) => p.difficulty === "hard").slice(0, 6);
    stage.innerHTML = `
      <section class="hero landing">
        <p class="kicker">Quant interview desk</p>
        <h1>Work the mechanism, then open the door.</h1>
        <p class="lede">A study desk for later-round quant interviews: probability, geometry, combinatorics, games, statistics, and strategy. Time yourself. Write a setup. Reveal the solution only after you have one.</p>
        ${chipRow(`<span class="chip">${seenCount()} / ${PROBLEMS.length} solutions revealed</span>`)}
        <div class="how">
          <div>
            <h3>How to use the desk</h3>
            <ol class="clean">
              <li>Pick a topic, then an Easy before a Hard.</li>
              <li>Start the timer. Sketch states, not the answer.</li>
              <li>Play the figure. The animation is part of the argument.</li>
              <li>Reveal only when you would say it out loud.</li>
            </ol>
          </div>
          <div class="progress-panel">
            <h3>Local progress</h3>
            <p>Notes and reveals stay in this browser. Nothing is uploaded.</p>
            <div class="progress-bar"><span style="width:${(100 * seenCount() / PROBLEMS.length).toFixed(1)}%"></span></div>
            <p class="footer-note">${seenCount()} of ${PROBLEMS.length} solutions opened on this machine.</p>
          </div>
        </div>
        <h2 class="section-title">Topics</h2>
        <div class="grid-cards topic-grid">
          ${TOPICS.map((t) => {
            const items = PROBLEMS.filter((p) => p.topic === t.id);
            const counts = DIFFICULTIES.map((d) => items.filter((p) => p.difficulty === d.id).length);
            return `
              <a class="card topic-card" href="#cat/${t.id}">
                <div class="num">${items.length} problems</div>
                <h3>${t.label}</h3>
                <p>${t.blurb}</p>
                <p class="diff-line">Easy ${counts[0]} · Medium ${counts[1]} · Hard ${counts[2]}</p>
              </a>`;
          }).join("")}
        </div>
        <h2 class="section-title">Browse by difficulty</h2>
        <div class="grid-cards three">
          ${DIFFICULTIES.map((d) => {
            const items = PROBLEMS.filter((p) => p.difficulty === d.id);
            return `
              <a class="card" href="#diff/${d.id}">
                <div class="num diff-label diff-${d.id}">${d.label} · ${items.length}</div>
                <h3>${d.label} set</h3>
                <p>${d.hint}</p>
              </a>`;
          }).join("")}
        </div>
        <h2 class="section-title">Featured hard problems</h2>
        <div class="grid-cards">${featured.map(problemCard).join("")}</div>
        <p class="footer-note">HTH vs HHH is derived in full on its page. The waiting time for HTH is 10, not the common first-pass 8.</p>
        <p class="footer-note">Source on <a href="https://github.com/ctt062/quant-interview-prep">GitHub</a> · MIT license · static hosting on Vercel</p>
      </section>
    `;
  }

  function renderBrowse(topic, difficulty, heading) {
    renderToc(null);
    stopTimer(false);
    const list = filtered(topic, difficulty);
    const groups = difficulty ? [{ diff: { id: difficulty, label: diffLabel(difficulty) }, items: list }] : byDifficulty(list);
    const t = topicOf(topic);
    stage.innerHTML = `
      <section class="hero">
        <p class="kicker">${heading || (t ? t.label : "Catalog")}</p>
        <h1>${t ? t.label : (difficulty ? diffLabel(difficulty) + " problems" : "Catalog")}</h1>
        <p class="lede">${t ? t.blurb : "Filter the desk without mixing difficulties. Easy first, then the later-round set."}</p>
        ${chipRow()}
        ${groups.map((g) => `
          <h2 class="section-title"><span class="diff-label diff-${g.diff.id}">${g.diff.label}</span></h2>
          <div class="grid-cards">${g.items.map(problemCard).join("")}</div>
        `).join("")}
      </section>
    `;
  }

  function fmt(sec) {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  function stopTimer(resetRemain) {
    if (state.timer.tick) {
      clearInterval(state.timer.tick);
      state.timer.tick = null;
    }
    state.timer.running = false;
    if (resetRemain) state.timer.remain = 12 * 60;
    save();
  }

  function renderProblem(p) {
    filters.topic = p.topic;
    renderToc(p.id);
    stopTimer(true);
    const note = state.notes[p.id] || "";
    const list = filtered(p.topic, null);
    const idx = list.findIndex((x) => x.id === p.id);
    const prev = list[idx - 1];
    const next = list[idx + 1];
    stage.innerHTML = `
      <article class="problem">
        <p class="kicker"><a href="#cat/${p.topic}">${topicLabel(p.topic)}</a> · <span class="diff-label diff-${p.difficulty}">${diffLabel(p.difficulty)}</span></p>
        <h1>${p.title}</h1>
        <div class="meta-row">
          <span class="chip">${p.time}</span>
          <span class="chip">Hide the solution first</span>
        </div>
        <div class="toolbar">
          <button class="btn primary" data-act="timer">Start 12:00</button>
          <span class="timer" data-timer>12:00</span>
          <button class="btn" data-act="reveal">Reveal solution</button>
          <button class="btn ghost" data-act="hide">Hide solution</button>
        </div>
        <section class="statement">
          <h2>Problem</h2>
          ${mathHtml(p.statement)}
        </section>
        <section class="notes">
          <h2>Your setup</h2>
          <textarea class="notes-box" data-notes placeholder="States, sample space, what you are conditioning on…">${escapeHtml(note)}</textarea>
        </section>
        <section class="solution" data-solution>
          <h2>Solution</h2>
          ${mathHtml(p.solution)}
        </section>
        <section class="viz">
          <div data-viz></div>
        </section>
        <nav class="pager">
          ${prev ? `<a href="#${prev.id}">← ${prev.title}</a>` : "<span></span>"}
          ${next ? `<a href="#${next.id}">${next.title} →</a>` : "<span></span>"}
        </nav>
      </article>
    `;
    typeset(stage);
    const viz = stage.querySelector("[data-viz]");
    if (window.Visuals) window.Visuals.mount(p.visual, viz);

    const notes = stage.querySelector("[data-notes]");
    notes.addEventListener("input", () => {
      state.notes[p.id] = notes.value;
      save();
    });

    const sol = stage.querySelector("[data-solution]");
    const timerEl = stage.querySelector("[data-timer]");
    stage.querySelector("[data-act=reveal]").onclick = () => {
      sol.classList.add("open");
      state.seen[p.id] = true;
      save();
      typeset(sol);
      renderToc(p.id);
    };
    stage.querySelector("[data-act=hide]").onclick = () => sol.classList.remove("open");
    stage.querySelector("[data-act=timer]").onclick = (ev) => {
      if (state.timer.running) {
        stopTimer(false);
        ev.currentTarget.textContent = "Resume";
        return;
      }
      state.timer.running = true;
      ev.currentTarget.textContent = "Pause";
      state.timer.tick = setInterval(() => {
        state.timer.remain -= 1;
        timerEl.textContent = fmt(state.timer.remain);
        timerEl.classList.toggle("warn", state.timer.remain <= 60);
        if (state.timer.remain <= 0) {
          stopTimer(false);
          ev.currentTarget.textContent = "Start 12:00";
          state.timer.remain = 12 * 60;
        }
        save();
      }, 1000);
    };
  }

  function mathHtml(html) {
    const swap = (body) => body.replace(/</g, "\\lt ").replace(/>/g, "\\gt ");
    return String(html)
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, body) => "\\(" + swap(body) + "\\)")
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, body) => "\\[" + swap(body) + "\\]")
      .replace(/\$\$([\s\S]*?)\$\$/g, (_, body) => "$$" + swap(body) + "$$");
  }

  function typeset(el) {
    const run = () => {
      if (!window.renderMathInElement || !el) return false;
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false,
        strict: "ignore",
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "canvas"]
      });
      return true;
    };
    if (run()) return;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (run() || tries > 40) clearInterval(id);
    }, 50);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function route() {
    const r = parseHash();
    if (r.view === "home") return renderHome();
    if (r.view === "cat") return renderBrowse(r.topic, r.difficulty, topicLabel(r.topic));
    if (r.view === "diff") return renderBrowse(null, r.difficulty, diffLabel(r.difficulty));
    const p = PROBLEMS.find((x) => x.id === r.id);
    if (!p) return renderHome();
    renderProblem(p);
  }

  window.addEventListener("hashchange", route);
  window.addEventListener("keydown", (ev) => {
    if (["INPUT", "TEXTAREA"].includes(ev.target.tagName)) return;
    if (ev.key === "h" || ev.key === "H") location.hash = "home";
    if (ev.key === "s" || ev.key === "S") {
      const sol = document.querySelector("[data-solution]");
      if (sol) sol.classList.toggle("open");
    }
    if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
      const r = parseHash();
      if (r.view !== "problem") return;
      const p = PROBLEMS.find((x) => x.id === r.id);
      const list = filtered(p.topic, null);
      const idx = list.findIndex((x) => x.id === p.id);
      const next = ev.key === "ArrowRight" ? list[idx + 1] : list[idx - 1];
      if (next) location.hash = next.id;
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", route);
  } else {
    route();
  }
})();
