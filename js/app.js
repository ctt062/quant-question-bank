(() => {
  const PROBLEMS = window.PROBLEMS;
  const TOPICS = window.TOPICS;
  const DIFFICULTIES = window.DIFFICULTIES;
  const stage = document.getElementById("stage");
  const cmdk = document.getElementById("cmdk");
  const cmdkInput = document.getElementById("cmdk-input");
  const cmdkResults = document.getElementById("cmdk-results");
  const storeKey = "qip-desk-v2";
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac");
  const kbdChord = isMac ? "⌘K" : "Ctrl+K";

  document.querySelectorAll("[data-kbd]").forEach((el) => {
    if (el.tagName === "KBD" || el.hasAttribute("data-kbd")) el.textContent = el.textContent.includes("esc") ? "esc" : kbdChord;
  });
  document.querySelectorAll(".search-launch kbd, .search-hero kbd").forEach((el) => { el.textContent = kbdChord; });

  const state = load() || {
    notes: {},
    seen: {},
    timer: { id: null, remain: 12 * 60, running: false }
  };
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
      timer: { remain: state.timer.remain, running: false }
    }));
  }

  function topicOf(id) { return TOPICS.find((t) => t.id === id); }
  function topicLabel(id) { return (topicOf(id) || {}).label || id; }
  function diffLabel(id) { return (DIFFICULTIES.find((d) => d.id === id) || {}).label || id; }
  function parseHash() {
    const raw = (location.hash || "#home").slice(1);
    if (!raw || raw === "home" || raw === "topics") return { view: "home", scroll: raw === "topics" ? "topics" : null };
    if (raw === "catalog") return { view: "catalog" };
    if (raw.startsWith("cat/")) {
      const parts = raw.split("/");
      return { view: "catalog", topic: parts[1], difficulty: parts[2] || null };
    }
    if (raw.startsWith("diff/")) return { view: "catalog", difficulty: raw.split("/")[1] };
    const p = PROBLEMS.find((x) => x.id === raw);
    if (p) return { view: "problem", id: p.id };
    return { view: "home" };
  }

  function setView(name) {
    document.body.dataset.view = name;
    const nav = (location.hash || "").slice(1) === "topics" ? "topics" : name;
    document.querySelectorAll(".topnav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === nav);
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

  function problemCard(p) {
    return `
      <a class="card" href="#${p.id}">
        <div class="num">${topicLabel(p.topic)} · <span class="diff-label diff-${p.difficulty}">${diffLabel(p.difficulty)}</span></div>
        <h3>${p.title}</h3>
        <p>${p.blurb}</p>
      </a>`;
  }

  function renderHome() {
    setView("home");
    stopTimer(false);
    const featured = PROBLEMS.filter((p) => p.difficulty === "hard").slice(0, 4);
    stage.innerHTML = `
      <div class="wrap">
        <section class="hero-home">
          <p class="kicker">Quant question bank</p>
          <h1>Later-round problems, with the mechanism in view.</h1>
          <p class="lede">Probability, geometry, combinatorics, games, statistics, and strategy. Time yourself, write a setup, then reveal a derived solution and play the figure.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#catalog">Browse the catalog</a>
            <button class="search-hero" type="button" data-open-search>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Search problems
              <kbd>${kbdChord}</kbd>
            </button>
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
    setView("problem");
    stopTimer(true);
    const note = state.notes[p.id] || "";
    const list = filtered(p.topic, null);
    const idx = list.findIndex((x) => x.id === p.id);
    const prev = list[idx - 1];
    const next = list[idx + 1];
    stage.innerHTML = `
      <article class="problem">
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
    if (window.Visuals) window.Visuals.mount(p.visual, viz, p);

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

  function openSearch(seed) {
    pal.q = seed || "";
    pal.active = 0;
    cmdk.hidden = false;
    cmdkInput.value = pal.q;
    renderPalette();
    requestAnimationFrame(() => cmdkInput.focus());
  }

  function closeSearch() {
    cmdk.hidden = true;
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

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest('a[href="#home"], a[href="#catalog"], a[href="#topics"]');
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
      if (ev.key === "Escape") { ev.preventDefault(); closeSearch(); }
      if (ev.key === "ArrowDown") { ev.preventDefault(); pal.active = Math.min(pal.items.length - 1, pal.active + 1); paintActive(); }
      if (ev.key === "ArrowUp") { ev.preventDefault(); pal.active = Math.max(0, pal.active - 1); paintActive(); }
      if (ev.key === "Enter") { ev.preventDefault(); goItem(pal.active); }
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
