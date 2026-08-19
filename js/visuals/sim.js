(() => {
  const { startLoop, wait, later } = window.Viz;

  function fmt(x) {
    if (!Number.isFinite(x)) return "∞";
    if (Math.abs(x) >= 100) return x.toFixed(1);
    if (Math.abs(x) >= 10) return x.toFixed(2);
    return x.toFixed(3);
  }

  window.Visuals.sim = function sim(root, problem) {
    const cfg = (problem && problem.sim) || {};
    const theory = cfg.theory;
    const title = cfg.title || "Monte Carlo";
    const caption = cfg.caption || "Empirical value against the derived answer.";
    root.innerHTML = `
      <div class="viz-head">
        <h3>${title}</h3>
        <div class="viz-controls">
          <button class="btn primary" data-act="one">One trial</button>
          <button class="btn" data-act="many">200 trials</button>
          <button class="btn" data-act="reset">Reset</button>
          <span class="stat" data-stat></span>
        </div>
      </div>
      <div class="viz-stage"><canvas width="860" height="360"></canvas></div>
      <p class="viz-caption">${caption}</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const stat = root.querySelector("[data-stat]");
    const model = { hist: [], last: null, busy: false };

    function sample() {
      if (typeof cfg.trial !== "function") return 0;
      return cfg.trial();
    }

    function push(v) {
      model.last = v;
      const prev = model.hist.length ? model.hist[model.hist.length - 1] : v;
      const n = model.hist.length + 1;
      model.hist.push(prev + (v - prev) / n);
      if (model.hist.length > 120) model.hist.shift();
    }

    function draw() {
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const left = 50, top = 36, w = 760, h = 250;
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(left, top, w, h);
      const mean = model.hist.length ? model.hist[model.hist.length - 1] : 0;
      const vals = model.hist.slice();
      if (Number.isFinite(theory)) vals.push(theory);
      const vmax = Math.max(1e-6, ...vals.map((x) => Math.abs(x))) * 1.35;
      const yOf = (v) => top + h / 2 - (v / vmax) * (h / 2);
      if (Number.isFinite(theory)) {
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = "rgba(110,200,182,0.85)";
        ctx.beginPath();
        const y = yOf(theory);
        ctx.moveTo(left, y);
        ctx.lineTo(left + w, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (model.hist.length) {
        ctx.beginPath();
        model.hist.forEach((v, i) => {
          const x = left + ((i + 1) / Math.max(model.hist.length, 8)) * w;
          const y = yOf(v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "#e2c57a";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = "#f4f0e6";
      ctx.font = "16px 'Source Serif 4', serif";
      ctx.textAlign = "left";
      ctx.fillText("last trial  " + (model.last == null ? "-" : fmt(model.last)), 50, 320);
      ctx.fillStyle = "#6ec8b6";
      ctx.font = "13px 'IBM Plex Mono', monospace";
      const n = model.hist.length;
      ctx.fillText(
        "running mean " + (n ? fmt(mean) : "-") +
        (Number.isFinite(theory) ? ("   theory " + fmt(theory)) : "") +
        "   n=" + n,
        280,
        320
      );
      stat.textContent = n ? (fmt(mean) + (Number.isFinite(theory) ? " vs " + fmt(theory) : "")) : "ready";
    }

    async function one() {
      if (model.busy) return;
      model.busy = true;
      push(sample());
      await wait(40);
      model.busy = false;
    }

    function many(k) {
      for (let i = 0; i < (k || 200); i += 1) push(sample());
    }

    root.querySelector("[data-act=one]").onclick = () => one();
    root.querySelector("[data-act=many]").onclick = () => many(200);
    root.querySelector("[data-act=reset]").onclick = () => { model.hist = []; model.last = null; };
    startLoop(draw);
    later(() => many(40), 280);
  };
})();
