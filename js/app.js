(() => {
  const PROBLEMS = window.PROBLEMS;
  const stage = document.getElementById("stage");
  const toc = document.getElementById("toc");
  const storeKey = "qip-desk-v1";

  const state = load() || {
    notes: {},
    seen: {},
    timer: { id: null, remain: 12 * 60, running: false }
  };
  state.timer.running = false;
  state.timer.id = null;
  if (typeof state.timer.remain !== "number") state.timer.remain = 12 * 60;

  function load() {
    try { return JSON.parse(localStorage.getItem(storeKey) || "null"); }
    catch { return null; }
  }
  function save() {
    const payload = {
      notes: state.notes,
      seen: state.seen,
      timer: { remain: state.timer.remain, running: false }
    };
    localStorage.setItem(storeKey, JSON.stringify(payload));
  }

  function route() {
    const hash = (location.hash || "#home").slice(1);
    if (hash === "home" || !hash) return renderHome();
    const p = PROBLEMS.find((x) => x.id === hash);
    if (!p) return renderHome();
    renderProblem(p);
  }

  function renderToc(active) {
    toc.innerHTML = PROBLEMS.map((p) => `
      <a class="toc-item ${p.id === active ? "active" : ""}" href="#${p.id}">
        <span class="toc-num">${p.num}</span>
        <span>${p.title}<small>${p.topic}</small></span>
      </a>
    `).join("");
  }

  function renderHome() {
    renderToc(null);
    stopTimer(false);
    stage.innerHTML = `
      <section class="hero">
        <p class="kicker">Hard set · later rounds</p>
        <h1>Work the mechanism, then open the door.</h1>
        <p class="lede">Six interview problems that reward a clean state space, a picture, and a sentence about why the answer is not the naive one. Time yourself. Write a setup before you reveal anything.</p>
        <div class="meta-row">
          <span class="chip">Probability</span>
          <span class="chip">Geometric chance</span>
          <span class="chip">Strategy</span>
          <span class="chip">Inference</span>
          <span class="chip">8–15 min each</span>
        </div>
        <div class="grid-cards">
          ${PROBLEMS.map((p) => `
            <a class="card" href="#${p.id}">
              <div class="num">${p.num} · ${p.topic}</div>
              <h3>${p.title}</h3>
              <p>${p.blurb}</p>
            </a>
          `).join("")}
        </div>
        <p class="footer-note">Problem 1 is derived in full on the page. The waiting time for HTH is 10, not the common first-pass 8.</p>
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
    renderToc(p.id);
    stopTimer(true);
    const note = state.notes[p.id] || "";
    stage.innerHTML = `
      <article class="problem">
        <p class="kicker">${p.num} · ${p.topic}</p>
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
          ${p.statement}
        </section>
        <section class="notes">
          <h2>Your setup</h2>
          <textarea class="notes-box" data-notes placeholder="States, sample space, what you are conditioning on…">${escapeHtml(note)}</textarea>
        </section>
        <section class="solution" data-solution>
          <h2>Solution</h2>
          ${p.solution}
        </section>
        <section class="viz">
          <div data-viz></div>
        </section>
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

  function typeset(el) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$", right: "$", display: false }
      ],
      throwOnError: false
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  window.addEventListener("hashchange", route);
  window.addEventListener("keydown", (ev) => {
    if (["INPUT", "TEXTAREA"].includes(ev.target.tagName)) return;
    if (ev.key >= "1" && ev.key <= "6") {
      location.hash = PROBLEMS[Number(ev.key) - 1].id;
    }
    if (ev.key === "h" || ev.key === "H") location.hash = "home";
    if (ev.key === "s" || ev.key === "S") {
      const sol = document.querySelector("[data-solution]");
      if (sol) sol.classList.toggle("open");
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", route);
  } else {
    route();
  }
})();
