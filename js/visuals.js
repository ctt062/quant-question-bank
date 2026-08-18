window.Visuals = {
  mount(name, el) {
    const fn = this[name];
    if (!fn) return;
    el.innerHTML = "";
    fn.call(this, el);
  },

  hthhhh(root) {
    root.innerHTML = `
      <div class="viz-head">
        <h3>State walk</h3>
        <div class="viz-controls">
          <button class="btn" data-act="flip">Flip once</button>
          <button class="btn" data-act="run">Flip until done</button>
          <button class="btn" data-act="reset">Reset</button>
          <button class="btn primary" data-act="mc">200 trials</button>
        </div>
      </div>
      <div class="viz-stage">
        <canvas width="860" height="420"></canvas>
      </div>
      <p class="viz-caption" data-cap>Choose HTH or HHH, then flip. The chip sits on the current suffix. Monte Carlo should sit near 10 and 14.</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const cap = root.querySelector("[data-cap]");
    const state = {
      pattern: "HTH",
      node: 0,
      flips: 0,
      seq: "",
      done: false,
      means: { HTH: null, HHH: null },
      last: { HTH: null, HHH: null }
    };

    const layouts = {
      HTH: [
        { id: "∅", x: 90, y: 200 },
        { id: "H", x: 300, y: 200 },
        { id: "HT", x: 520, y: 200 },
        { id: "HTH", x: 740, y: 200 }
      ],
      HHH: [
        { id: "∅", x: 90, y: 200 },
        { id: "H", x: 300, y: 200 },
        { id: "HH", x: 520, y: 200 },
        { id: "HHH", x: 740, y: 200 }
      ]
    };

    function nextState(pattern, node, face) {
      if (pattern === "HTH") {
        if (node === 0) return face === "H" ? 1 : 0;
        if (node === 1) return face === "H" ? 1 : 2;
        if (node === 2) return face === "H" ? 3 : 0;
      } else {
        if (node === 0) return face === "H" ? 1 : 0;
        if (node === 1) return face === "H" ? 2 : 0;
        if (node === 2) return face === "H" ? 3 : 0;
      }
      return 3;
    }

    function trial(pattern) {
      let node = 0;
      let n = 0;
      while (node < 3 && n < 10000) {
        n += 1;
        node = nextState(pattern, node, Math.random() < 0.5 ? "H" : "T");
      }
      return n;
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);

      // pattern toggle
      ["HTH", "HHH"].forEach((p, i) => {
        const x = 40 + i * 120;
        const on = state.pattern === p;
        ctx.beginPath();
        roundRect(ctx, x, 18, 100, 32, 8);
        ctx.fillStyle = on ? "#d4b15a" : "#1b2333";
        ctx.fill();
        ctx.fillStyle = on ? "#0c1018" : "#f3efe4";
        ctx.font = "600 14px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p, x + 50, 39);
      });

      const nodes = layouts[state.pattern];
      nodes.slice(0, -1).forEach((a, i) => {
        const b = nodes[i + 1];
        ctx.strokeStyle = "rgba(212,177,90,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x + 36, a.y);
        ctx.lineTo(b.x - 36, b.y);
        ctx.stroke();
      });

      // reset arrows
      ctx.strokeStyle = "rgba(224,122,106,0.55)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(nodes[2].x, nodes[2].y + 36);
      ctx.bezierCurveTo(nodes[2].x - 80, nodes[2].y + 110, nodes[0].x + 80, nodes[0].y + 110, nodes[0].x, nodes[0].y + 36);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(224,122,106,0.8)";
      ctx.font = "12px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(state.pattern === "HTH" ? "T from HT resets" : "T from H or HH resets", 400, 340);

      nodes.forEach((n, i) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 34, 0, Math.PI * 2);
        ctx.fillStyle = i === state.node ? "#d4b15a" : "#1b2333";
        ctx.fill();
        ctx.strokeStyle = i === 3 ? "#6ec8b6" : "rgba(212,177,90,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = i === state.node ? "#0c1018" : "#f3efe4";
        ctx.font = "600 16px 'Source Serif 4', serif";
        ctx.textAlign = "center";
        ctx.fillText(n.id, n.x, n.y + 5);
      });

      ctx.fillStyle = "#a8b0c0";
      ctx.font = "13px 'IBM Plex Mono', monospace";
      ctx.textAlign = "left";
      const seq = state.seq || "—";
      ctx.fillText("flips  " + state.flips, 40, 390);
      ctx.fillText("seq    " + seq.slice(-32), 200, 390);

      ctx.textAlign = "right";
      ctx.fillStyle = "#6ec8b6";
      const m1 = state.means.HTH == null ? "—" : state.means.HTH.toFixed(2);
      const m2 = state.means.HHH == null ? "—" : state.means.HHH.toFixed(2);
      ctx.fillText("MC mean HTH " + m1 + "   (theory 10)", 820, 40);
      ctx.fillText("MC mean HHH " + m2 + "   (theory 14)", 820, 60);
    }

    function flipOnce() {
      if (state.done) return;
      const face = Math.random() < 0.5 ? "H" : "T";
      state.seq += face;
      state.flips += 1;
      state.node = nextState(state.pattern, state.node, face);
      if (state.node === 3) {
        state.done = true;
        state.last[state.pattern] = state.flips;
        cap.textContent = state.pattern + " appeared in " + state.flips + " flips.";
      }
      draw();
    }

    root.querySelector("[data-act=flip]").onclick = flipOnce;
    root.querySelector("[data-act=run]").onclick = () => {
      let guard = 0;
      while (!state.done && guard++ < 5000) flipOnce();
    };
    root.querySelector("[data-act=reset]").onclick = () => {
      state.node = 0;
      state.flips = 0;
      state.seq = "";
      state.done = false;
      cap.textContent = "Reset. Flip until the gold chip reaches the absorbing pattern.";
      draw();
    };
    root.querySelector("[data-act=mc]").onclick = () => {
      const n = 200;
      let acc = 0;
      for (let i = 0; i < n; i += 1) acc += trial(state.pattern);
      state.means[state.pattern] = acc / n;
      cap.textContent = n + " trials of " + state.pattern + ": mean " + state.means[state.pattern].toFixed(2) + ".";
      draw();
    };
    canvas.addEventListener("click", (ev) => {
      const r = canvas.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (canvas.width / r.width);
      const y = (ev.clientY - r.top) * (canvas.height / r.height);
      if (y < 55 && x > 40 && x < 140) state.pattern = "HTH";
      if (y < 55 && x > 160 && x < 260) state.pattern = "HHH";
      state.node = 0;
      state.flips = 0;
      state.seq = "";
      state.done = false;
      draw();
    });
    draw();
  },

  stick(root) {
    root.innerHTML = `
      <div class="viz-head">
        <h3>Sample space and stick</h3>
        <div class="viz-controls">
          <button class="btn" data-act="one">One break</button>
          <button class="btn primary" data-act="many">400 samples</button>
          <button class="btn" data-act="clear">Clear</button>
          <span class="stat" data-stat>0 / 0</span>
        </div>
      </div>
      <div class="viz-stage">
        <canvas width="860" height="430"></canvas>
      </div>
      <p class="viz-caption">Left: ordered breaks (x, y) in the triangle 0 &lt; x &lt; y &lt; 1. Gold is the favorable set (area 1/8, probability 1/4). Right: the three pieces.</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const stat = root.querySelector("[data-stat]");
    const samples = [];

    function sampleOne() {
      const u = Math.random();
      const v = Math.random();
      const x = Math.min(u, v);
      const y = Math.max(u, v);
      const ok = x < 0.5 && y > 0.5 && (y - x) < 0.5;
      samples.push({ x, y, ok });
    }

    function mapPt(x, y) {
      const ox = 70;
      const oy = 330;
      const s = 260;
      return { px: ox + x * s, py: oy - y * s };
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);

      // sample-space triangle
      const a = mapPt(0, 0);
      const b = mapPt(1, 1);
      const c = mapPt(0, 1);
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.lineTo(c.px, c.py);
      ctx.closePath();
      ctx.fillStyle = "#1b2333";
      ctx.fill();
      ctx.strokeStyle = "rgba(243,239,228,0.25)";
      ctx.stroke();

      const f1 = mapPt(0, 0.5);
      const f2 = mapPt(0.5, 0.5);
      const f3 = mapPt(0.5, 1);
      ctx.beginPath();
      ctx.moveTo(f1.px, f1.py);
      ctx.lineTo(f2.px, f2.py);
      ctx.lineTo(f3.px, f3.py);
      ctx.closePath();
      ctx.fillStyle = "rgba(212,177,90,0.28)";
      ctx.fill();
      ctx.strokeStyle = "#d4b15a";
      ctx.stroke();

      samples.forEach((s) => {
        const p = mapPt(s.x, s.y);
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = s.ok ? "#6ec8b6" : "#e07a6a";
        ctx.fill();
      });

      ctx.fillStyle = "#a8b0c0";
      ctx.font = "12px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("x →", 200, 360);
      ctx.save();
      ctx.translate(42, 200);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("y", 0, 0);
      ctx.restore();
      ctx.fillStyle = "#d4b15a";
      ctx.fillText("favorable", 220, 210);

      // stick
      const last = samples[samples.length - 1];
      const sx = 430;
      const sy = 80;
      const sw = 390;
      ctx.fillStyle = "#f3efe4";
      ctx.font = "600 16px 'Source Serif 4', serif";
      ctx.fillText("Unit stick", sx, 50);
      ctx.fillStyle = "#1b2333";
      roundRect(ctx, sx, sy, sw, 26, 6);
      ctx.fill();

      if (last) {
        const cuts = [last.x, last.y].sort((p, q) => p - q);
        const cols = last.ok ? ["#6ec8b6", "#d4b15a", "#7aa2e3"] : ["#e07a6a", "#b4534a", "#8a3d36"];
        const xs = [0, cuts[0], cuts[1], 1];
        for (let i = 0; i < 3; i += 1) {
          ctx.fillStyle = cols[i];
          ctx.fillRect(sx + xs[i] * sw, sy, (xs[i + 1] - xs[i]) * sw, 26);
        }
        cuts.forEach((t) => {
          ctx.fillStyle = "#0c1018";
          ctx.fillRect(sx + t * sw - 1, sy - 6, 2, 38);
        });

        const pieces = [cuts[0], cuts[1] - cuts[0], 1 - cuts[1]];
        pieces.forEach((len, i) => {
          const y = 160 + i * 56;
          ctx.fillStyle = cols[i];
          roundRect(ctx, sx, y, Math.max(8, len * sw), 22, 5);
          ctx.fill();
          ctx.fillStyle = "#f3efe4";
          ctx.font = "13px 'IBM Plex Mono', monospace";
          ctx.fillText("piece " + (i + 1) + "  " + len.toFixed(3) + (len < 0.5 ? "  < 1/2" : "  ≥ 1/2"), sx, y + 40);
        });
        ctx.fillStyle = last.ok ? "#6ec8b6" : "#e07a6a";
        ctx.font = "600 16px 'Source Serif 4', serif";
        ctx.fillText(last.ok ? "forms a triangle" : "no triangle", sx, 360);
      }

      const ok = samples.filter((s) => s.ok).length;
      stat.textContent = ok + " / " + samples.length + (samples.length ? "  =  " + (ok / samples.length).toFixed(3) : "");
    }

    root.querySelector("[data-act=one]").onclick = () => { sampleOne(); draw(); };
    root.querySelector("[data-act=many]").onclick = () => {
      for (let i = 0; i < 400; i += 1) sampleOne();
      draw();
    };
    root.querySelector("[data-act=clear]").onclick = () => { samples.length = 0; draw(); };
    draw();
  },

  circle(root) {
    root.innerHTML = `
      <div class="viz-head">
        <h3>Throw until no empty semicircle</h3>
        <div class="viz-controls">
          <button class="btn" data-act="throw">Throw one</button>
          <button class="btn" data-act="cover">Throw until covered</button>
          <button class="btn" data-act="reset">Reset</button>
          <button class="btn primary" data-act="mc">200 coverings</button>
          <span class="stat" data-stat></span>
        </div>
      </div>
      <div class="viz-stage">
        <canvas width="860" height="400"></canvas>
      </div>
      <p class="viz-caption">The coral arc is the current maximum gap. Covered when that gap is at most a semicircle. Theory: E[N] = 5.</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const stat = root.querySelector("[data-stat]");
    const pts = [];
    let mean = null;

    function maxGap(points) {
      if (!points.length) return { gap: 1, from: 0 };
      const s = [...points].sort((a, b) => a - b);
      let gap = 1 - s[s.length - 1] + s[0];
      let from = s[s.length - 1];
      for (let i = 1; i < s.length; i += 1) {
        const g = s[i] - s[i - 1];
        if (g > gap) {
          gap = g;
          from = s[i - 1];
        }
      }
      return { gap, from };
    }

    function covered() {
      return pts.length >= 3 && maxGap(pts).gap <= 0.5;
    }

    function trial() {
      const p = [];
      while (!(p.length >= 3 && maxGap(p).gap <= 0.5) && p.length < 40) p.push(Math.random());
      return p.length;
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);
      const cx = 230;
      const cy = 200;
      const r = 140;

      const mg = maxGap(pts);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.lineWidth = 10;
      ctx.stroke();

      if (pts.length) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, mg.from * 2 * Math.PI, (mg.from + mg.gap) * 2 * Math.PI);
        ctx.strokeStyle = mg.gap > 0.5 ? "#e07a6a" : "#6ec8b6";
        ctx.lineWidth = 10;
        ctx.stroke();
      }

      pts.forEach((t) => {
        const a = t * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 6, 0, Math.PI * 2);
        ctx.fillStyle = "#d4b15a";
        ctx.fill();
      });

      ctx.fillStyle = "#f3efe4";
      ctx.font = "600 18px 'Source Serif 4', serif";
      ctx.textAlign = "left";
      ctx.fillText(pts.length + " points", 430, 80);
      ctx.font = "14px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "#a8b0c0";
      ctx.fillText("max gap   " + (pts.length ? mg.gap.toFixed(3) : "1.000"), 430, 120);
      ctx.fillText("threshold 0.500", 430, 144);
      ctx.fillStyle = covered() ? "#6ec8b6" : "#e07a6a";
      ctx.font = "600 16px 'Source Serif 4', serif";
      ctx.fillText(covered() ? "covered: no empty semicircle" : "not covered", 430, 184);
      ctx.fillStyle = "#6ec8b6";
      ctx.font = "13px 'IBM Plex Mono', monospace";
      ctx.fillText("theory E[N] = 5", 430, 230);
      if (mean != null) ctx.fillText("MC mean     = " + mean.toFixed(3), 430, 252);

      stat.textContent = covered() ? ("N = " + pts.length) : (pts.length + " so far");
    }

    root.querySelector("[data-act=throw]").onclick = () => {
      if (!covered()) pts.push(Math.random());
      draw();
    };
    root.querySelector("[data-act=cover]").onclick = () => {
      while (!covered()) pts.push(Math.random());
      draw();
    };
    root.querySelector("[data-act=reset]").onclick = () => { pts.length = 0; draw(); };
    root.querySelector("[data-act=mc]").onclick = () => {
      let acc = 0;
      const n = 200;
      for (let i = 0; i < n; i += 1) acc += trial();
      mean = acc / n;
      draw();
    };
    draw();
  },

  prisoners(root) {
    root.innerHTML = `
      <div class="viz-head">
        <h3>Follow the cycle</h3>
        <div class="viz-controls">
          <label class="stat">n <input type="range" min="8" max="20" step="2" value="12" data-n /></label>
          <button class="btn" data-act="shuffle">New permutation</button>
          <button class="btn" data-act="step">Step prisoner 1</button>
          <button class="btn primary" data-act="mc">1000 trials</button>
          <span class="stat" data-stat></span>
        </div>
      </div>
      <div class="viz-stage">
        <canvas width="860" height="420"></canvas>
      </div>
      <p class="viz-caption">Boxes are a permutation. Prisoner 1 starts at box 1 and follows pointers. Everyone succeeds iff no cycle is longer than n/2.</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const nInput = root.querySelector("[data-n]");
    const stat = root.querySelector("[data-stat]");
    const model = { n: 12, perm: [], walk: [], done: false, rate: null };

    function shuffle(n) {
      const p = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }
      return p;
    }

    function cycles(perm) {
      const seen = new Array(perm.length).fill(false);
      const out = [];
      for (let i = 0; i < perm.length; i += 1) {
        if (seen[i]) continue;
        const cyc = [];
        let x = i;
        while (!seen[x]) {
          seen[x] = true;
          cyc.push(x);
          x = perm[x];
        }
        out.push(cyc);
      }
      return out.sort((a, b) => b.length - a.length);
    }

    function longestOk() {
      return Math.max(...cycles(model.perm).map((c) => c.length)) <= model.n / 2;
    }

    function resetWalk() {
      model.walk = [0];
      model.done = false;
    }

    function fresh() {
      model.n = Number(nInput.value);
      model.perm = shuffle(model.n);
      resetWalk();
      draw();
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);
      const cycs = cycles(model.perm);
      const budget = model.n / 2;
      const cols = ["#d4b15a", "#6ec8b6", "#7aa2e3", "#b29be0", "#e07a6a", "#9aa3b5"];
      let y = 36;
      cycs.forEach((cyc, ci) => {
        const long = cyc.length > budget;
        ctx.fillStyle = long ? "#e07a6a" : cols[ci % cols.length];
        ctx.font = "12px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText((long ? "LONG " : "ok    ") + "len " + cyc.length, 24, y + 8);
        const bw = Math.min(46, (800 / cyc.length) - 6);
        cyc.forEach((box, i) => {
          const x = 130 + i * (bw + 6);
          const on = model.walk.includes(box);
          ctx.fillStyle = on ? "#d4b15a" : "#1b2333";
          roundRect(ctx, x, y - 16, bw, 28, 6);
          ctx.fill();
          ctx.strokeStyle = long ? "#e07a6a" : "rgba(212,177,90,0.25)";
          ctx.stroke();
          ctx.fillStyle = on ? "#0c1018" : "#f3efe4";
          ctx.font = "11px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(box + 1), x + bw / 2, y + 3);
        });
        y += 42;
      });

      ctx.fillStyle = "#a8b0c0";
      ctx.font = "13px 'IBM Plex Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Opening budget n/2 = " + budget + ". Gold boxes are prisoner 1’s walk.", 24, 390);
      ctx.fillStyle = longestOk() ? "#6ec8b6" : "#e07a6a";
      ctx.font = "600 15px 'Source Serif 4', serif";
      ctx.fillText(longestOk() ? "This permutation: all prisoners succeed" : "This permutation: a long cycle dooms everyone", 24, 412);

      const exact = 1 - harmonicTail(model.n);
      stat.textContent = "theory ≈ " + (100 * exact).toFixed(1) + "%" + (model.rate == null ? "" : "   MC " + (100 * model.rate).toFixed(1) + "%");
    }

    function harmonicTail(n) {
      const half = n / 2;
      let s = 0;
      for (let k = half + 1; k <= n; k += 1) s += 1 / k;
      return s;
    }

    function trial(n) {
      const p = shuffle(n);
      const seen = new Array(n).fill(false);
      for (let i = 0; i < n; i += 1) {
        if (seen[i]) continue;
        let len = 0;
        let x = i;
        while (!seen[x]) {
          seen[x] = true;
          len += 1;
          x = p[x];
        }
        if (len > n / 2) return false;
      }
      return true;
    }

    nInput.oninput = fresh;
    root.querySelector("[data-act=shuffle]").onclick = fresh;
    root.querySelector("[data-act=step]").onclick = () => {
      if (model.done) return;
      const cur = model.walk[model.walk.length - 1];
      const nxt = model.perm[cur];
      model.walk.push(nxt);
      if (nxt === 0 || model.walk.length > model.n / 2 + 1) model.done = true;
      draw();
    };
    root.querySelector("[data-act=mc]").onclick = () => {
      const n = model.n;
      let ok = 0;
      for (let i = 0; i < 1000; i += 1) if (trial(n)) ok += 1;
      model.rate = ok / 1000;
      draw();
    };
    fresh();
    draw();
  },

  fdr(root) {
    root.innerHTML = `
      <div class="viz-head">
        <h3>10 000 null p-values</h3>
        <div class="viz-controls">
          <button class="btn primary" data-act="draw">Resample</button>
          <label class="stat">BH q <input type="range" min="1" max="20" value="5" data-q /> <span data-qv>0.05</span></label>
          <span class="stat" data-stat></span>
        </div>
      </div>
      <div class="viz-stage">
        <canvas width="860" height="400"></canvas>
      </div>
      <p class="viz-caption">Histogram of uniform null p-values. Coral: uncorrected 0.05. Gold: Bonferroni. Mint: Benjamini–Hochberg line.</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const qInput = root.querySelector("[data-q]");
    const qv = root.querySelector("[data-qv]");
    const stat = root.querySelector("[data-stat]");
    const m = 10000;
    let ps = [];

    function resample() {
      ps = Array.from({ length: m }, () => Math.random()).sort((a, b) => a - b);
    }

    function bhK(q) {
      let kstar = 0;
      for (let k = 1; k <= m; k += 1) {
        if (ps[k - 1] <= (k / m) * q) kstar = k;
      }
      return kstar;
    }

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);
      const q = Number(qInput.value) / 100;
      qv.textContent = q.toFixed(2);
      const bins = 40;
      const counts = new Array(bins).fill(0);
      ps.forEach((p) => {
        counts[Math.min(bins - 1, Math.floor(p * bins))] += 1;
      });
      const maxC = Math.max(...counts);
      const left = 50;
      const top = 20;
      const bw = 520;
      const bh = 300;
      counts.forEach((c, i) => {
        const x = left + (i / bins) * bw;
        const barH = (c / maxC) * bh;
        ctx.fillStyle = i / bins < 0.05 ? "rgba(224,122,106,0.7)" : "#1b2333";
        ctx.fillRect(x + 1, top + bh - barH, bw / bins - 2, barH);
      });
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(left, top, bw, bh);

      function xOf(p) { return left + p * bw; }
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#e07a6a";
      ctx.beginPath();
      ctx.moveTo(xOf(0.05), top);
      ctx.lineTo(xOf(0.05), top + bh);
      ctx.stroke();
      ctx.strokeStyle = "#d4b15a";
      ctx.beginPath();
      ctx.moveTo(xOf(0.05 / m), top);
      ctx.lineTo(xOf(0.05 / m), top + bh);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ranked p-values, zoomed to the smallest 120
      const rx = 600;
      const yMax = 0.025;
      ctx.fillStyle = "#f3efe4";
      ctx.font = "13px 'IBM Plex Sans', sans-serif";
      ctx.fillText("smallest 120 p-values", rx, 36);
      ctx.fillStyle = "#a8b0c0";
      ctx.font = "11px 'IBM Plex Sans', sans-serif";
      ctx.fillText("scale 0–0.025", rx, 52);
      for (let i = 0; i < 120; i += 1) {
        const x = rx + i * 2;
        const yP = 330 - Math.min(yMax, ps[i]) / yMax * 250;
        const yBh = 330 - Math.min(yMax, ((i + 1) / m) * q) / yMax * 250;
        ctx.fillStyle = "#7aa2e3";
        ctx.fillRect(x, yP, 2, 2);
        ctx.fillStyle = "rgba(110,200,182,0.85)";
        ctx.fillRect(x, yBh, 2, 2);
      }

      const uncorr = ps.filter((p) => p <= 0.05).length;
      const bon = ps.filter((p) => p <= 0.05 / m).length;
      const k = bhK(q);
      ctx.fillStyle = "#a8b0c0";
      ctx.font = "13px 'IBM Plex Mono', monospace";
      ctx.fillText("uncorrected 0.05   rejections " + uncorr, 50, 360);
      ctx.fillText("Bonferroni 5e-6    rejections " + bon, 50, 380);
      ctx.fillText("BH q=" + q.toFixed(2) + "          rejections " + k, 360, 360);
      stat.textContent = "E[FP] at 0.05 = 500; this draw " + uncorr;
    }

    root.querySelector("[data-act=draw]").onclick = () => { resample(); draw(); };
    qInput.oninput = draw;
    resample();
    draw();
  },

  orderstats(root) {
    root.innerHTML = `
      <div class="viz-head">
        <h3>Beta(k, n−k+1)</h3>
        <div class="viz-controls">
          <label class="stat">n <input type="range" min="2" max="24" value="9" data-n /> <span data-nv>9</span></label>
          <label class="stat">k <input type="range" min="1" max="9" value="3" data-k /> <span data-kv>3</span></label>
          <button class="btn primary" data-act="sample">Draw sample</button>
        </div>
      </div>
      <div class="viz-stage">
        <canvas width="860" height="380"></canvas>
      </div>
      <p class="viz-caption">Gold ticks are one uniform sample of size n. The curve is the exact density of U(k). The mint line is k/(n+1).</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const nInput = root.querySelector("[data-n]");
    const kInput = root.querySelector("[data-k]");
    const nv = root.querySelector("[data-nv]");
    const kv = root.querySelector("[data-kv]");
    let sample = [];

    function logBeta(a, b) {
      return lgamma(a) + lgamma(b) - lgamma(a + b);
    }
    function lgamma(z) {
      const p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012,
        9.9843695780195716e-6, 1.5056327351493116e-7
      ];
      if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - lgamma(1 - z);
      z -= 1;
      let x = 0.99999999999980993;
      for (let i = 0; i < p.length; i += 1) x += p[i] / (z + i + 1);
      const t = z + p.length - 0.5;
      return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
    }
    function betaPdf(u, a, b) {
      if (u <= 0 || u >= 1) return 0;
      return Math.exp((a - 1) * Math.log(u) + (b - 1) * Math.log(1 - u) - logBeta(a, b));
    }

    function draw() {
      const n = Number(nInput.value);
      kInput.max = String(n);
      if (Number(kInput.value) > n) kInput.value = String(n);
      const k = Number(kInput.value);
      nv.textContent = String(n);
      kv.textContent = String(k);
      const a = k;
      const b = n - k + 1;
      const mean = k / (n + 1);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);
      const left = 50;
      const top = 20;
      const bw = 760;
      const bh = 280;
      const xs = [];
      let ymax = 0.1;
      for (let i = 1; i < 300; i += 1) {
        const u = i / 300;
        const y = betaPdf(u, a, b);
        xs.push({ u, y });
        if (y > ymax) ymax = y;
      }
      ctx.beginPath();
      xs.forEach((p, i) => {
        const x = left + p.u * bw;
        const y = top + bh - (p.y / ymax) * bh;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#7aa2e3";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#6ec8b6";
      ctx.beginPath();
      ctx.moveTo(left + mean * bw, top);
      ctx.lineTo(left + mean * bw, top + bh);
      ctx.stroke();
      ctx.setLineDash([]);

      if (sample.length === n) {
        const ordered = [...sample].sort((p, q) => p - q);
        ordered.forEach((u, i) => {
          ctx.beginPath();
          ctx.moveTo(left + u * bw, top + bh + 8);
          ctx.lineTo(left + u * bw, top + bh + 26);
          ctx.strokeStyle = i + 1 === k ? "#d4b15a" : "rgba(243,239,228,0.35)";
          ctx.lineWidth = i + 1 === k ? 3 : 1;
          ctx.stroke();
        });
        ctx.fillStyle = "#d4b15a";
        ctx.font = "12px 'IBM Plex Mono', monospace";
        ctx.fillText("U(k) = " + ordered[k - 1].toFixed(3), left + ordered[k - 1] * bw - 20, top + bh + 44);
      }

      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(left, top, bw, bh);
      ctx.fillStyle = "#a8b0c0";
      ctx.font = "13px 'IBM Plex Mono', monospace";
      ctx.fillText("E[U(k)] = k/(n+1) = " + mean.toFixed(3), 50, 360);
      ctx.fillText("Beta(" + a + ", " + b + ")", 360, 360);
    }

    nInput.oninput = draw;
    kInput.oninput = draw;
    root.querySelector("[data-act=sample]").onclick = () => {
      const n = Number(nInput.value);
      sample = Array.from({ length: n }, () => Math.random());
      draw();
    };
    draw();
  }
};

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
