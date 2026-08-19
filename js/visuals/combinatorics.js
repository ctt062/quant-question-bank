(() => {
  const { startLoop, wait, later, shuffle, harmonic } = window.Viz;

  function cyclesOf(perm) {
    const seen = new Array(perm.length).fill(false);
    const rings = [];
    for (let i = 0; i < perm.length; i += 1) {
      if (seen[i]) continue;
      const ring = [];
      let x = i;
      while (!seen[x]) {
        seen[x] = true;
        ring.push(x);
        x = perm[x];
      }
      rings.push(ring);
    }
    return rings;
  }

  Object.assign(window.Visuals, {
    fixedpoints(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Shuffle and count fixed points</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="4" max="12" value="8" data-n /></label>
            <button class="btn primary" data-act="shuffle">Shuffle</button>
            <button class="btn" data-act="many">200 shuffles</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="400"></canvas></div>
        <p class="viz-caption">Gold is a fixed point. Linearity gives E[X]=1 for every n. The running mean does not grow with n.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const stat = root.querySelector("[data-stat]");
      const model = { n: 8, perm: [], means: [], lastX: 0, busy: false };

      function fresh() {
        model.n = Number(nInput.value);
        model.perm = shuffle([...Array(model.n).keys()]);
        model.lastX = model.perm.filter((v, i) => v === i).length;
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const n = model.perm.length;
        for (let i = 0; i < n; i += 1) {
          const x = 40 + i * 70;
          const fix = model.perm[i] === i;
          ctx.fillStyle = fix ? "#d4b15a" : "#1b2333";
          ctx.fillRect(x, 50, 54, 70);
          ctx.strokeStyle = "rgba(243,239,228,0.25)";
          ctx.strokeRect(x, 50, 54, 70);
          ctx.fillStyle = fix ? "#0c1018" : "#f3efe4";
          ctx.font = "600 18px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(model.perm[i] + 1), x + 27, 80);
          ctx.fillStyle = "#a8b0c0";
          ctx.font = "12px 'IBM Plex Sans', sans-serif";
          ctx.fillText(String(i + 1), x + 27, 140);
        }
        ctx.fillStyle = "#f3efe4";
        ctx.font = "16px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText("fixed points this shuffle  X = " + model.lastX, 40, 190);

        const left = 40, top = 230, w = 780, h = 130;
        ctx.strokeStyle = "rgba(243,239,228,0.2)";
        ctx.strokeRect(left, top, w, h);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(110,200,182,0.8)";
        ctx.beginPath();
        const y1 = top + h - (1 / 4) * h;
        ctx.moveTo(left, y1);
        ctx.lineTo(left + w, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        if (model.means.length) {
          ctx.beginPath();
          model.means.forEach((m, i) => {
            const x = left + ((i + 1) / Math.max(model.means.length, 8)) * w;
            const y = top + h - (Math.min(m, 4) / 4) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = "#d4b15a";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        const mean = model.means.length ? model.means[model.means.length - 1] : 0;
        stat.textContent = model.means.length
          ? ("running mean " + mean.toFixed(2) + "  ·  target 1")
          : "target 1";
      }

      function record() {
        const x = model.lastX;
        const prev = model.means.length ? model.means[model.means.length - 1] : x;
        const n = model.means.length + 1;
        model.means.push(prev + (x - prev) / n);
        if (model.means.length > 80) model.means.shift();
      }

      nInput.oninput = () => { fresh(); model.means = []; };
      root.querySelector("[data-act=shuffle]").onclick = () => { fresh(); record(); };
      root.querySelector("[data-act=many]").onclick = () => {
        for (let i = 0; i < 200; i += 1) { fresh(); record(); }
      };
      root.querySelector("[data-act=reset]").onclick = () => { model.means = []; fresh(); };
      fresh();
      startLoop(draw);
      later(() => { for (let i = 0; i < 12; i += 1) { fresh(); record(); } }, 300);
    },

    cyclecount(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Permutation as rings</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="6" max="16" value="10" data-n /></label>
            <button class="btn primary" data-act="go">New permutation</button>
            <button class="btn" data-act="many">200</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">Each ring is a cycle. The mean number of rings tracks H_n.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const stat = root.querySelector("[data-stat]");
      const model = { n: 10, rings: [], hist: [], pulse: 0 };

      function fresh() {
        model.n = Number(nInput.value);
        const perm = shuffle([...Array(model.n).keys()]);
        model.rings = cyclesOf(perm);
        model.hist.push(model.rings.length);
        if (model.hist.length > 120) model.hist.shift();
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const rings = model.rings;
        rings.forEach((ring, ri) => {
          const cx = 120 + (ri % 4) * 200;
          const cy = 110 + Math.floor(ri / 4) * 160;
          const rr = 28 + ring.length * 4;
          ctx.strokeStyle = "#d4b15a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.stroke();
          ring.forEach((v, k) => {
            const a = (k / ring.length) * Math.PI * 2 - Math.PI / 2;
            ctx.fillStyle = "#f3efe4";
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0c1018";
            ctx.font = "700 10px 'IBM Plex Mono', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(v + 1), cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          });
        });
        const mean = model.hist.length ? model.hist.reduce((a, b) => a + b, 0) / model.hist.length : 0;
        const hn = harmonic(model.n);
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("C = " + rings.length + "     mean " + mean.toFixed(2) + "     H_n = " + hn.toFixed(2), 40, 400);
        stat.textContent = "mean " + mean.toFixed(2) + " vs H_n " + hn.toFixed(2);
      }

      nInput.oninput = () => { model.hist = []; fresh(); };
      root.querySelector("[data-act=go]").onclick = () => fresh();
      root.querySelector("[data-act=many]").onclick = () => { for (let i = 0; i < 200; i += 1) fresh(); };
      fresh();
      startLoop(draw);
      later(() => { for (let i = 0; i < 8; i += 1) fresh(); }, 280);
    },

    longestcycle(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Longest-cycle tail</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="8" max="40" step="2" value="20" data-n /></label>
            <button class="btn primary" data-act="go">Sample</button>
            <button class="btn" data-act="many">400 samples</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">Gold bar: longest cycle &gt; n/2. That event has probability H_n − H_{n/2}, and there is at most one such cycle.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const stat = root.querySelector("[data-stat]");
      const model = { n: 20, hist: [], lastL: 0, lastLong: false };

      function tail(n) { return harmonic(n) - harmonic(n / 2); }

      function sample() {
        model.n = Number(nInput.value);
        const perm = shuffle([...Array(model.n).keys()]);
        const rings = cyclesOf(perm);
        const L = Math.max(...rings.map((r) => r.length));
        model.lastL = L;
        model.lastLong = L > model.n / 2;
        model.hist[L] = (model.hist[L] || 0) + 1;
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const n = model.n;
        const total = model.hist.reduce((a, b) => a + (b || 0), 0);
        const maxH = Math.max(1, ...model.hist.filter(Boolean));
        const bw = 780 / n;
        for (let k = 1; k <= n; k += 1) {
          const h = ((model.hist[k] || 0) / maxH) * 260;
          const x = 40 + (k - 1) * bw;
          ctx.fillStyle = k > n / 2 ? "#d4b15a" : "#7aa2e3";
          ctx.fillRect(x, 320 - h, Math.max(2, bw - 1), h);
        }
        ctx.strokeStyle = "rgba(224,122,106,0.7)";
        ctx.setLineDash([4, 4]);
        const xh = 40 + (n / 2) * bw;
        ctx.beginPath();
        ctx.moveTo(xh, 40);
        ctx.lineTo(xh, 320);
        ctx.stroke();
        ctx.setLineDash([]);
        const long = model.hist.reduce((a, b, k) => a + (k > n / 2 ? (b || 0) : 0), 0);
        const emp = total ? long / total : 0;
        ctx.fillStyle = "#f3efe4";
        ctx.font = "15px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText("this L = " + model.lastL + (model.lastLong ? "  (long)" : ""), 40, 360);
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("P(L > n/2)  empirical " + emp.toFixed(3) + "   theory " + tail(n).toFixed(3), 40, 386);
        stat.textContent = total ? (emp.toFixed(3) + " vs " + tail(n).toFixed(3)) : tail(n).toFixed(3);
      }

      nInput.oninput = () => { model.hist = []; sample(); };
      root.querySelector("[data-act=go]").onclick = () => sample();
      root.querySelector("[data-act=many]").onclick = () => { for (let i = 0; i < 400; i += 1) sample(); };
      sample();
      startLoop(draw);
      later(() => { for (let i = 0; i < 80; i += 1) sample(); }, 250);
    }
  });
})();
