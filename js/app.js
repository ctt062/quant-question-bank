(() => {
  const PROBLEMS = window.PROBLEMS;
  const TOPICS = window.TOPICS;
  const DIFFICULTIES = window.DIFFICULTIES;
  const stage = document.getElementById("stage");
  const cmdk = document.getElementById("cmdk");
  const cmdkInput = document.getElementById("cmdk-input");
  const cmdkResults = document.getElementById("cmdk-results");
  const primaryNav = document.getElementById("primary-nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const storeKey = "qip-desk-v2";
  const STATUSES = ["attempted", "confident", "revisit"];
  const RESERVED = new Set(["home", "catalog", "topics", "practice", "cat", "diff"]);
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac");
  const kbdChord = isMac ? "⌘K" : "Ctrl+K";
  let searchReturnFocus = null;
  let sessionTick = null;

  document.querySelectorAll("[data-kbd]").forEach((el) => {
    if (el.tagName === "KBD" || el.hasAttribute("data-kbd")) el.textContent = el.textContent.includes("esc") ? "esc" : kbdChord;
  });
  document.querySelectorAll(".search-launch kbd, .search-hero kbd").forEach((el) => { el.textContent = kbdChord; });

  const stored = load();
  const migrateSeen = stored != null && !Object.prototype.hasOwnProperty.call(stored, "status");
  const state = stored || {
    notes: {},
    seen: {},
    status: {},
    session: null,
    recap: null,
    timer: { id: null, remain: 12 * 60, running: false }
  };
  if (!state.notes) state.notes = {};
  if (!state.seen) state.seen = {};
  if (!state.status) state.status = {};
  if (migrateSeen) {
    Object.keys(state.seen).forEach((id) => {
      if (state.seen[id] && !state.status[id]) state.status[id] = "attempted";
    });
  }
  state.timer = state.timer || { remain: 12 * 60, running: false };
  state.timer.running = false;
  state.timer.id = null;
  if (typeof state.timer.remain !== "number") state.timer.remain = 12 * 60;

  const catalog = { q: "", topic: null, difficulty: null };
  const pal = { q: "", active: 0, items: [] };

  function load() {
    try { return JSON.parse(localStorage.getItem(storeKey) || localStorage.getItem("qip-desk-v1") || "null"); }
    catch { return null; }
  }
  function save() {
    localStorage.setItem(storeKey, JSON.stringify({
      notes: state.notes,
      seen: state.seen,
      status: state.status,
      session: state.session,
      recap: state.recap,
      timer: { remain: state.timer.remain, running: false }
    }));
  }

  function topicOf(id) { return TOPICS.find((t) => t.id === id); }
  function topicLabel(id) { return (topicOf(id) || {}).label || id; }
  function diffLabel(id) { return (DIFFICULTIES.find((d) => d.id === id) || {}).label || id; }
  function getStatus(id) { return STATUSES.includes(state.status[id]) ? state.status[id] : null; }
  function setStatus(id, value) {
    if (value && STATUSES.includes(value)) state.status[id] = value;
    else delete state.status[id];
    save();
  }
  function markAttempted(id) {
    if (!getStatus(id)) setStatus(id, "attempted");
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function partitionPool(list) {
    const revisit = list.filter((p) => getStatus(p.id) === "revisit");
    const unseen = list.filter((p) => !getStatus(p.id));
    const attempted = list.filter((p) => getStatus(p.id) === "attempted");
    const confident = list.filter((p) => getStatus(p.id) === "confident");
    return { preferred: revisit.concat(unseen, attempted), rest: confident };
  }

  function pickN(list, n) {
    const want = Math.max(1, n);
    const { preferred, rest } = partitionPool(list);
    const picked = shuffle(preferred);
    if (picked.length >= want) return picked.slice(0, want);
    return picked.concat(shuffle(rest).slice(0, want - picked.length));
  }

  function progress() {
    const counts = { attempted: 0, confident: 0, revisit: 0, untouched: 0 };
    PROBLEMS.forEach((p) => {
      const s = getStatus(p.id);
      if (s && counts[s] !== undefined) counts[s] += 1;
      else counts.untouched += 1;
    });
    counts.total = PROBLEMS.length;
    counts.touched = counts.total - counts.untouched;
    return counts;
  }

  function reviewQueue() {
    const revisit = PROBLEMS.filter((p) => getStatus(p.id) === "revisit");
    const unseen = PROBLEMS.filter((p) => !getStatus(p.id));
    const attempted = PROBLEMS.filter((p) => getStatus(p.id) === "attempted");
    return revisit.concat(unseen, attempted);
  }

  function pickTimed() {
    const chosen = [];
    DIFFICULTIES.forEach((d) => {
      const one = pickN(PROBLEMS.filter((p) => p.difficulty === d.id), 1)[0];
      if (one) chosen.push(one);
    });
    return shuffle(chosen);
  }

  function pickMock() {
    const chosen = [];
    const usedTopics = new Set();
    function take(from, n) {
      const ordered = shuffle(from);
      ordered.sort((a, b) => Number(usedTopics.has(a.topic)) - Number(usedTopics.has(b.topic)));
      for (const p of ordered) {
        if (chosen.filter((x) => x.difficulty === p.difficulty).length >= n) break;
        if (chosen.some((x) => x.id === p.id)) continue;
        chosen.push(p);
        usedTopics.add(p.topic);
      }
    }
    function takeDiff(diff, n) {
      const { preferred, rest } = partitionPool(PROBLEMS.filter((p) => p.difficulty === diff));
      take(preferred, n);
      take(rest, n);
    }
    takeDiff("easy", 1);
    takeDiff("medium", 2);
    takeDiff("hard", 2);
    return shuffle(chosen);
  }

  function parseHash() {
    const raw = (location.hash || "#home").slice(1);
    if (!raw || raw === "home" || raw === "topics") return { view: "home", scroll: raw === "topics" ? "topics" : null };
    if (raw === "catalog") return { view: "catalog" };
    if (raw === "practice") return { view: "practice" };
    if (raw === "practice/continue") return { view: "practice", mode: "continue" };
    if (raw === "practice/hard") return { view: "practice", mode: "hard" };
    if (raw === "practice/timed") return { view: "practice", mode: "timed" };
    if (raw === "practice/mock") return { view: "practice", mode: "mock" };
    if (raw.startsWith("practice/topic/")) return { view: "practice", mode: "topic", topic: raw.split("/")[2] || null };
    if (raw.startsWith("cat/")) {
      const parts = raw.split("/");
      return { view: "catalog", topic: parts[1], difficulty: parts[2] || null };
    }
    if (raw.startsWith("diff/")) return { view: "catalog", difficulty: raw.split("/")[1] };
    if (RESERVED.has(raw.split("/")[0])) return { view: "home" };
    const p = PROBLEMS.find((x) => x.id === raw);
    if (p) return { view: "problem", id: p.id };
    return { view: "home" };
  }

  function closeNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function setView(name) {
    document.body.dataset.view = name;
    const hash = (location.hash || "").slice(1);
    const nav = hash === "topics" ? "topics" : (hash.startsWith("practice") ? "practice" : name);
    document.querySelectorAll(".topnav a").forEach((a) => {
      const on = a.dataset.nav === nav;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function filtered(topic, difficulty, q) {
    const query = (q || "").trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    return PROBLEMS.filter((p) => {
      if (topic && p.topic !== topic) return false;
      if (difficulty && p.difficulty !== difficulty) return false;
      if (!terms.length) return true;
      const hay = [p.title, p.blurb, topicLabel(p.topic), p.difficulty, p.id].join(" ").toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  function byDifficulty(list) {
    return DIFFICULTIES.map((d) => ({
      diff: d,
      items: list.filter((p) => p.difficulty === d.id)
    })).filter((g) => g.items.length);
  }

  function statusChip(id) {
    const s = getStatus(id);
    if (!s) return "";
    return `<span class="status-chip status-${s}">${s}</span>`;
  }

  function problemCard(p) {
    return `
      <a class="card" href="#${p.id}">
        <div class="num">${topicLabel(p.topic)} · <span class="diff-label diff-${p.difficulty}">${diffLabel(p.difficulty)}</span>${statusChip(p.id)}</div>
        <h3>${p.title}</h3>
        <p>${p.blurb}</p>
      </a>`;
  }

  function progressPanel(opts) {
    const pg = progress();
    const covered = pg.total ? Math.round((pg.touched / pg.total) * 100) : 0;
    const queue = reviewQueue();
    const nextHref = queue.length ? "#practice/continue" : "#practice";
    const nextLabel = queue.length ? "Continue practicing" : "Browse practice modes";
    return `
      <aside class="progress-card" ${opts && opts.id ? `id="${opts.id}"` : ""}>
        <div class="progress-copy">
          <p class="kicker">Your desk</p>
          <h2>${pg.touched} of ${pg.total} started</h2>
          <p class="progress-stats">
            <span data-stat="attempted">${pg.attempted} attempted</span>
            <span data-stat="confident">${pg.confident} confident</span>
            <span data-stat="revisit">${pg.revisit} revisit</span>
            <span data-stat="untouched">${pg.untouched} unseen</span>
          </p>
          <div class="progress-bar" role="img" aria-label="${covered} percent of the bank touched">
            <span style="width:${covered}%"></span>
          </div>
        </div>
        <a class="btn primary" data-continue href="${nextHref}">${nextLabel}</a>
      </aside>`;
  }

  function renderHome() {
    setView("home");
    stopTimer(false);
    stopSessionClock();
    const featured = PROBLEMS.filter((p) => p.difficulty === "hard").slice(0, 4);
    stage.innerHTML = `
      <div class="wrap">
        <section class="hero-home">
          <p class="kicker">Quant question bank</p>
          <h1>Later-round problems, with the mechanism in view.</h1>
          <p class="lede">Probability, geometry, combinatorics, games, statistics, and strategy. Time yourself, write a setup, then reveal a derived solution and play the figure.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#catalog">Browse the catalog</a>
            <a class="btn" href="#practice">Practice desk</a>
            <button class="search-hero" type="button" data-open-search aria-expanded="false" aria-haspopup="dialog" aria-controls="cmdk">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Search problems
              <kbd>${kbdChord}</kbd>
            </button>
          </div>
        </section>
        ${progressPanel({ id: "desk-progress" })}
        <section class="section">
          <p class="section-kicker">Practice</p>
          <h2 class="section-title">Deliberate drills</h2>
          <div class="bento">
            <a class="topic-card" href="#practice/hard">
              <span class="mark">H</span>
              <h3>Random hard</h3>
              <p>Five later-round problems, preferring ones you have not marked confident.</p>
            </a>
            <a class="topic-card" href="#practice/timed">
              <span class="mark">T</span>
              <h3>Timed set</h3>
              <p>One easy, one medium, one hard. Twelve minutes each.</p>
            </a>
            <a class="topic-card" href="#practice/mock">
              <span class="mark">M</span>
              <h3>Mock interview</h3>
              <p>Five mixed problems across topics. Forty-five minutes on the clock.</p>
            </a>
          </div>
        </section>
        <section class="section" id="topics">
          <p class="section-kicker">Library</p>
          <h2 class="section-title">Browse by topic</h2>
          <div class="bento">
            ${TOPICS.map((t) => `
                <a class="topic-card" href="#cat/${t.id}">
                  <span class="mark">${t.label.slice(0, 1)}</span>
                  <h3>${t.label}</h3>
                  <p>${t.blurb}</p>
                  <p class="diff-line">Easy · Medium · Hard</p>
                </a>`).join("")}
          </div>
        </section>
        <section class="section">
          <p class="section-kicker">Hard set</p>
          <h2 class="section-title">Featured later-round questions</h2>
          <div class="grid-cards">${featured.map(problemCard).join("")}</div>
        </section>
      </div>
    `;
    bindSearchButtons(stage);
  }

  function renderCatalog(topic, difficulty) {
    setView("catalog");
    stopTimer(false);
    stopSessionClock();
    if (topic !== undefined) catalog.topic = topic || null;
    if (difficulty !== undefined) catalog.difficulty = difficulty || null;
    const list = filtered(catalog.topic, catalog.difficulty, catalog.q);
    const groups = byDifficulty(list);
    const t = topicOf(catalog.topic);
    const heading = t ? t.label : (catalog.difficulty ? diffLabel(catalog.difficulty) + " problems" : "Catalog");
    stage.innerHTML = `
      <div class="wrap">
        <section class="catalog-head">
          <p class="kicker">Question bank</p>
          <h1>${heading}</h1>
          <p class="lede">${t ? t.blurb : "Filter by topic and difficulty. Search matches titles, blurbs, and tags."}</p>
          <div class="filters">
            <label class="catalog-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input type="search" placeholder="Filter this list…" value="${escapeHtml(catalog.q)}" data-catalog-q />
            </label>
            <button class="filter-chip ${!catalog.topic ? "on" : ""}" data-topic="">All topics</button>
            ${TOPICS.map((x) => `<button class="filter-chip ${catalog.topic === x.id ? "on" : ""}" data-topic="${x.id}">${x.label}</button>`).join("")}
          </div>
          <div class="filters">
            <button class="filter-chip ${!catalog.difficulty ? "on" : ""}" data-diff="">All levels</button>
            ${DIFFICULTIES.map((d) => `<button class="filter-chip ${catalog.difficulty === d.id ? "on" : ""} diff-${d.id}" data-diff="${d.id}">${d.label}</button>`).join("")}
            <span class="chip">${list.length} shown</span>
          </div>
        </section>
        ${groups.length ? groups.map((g) => `
          <h2 class="section-title"><span class="diff-label diff-${g.diff.id}">${g.diff.label}</span></h2>
          <div class="grid-cards">${g.items.map(problemCard).join("")}</div>
        `).join("") : `<p class="lede">No problems match that filter.</p>`}
      </div>
    `;
    const qInput = stage.querySelector("[data-catalog-q]");
    qInput.addEventListener("input", () => {
      catalog.q = qInput.value;
      renderCatalog();
      const again = document.querySelector("[data-catalog-q]");
      if (again) {
        again.focus();
        const n = again.value.length;
        again.setSelectionRange(n, n);
      }
    });
    stage.querySelectorAll("[data-topic]").forEach((btn) => {
      btn.onclick = () => {
        catalog.topic = btn.dataset.topic || null;
        location.hash = catalog.topic ? ("cat/" + catalog.topic) : "catalog";
        renderCatalog(catalog.topic, catalog.difficulty);
      };
    });
    stage.querySelectorAll("[data-diff]").forEach((btn) => {
      btn.onclick = () => {
        catalog.difficulty = btn.dataset.diff || null;
        renderCatalog(catalog.topic, catalog.difficulty);
      };
    });
  }

  function startSession(kind, topic) {
    let ids = [];
    let title = "Practice";
    let perProblemSec = null;
    let totalRemain = null;
    if (kind === "hard") {
      ids = pickN(PROBLEMS.filter((p) => p.difficulty === "hard"), 5).map((p) => p.id);
      title = "Random hard";
    } else if (kind === "timed") {
      ids = pickTimed().map((p) => p.id);
      title = "Timed set";
      perProblemSec = 12 * 60;
    } else if (kind === "mock") {
      ids = pickMock().map((p) => p.id);
      title = "Mock interview";
      totalRemain = 45 * 60;
    } else if (kind === "topic") {
      const list = PROBLEMS.filter((p) => p.topic === topic);
      ids = pickN(list.length ? list : PROBLEMS, 6).map((p) => p.id);
      title = topicLabel(topic) + " drill";
    } else {
      const queue = reviewQueue();
      if (!queue.length) {
        state.session = null;
        save();
        location.replace("#practice");
        return;
      }
      ids = queue.slice(0, 8).map((p) => p.id);
      title = "Continue practicing";
    }
    if (!ids.length) {
      location.replace("#practice");
      return;
    }
    state.session = { kind, title, ids, index: 0, topic: topic || null, perProblemSec, totalRemain };
    state.recap = null;
    save();
    location.replace("#" + ids[0]);
  }

  function endSession(complete) {
    if (complete && state.session) {
      state.recap = { title: state.session.title, count: state.session.ids.length, kind: state.session.kind };
    }
    state.session = null;
    save();
    stopSessionClock();
    location.hash = "practice";
  }

  function sessionProblemIndex(id) {
    if (!state.session || !state.session.ids) return -1;
    return state.session.ids.indexOf(id);
  }

  function goSession(delta) {
    if (!state.session) return;
    const next = state.session.index + delta;
    if (next < 0) return;
    if (next >= state.session.ids.length) {
      endSession(true);
      return;
    }
    state.session.index = next;
    save();
    location.hash = state.session.ids[next];
  }

  function stopSessionClock() {
    if (sessionTick) {
      clearInterval(sessionTick);
      sessionTick = null;
    }
  }

  function startSessionClock(el) {
    stopSessionClock();
    if (!state.session || typeof state.session.totalRemain !== "number") return;
    if (state.session.totalRemain <= 0) return;
    sessionTick = setInterval(() => {
      if (!state.session || typeof state.session.totalRemain !== "number") {
        stopSessionClock();
        return;
      }
      state.session.totalRemain = Math.max(0, state.session.totalRemain - 1);
      if (el) {
        el.textContent = fmt(state.session.totalRemain);
        el.classList.toggle("warn", state.session.totalRemain <= 60);
      }
      if (state.session.totalRemain <= 0) stopSessionClock();
      save();
    }, 1000);
  }

  function renderPractice() {
    setView("practice");
    stopTimer(false);
    stopSessionClock();
    const pg = progress();
    const queue = PROBLEMS.filter((p) => getStatus(p.id) === "revisit");
    const recap = state.recap;
    stage.innerHTML = `
      <div class="wrap">
        <section class="catalog-head">
          <p class="kicker">Practice desk</p>
          <h1>Train, then mark what to revisit.</h1>
          <p class="lede">Statuses stay in this browser. Continue practicing walks the revisit queue, then unseen problems, then ones you only marked attempted.</p>
        </section>
        ${progressPanel({ id: "practice-progress" })}
        ${recap ? `<p class="callout" data-recap>Finished ${escapeHtml(recap.title)} (${recap.count} problems). Mark confident or revisit before the next set.</p>` : ""}
        ${state.session ? `
          <p class="lede">A session is in progress: ${escapeHtml(state.session.title)} (${state.session.index + 1} / ${state.session.ids.length}).
            <a href="#${state.session.ids[state.session.index]}">Return to it</a>
            · <button class="btn ghost" type="button" data-end-session>End session</button>
          </p>` : ""}
        <section class="section">
          <p class="section-kicker">Modes</p>
          <h2 class="section-title">Deliberate practice</h2>
          <div class="bento">
            <a class="topic-card" href="#practice/continue">
              <span class="mark">${queue.length || pg.untouched}</span>
              <h3>Continue practicing</h3>
              <p>Next from the review queue. Revisit first, then unseen, then attempted.</p>
            </a>
            <a class="topic-card" href="#practice/hard">
              <span class="mark">H</span>
              <h3>Random hard</h3>
              <p>A five-problem hard set. Prefers problems you have not marked confident.</p>
            </a>
            <a class="topic-card" href="#practice/timed">
              <span class="mark">12</span>
              <h3>Timed set</h3>
              <p>Easy, medium, and hard. Twelve minutes on each problem.</p>
            </a>
            <a class="topic-card" href="#practice/mock">
              <span class="mark">45</span>
              <h3>Mock interview</h3>
              <p>Five mixed problems, spread across topics, with a 45-minute session clock.</p>
            </a>
          </div>
        </section>
        <section class="section">
          <p class="section-kicker">Topic drills</p>
          <h2 class="section-title">Stay inside one library</h2>
          <div class="bento">
            ${TOPICS.map((t) => `
              <a class="topic-card" href="#practice/topic/${t.id}">
                <span class="mark">${t.label.slice(0, 1)}</span>
                <h3>${t.label}</h3>
                <p>${t.blurb}</p>
                <p class="diff-line">Up to six problems</p>
              </a>`).join("")}
          </div>
        </section>
        ${queue.length ? `
          <section class="section">
            <p class="section-kicker">Review queue</p>
            <h2 class="section-title">Marked revisit</h2>
            <div class="grid-cards">${queue.map(problemCard).join("")}</div>
          </section>` : ""}
      </div>
    `;
    const endBtn = stage.querySelector("[data-end-session]");
    if (endBtn) endBtn.onclick = () => endSession(false);
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
    if (resetRemain) {
      const dur = (state.session && state.session.perProblemSec) || 12 * 60;
      state.timer.remain = dur;
    }
    save();
  }

  function sessionChrome(p) {
    if (!state.session) return "";
    const idx = sessionProblemIndex(p.id);
    const inSession = idx >= 0;
    const n = state.session.ids.length;
    const at = inSession ? idx + 1 : state.session.index + 1;
    const clock = typeof state.session.totalRemain === "number"
      ? `<span class="timer" data-session-timer>${fmt(state.session.totalRemain)}</span>`
      : "";
    return `
      <div class="session-bar">
        <div>
          <p class="kicker">${escapeHtml(state.session.title)}</p>
          <p class="session-meta">${inSession ? at + " / " + n : "In progress · " + at + " / " + n}</p>
        </div>
        ${clock}
        <div class="session-actions">
          ${inSession ? `<button class="btn" type="button" data-session="prev" ${idx === 0 ? "disabled" : ""}>Previous</button>` : `<a class="btn" href="#${state.session.ids[state.session.index]}">Return</a>`}
          ${inSession ? `<button class="btn primary" type="button" data-session="next">${idx === n - 1 ? "Finish set" : "Next"}</button>` : ""}
          <button class="btn ghost" type="button" data-session="end">End</button>
        </div>
      </div>`;
  }

  function renderProblem(p) {
    setView("problem");
    const sessIdx = sessionProblemIndex(p.id);
    if (sessIdx >= 0) {
      state.session.index = sessIdx;
      save();
    }
    stopTimer(true);
    const note = state.notes[p.id] || "";
    const current = getStatus(p.id);
    const list = filtered(p.topic, null);
    const idx = list.findIndex((x) => x.id === p.id);
    const prev = list[idx - 1];
    const next = list[idx + 1];
    const remain = state.timer.remain;
    stage.innerHTML = `
      <article class="problem" data-problem-id="${p.id}">
        ${sessionChrome(p)}
        <nav class="crumbs">
          <a href="#home">Home</a>
          <span>/</span>
          <a href="#catalog">Catalog</a>
          <span>/</span>
          <a href="#cat/${p.topic}">${topicLabel(p.topic)}</a>
          <span>/</span>
          <span class="diff-label diff-${p.difficulty}">${diffLabel(p.difficulty)}</span>
        </nav>
        <h1>${p.title}</h1>
        <div class="meta-row">
          <span class="chip">${p.time}</span>
          <span class="chip">Hide the solution first</span>
        </div>
        <div class="toolbar">
          <button class="btn primary" data-act="timer">Start ${fmt(remain)}</button>
          <span class="timer" data-timer>${fmt(remain)}</span>
          <button class="btn" data-act="reveal">Reveal solution</button>
          <button class="btn ghost" data-act="hide">Hide solution</button>
        </div>
        <div class="status-set" role="group" aria-label="Practice status">
          ${STATUSES.map((s) => `<button class="btn" type="button" data-status="${s}" aria-pressed="${current === s ? "true" : "false"}">${s}</button>`).join("")}
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
    if (window.Visuals) window.Visuals.mount(p.visual, viz, p);

    const notes = stage.querySelector("[data-notes]");
    notes.addEventListener("input", () => {
      state.notes[p.id] = notes.value;
      markAttempted(p.id);
      save();
    });

    const sol = stage.querySelector("[data-solution]");
    const timerEl = stage.querySelector("[data-timer]");
    const timerBtn = stage.querySelector("[data-act=timer]");
    stage.querySelector("[data-act=reveal]").onclick = () => {
      sol.classList.add("open");
      state.seen[p.id] = true;
      markAttempted(p.id);
      save();
      typeset(sol);
    };
    stage.querySelector("[data-act=hide]").onclick = () => sol.classList.remove("open");
    timerBtn.onclick = (ev) => {
      if (state.timer.running) {
        stopTimer(false);
        ev.currentTarget.textContent = "Resume";
        return;
      }
      markAttempted(p.id);
      state.timer.running = true;
      ev.currentTarget.textContent = "Pause";
      state.timer.tick = setInterval(() => {
        state.timer.remain -= 1;
        timerEl.textContent = fmt(state.timer.remain);
        timerEl.classList.toggle("warn", state.timer.remain <= 60);
        if (state.timer.remain <= 0) {
          stopTimer(false);
          ev.currentTarget.textContent = "Start " + fmt((state.session && state.session.perProblemSec) || 12 * 60);
          state.timer.remain = (state.session && state.session.perProblemSec) || 12 * 60;
        }
        save();
      }, 1000);
    };
    stage.querySelectorAll("[data-status]").forEach((btn) => {
      btn.onclick = () => {
        const nextStatus = btn.dataset.status;
        setStatus(p.id, getStatus(p.id) === nextStatus ? null : nextStatus);
        stage.querySelectorAll("[data-status]").forEach((b) => {
          b.setAttribute("aria-pressed", getStatus(p.id) === b.dataset.status ? "true" : "false");
        });
      };
    });
    stage.querySelectorAll("[data-session]").forEach((btn) => {
      btn.onclick = () => {
        const act = btn.dataset.session;
        if (act === "next") goSession(1);
        else if (act === "prev") goSession(-1);
        else if (act === "end") endSession(false);
      };
    });
    const sessionTimer = stage.querySelector("[data-session-timer]");
    if (sessionTimer) startSessionClock(sessionTimer);
    else stopSessionClock();
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
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function searchItems(q) {
    const list = filtered(null, null, q);
    if (!q.trim()) return PROBLEMS.slice();
    const ql = q.toLowerCase();
    return list.slice().sort((a, b) => {
      const at = a.title.toLowerCase().startsWith(ql) ? 1 : 0;
      const bt = b.title.toLowerCase().startsWith(ql) ? 1 : 0;
      return bt - at;
    });
  }

  function renderPalette() {
    pal.items = searchItems(pal.q);
    if (pal.active >= pal.items.length) pal.active = Math.max(0, pal.items.length - 1);
    if (!pal.items.length) {
      cmdkResults.innerHTML = `<div class="cmdk-empty">No problems match "${escapeHtml(pal.q)}".</div>`;
      return;
    }
    const groups = groupedKeepOrder(pal.items);
    cmdkResults.innerHTML = groups.map((g) => `
      <div class="cmdk-group">${g.topic.label}</div>
      ${g.items.map((p) => {
        const i = pal.items.indexOf(p);
        return `
          <button class="cmdk-item ${i === pal.active ? "active" : ""}" type="button" data-i="${i}">
            <span>${p.title}<small>${diffLabel(p.difficulty)} · ${p.blurb}</small></span>
            <span class="diff-label diff-${p.difficulty}">${p.difficulty}</span>
          </button>`;
      }).join("")}
    `).join("");
    cmdkResults.querySelectorAll(".cmdk-item").forEach((btn) => {
      btn.onmouseenter = () => { pal.active = Number(btn.dataset.i); paintActive(); };
      btn.onclick = () => goItem(Number(btn.dataset.i));
    });
    const active = cmdkResults.querySelector(".cmdk-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function groupedKeepOrder(list) {
    return TOPICS.map((t) => ({
      topic: t,
      items: list.filter((p) => p.topic === t.id)
    })).filter((g) => g.items.length);
  }

  function paintActive() {
    cmdkResults.querySelectorAll(".cmdk-item").forEach((el) => {
      el.classList.toggle("active", Number(el.dataset.i) === pal.active);
    });
    const active = cmdkResults.querySelector(".cmdk-item.active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function goItem(i) {
    const p = pal.items[i];
    if (!p) return;
    closeSearch();
    location.hash = p.id;
  }

  function setSearchExpanded(open) {
    document.querySelectorAll("[data-open-search]").forEach((el) => {
      el.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function searchFocusables() {
    const items = Array.from(cmdkResults.querySelectorAll(".cmdk-item"));
    return [cmdkInput].concat(items).filter(Boolean);
  }

  function trapSearchFocus(ev) {
    if (ev.key !== "Tab" || cmdk.hidden) return;
    const list = searchFocusables();
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    ev.preventDefault();
    if (ev.shiftKey) list[i <= 0 ? list.length - 1 : i - 1].focus();
    else list[(i + 1) % list.length].focus();
  }

  function openSearch(seed) {
    searchReturnFocus = document.activeElement;
    pal.q = seed || "";
    pal.active = 0;
    cmdk.hidden = false;
    setSearchExpanded(true);
    cmdkInput.value = pal.q;
    renderPalette();
    requestAnimationFrame(() => cmdkInput.focus());
  }

  function closeSearch() {
    if (cmdk.hidden) return;
    cmdk.hidden = true;
    setSearchExpanded(false);
    const back = searchReturnFocus;
    searchReturnFocus = null;
    if (back && typeof back.focus === "function") back.focus();
  }

  function bindSearchButtons(root) {
    (root || document).querySelectorAll("[data-open-search]").forEach((el) => {
      el.onclick = () => openSearch();
    });
  }

  function toTop() {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      html.style.scrollBehavior = prev;
    });
  }

  function currentHash() {
    const h = location.hash || "#home";
    return (!h || h === "#") ? "#home" : h;
  }

  function scrollToLibrary() {
    const el = document.getElementById("topics");
    if (!el) return;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    el.scrollIntoView({ behavior: "auto", block: "start" });
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "auto", block: "start" });
      html.style.scrollBehavior = prev;
    });
  }

  function route() {
    closeNav();
    const r = parseHash();
    if (r.view === "home") {
      renderHome();
      if (r.scroll === "topics") {
        requestAnimationFrame(() => scrollToLibrary());
      } else {
        toTop();
      }
      return;
    }
    if (r.view === "catalog") {
      catalog.topic = r.topic || null;
      if (r.difficulty) catalog.difficulty = r.difficulty;
      renderCatalog(catalog.topic, catalog.difficulty);
      toTop();
      return;
    }
    if (r.view === "practice") {
      if (r.mode) {
        startSession(r.mode, r.topic);
        return;
      }
      renderPractice();
      toTop();
      return;
    }
    const p = PROBLEMS.find((x) => x.id === r.id);
    if (!p) {
      renderHome();
      toTop();
      return;
    }
    renderProblem(p);
    toTop();
  }

  cmdkInput.addEventListener("input", () => {
    pal.q = cmdkInput.value;
    pal.active = 0;
    renderPalette();
  });
  cmdk.querySelector("[data-close-search]").addEventListener("click", closeSearch);
  bindSearchButtons(document);

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const open = !primaryNav.classList.contains("open");
      primaryNav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", (ev) => {
      if (!primaryNav.classList.contains("open")) return;
      if (primaryNav.contains(ev.target) || navToggle.contains(ev.target)) return;
      closeNav();
    });
  }

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a[href="#home"], a[href="#catalog"], a[href="#topics"], a[href="#practice"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (currentHash() !== href) return;
    ev.preventDefault();
    if (href === "#topics") scrollToLibrary();
    else toTop();
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("keydown", (ev) => {
    const metaK = (ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k";
    if (metaK) {
      ev.preventDefault();
      if (cmdk.hidden) openSearch();
      else closeSearch();
      return;
    }
    if (!cmdk.hidden) {
      trapSearchFocus(ev);
      if (ev.key === "Escape") { ev.preventDefault(); closeSearch(); }
      if (ev.key === "ArrowDown") { ev.preventDefault(); pal.active = Math.min(pal.items.length - 1, pal.active + 1); paintActive(); }
      if (ev.key === "ArrowUp") { ev.preventDefault(); pal.active = Math.max(0, pal.active - 1); paintActive(); }
      if (ev.key === "Enter") { ev.preventDefault(); goItem(pal.active); }
      return;
    }
    if (ev.key === "Escape" && primaryNav && primaryNav.classList.contains("open")) {
      ev.preventDefault();
      closeNav();
      if (navToggle) navToggle.focus();
      return;
    }
    if (["INPUT", "TEXTAREA"].includes(ev.target.tagName)) return;
    if (ev.key === "s" || ev.key === "S") {
      const sol = document.querySelector("[data-solution]");
      if (sol) sol.classList.toggle("open");
    }
    if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
      const r = parseHash();
      if (r.view !== "problem") return;
      if (state.session && sessionProblemIndex(r.id) >= 0) {
        goSession(ev.key === "ArrowRight" ? 1 : -1);
        return;
      }
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
