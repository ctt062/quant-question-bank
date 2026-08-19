(() => {
  const { startLoop, wait, later } = window.Viz;

  Object.assign(window.Visuals, {
    medical(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>10,000 people, one test</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="pour">Pour the town</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">99 true positives and 99 false positives. Among positives, the disease is a coin flip, not 99%.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = { tp: 0, fp: 0, tn: 0, fn: 0, shown: 0, busy: false, target: 10000 };

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const boxes = [
          { k: "tp", label: "true +", x: 80, color: "#d4b15a", n: model.tp },
          { k: "fp", label: "false +", x: 280, color: "#e07a6a", n: model.fp },
          { k: "fn", label: "false −", x: 480, color: "#7aa2e3", n: model.fn },
          { k: "tn", label: "true −", x: 680, color: "#1b2333", n: model.tn }
        ];
        boxes.forEach((b) => {
          const h = Math.min(240, b.n / 40);
          ctx.fillStyle = b.color === "#1b2333" ? "#243044" : b.color;
          ctx.fillRect(b.x, 300 - h, 120, h);
          ctx.strokeStyle = "rgba(243,239,228,0.25)";
          ctx.strokeRect(b.x, 60, 120, 240);
          ctx.fillStyle = "#f3efe4";
          ctx.font = "14px 'IBM Plex Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(b.label, b.x + 60, 330);
          ctx.fillText(String(b.n), b.x + 60, 352);
        });
        const pos = model.tp + model.fp;
        const ppv = pos ? model.tp / pos : 0;
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("P(D | +) = " + model.tp + " / " + pos + " = " + (pos ? ppv.toFixed(3) : "-"), 80, 390);
        stat.textContent = pos ? ("PPV " + ppv.toFixed(3) + "  vs  0.500") : "ready";
      }

      async function pour() {
        if (model.busy) return;
        model.busy = true;
        model.tp = model.fp = model.tn = model.fn = 0;
        const people = [];
        for (let i = 0; i < 100; i += 1) people.push(Math.random() < 0.99 ? "tp" : "fn");
        for (let i = 0; i < 9900; i += 1) people.push(Math.random() < 0.01 ? "fp" : "tn");
        for (let i = 0; i < people.length; i += 1) {
          model[people[i]] += 1;
          if (i % 80 === 0) await wait(8);
        }
        model.busy = false;
      }

      root.querySelector("[data-act=pour]").onclick = () => pour();
      root.querySelector("[data-act=reset]").onclick = () => {
        model.tp = model.fp = model.tn = model.fn = 0;
      };
      startLoop(draw);
      later(() => pour(), 350);
    },

    sampling(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Parent vs means</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="2" max="40" value="10" data-n /></label>
            <button class="btn primary" data-act="draw">Draw samples</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">Left: parent N(0,1). Right: histogram of sample means. Width tracks 1/√n, not 1/n.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const stat = root.querySelector("[data-stat]");
      const model = { n: 10, parent: [], means: [] };

      function gauss() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      }

      function hist(arr, bins, lo, hi) {
        const h = new Array(bins).fill(0);
        arr.forEach((x) => {
          const i = Math.min(bins - 1, Math.max(0, Math.floor((x - lo) / (hi - lo) * bins)));
          h[i] += 1;
        });
        return h;
      }

      function barChart(h, x0, y0, w, ht, color) {
        const max = Math.max(1, ...h);
        const bw = w / h.length;
        h.forEach((v, i) => {
          const bh = (v / max) * ht;
          ctx.fillStyle = color;
          ctx.fillRect(x0 + i * bw, y0 + ht - bh, Math.max(1, bw - 1), bh);
        });
      }

      function resample() {
        model.n = Number(nInput.value);
        model.parent = [];
        model.means = [];
        for (let i = 0; i < 400; i += 1) model.parent.push(gauss());
        for (let i = 0; i < 400; i += 1) {
          let s = 0;
          for (let j = 0; j < model.n; j += 1) s += gauss();
          model.means.push(s / model.n);
        }
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const lo = -3, hi = 3, bins = 24;
        barChart(hist(model.parent, bins, lo, hi), 40, 60, 360, 240, "#7aa2e3");
        barChart(hist(model.means, bins, lo, hi), 460, 60, 360, 240, "#d4b15a");
        ctx.strokeStyle = "rgba(243,239,228,0.2)";
        ctx.strokeRect(40, 60, 360, 240);
        ctx.strokeRect(460, 60, 360, 240);
        ctx.fillStyle = "#a8b0c0";
        ctx.font = "14px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("parent  σ = 1", 220, 330);
        ctx.fillText("means  SE = 1/√n = " + (1 / Math.sqrt(model.n)).toFixed(3), 640, 330);
        const emp = model.means.length
          ? Math.sqrt(model.means.reduce((a, x) => a + x * x, 0) / model.means.length)
          : 0;
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("empirical SD of means " + emp.toFixed(3), 40, 370);
        stat.textContent = "SE " + (1 / Math.sqrt(model.n)).toFixed(3) + "  emp " + emp.toFixed(3);
      }

      nInput.oninput = () => resample();
      root.querySelector("[data-act=draw]").onclick = () => resample();
      root.querySelector("[data-act=reset]").onclick = () => { model.parent = []; model.means = []; resample(); };
      resample();
      startLoop(draw);
    }
  });
})();
