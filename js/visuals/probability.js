(() => {
  const { now, clamp, lerp, easeOut, easeOutBack, startLoop, tween, wait, later, drawDie } = window.Viz;

  Object.assign(window.Visuals, {
    firstsix(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Roll until 6</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="play">Play a trial</button>
            <button class="btn" data-act="many">200 trials</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat>mean -</span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="400"></canvas></div>
        <p class="viz-caption">Each trial counts rolls until the first 6. The running mean walks toward 6, not toward 3.5.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = {
        face: 1, rot: 0, busy: false, waiting: 0, lastT: 0,
        trials: [], pulse: 0
      };

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawDie(ctx, 130, 150, 110, model.face, model.rot);
        ctx.fillStyle = "#f3efe4";
        ctx.font = "600 18px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText("this trial  " + model.waiting + " rolls", 220, 80);
        if (model.lastT) ctx.fillText("last T = " + model.lastT, 220, 108);

        const left = 60, top = 250, w = 740, h = 110;
        ctx.strokeStyle = "rgba(243,239,228,0.2)";
        ctx.strokeRect(left, top, w, h);
        const mean = model.trials.length ? model.trials.reduce((a, b) => a + b, 0) / model.trials.length : 0;
        const ymax = Math.max(12, ...model.trials, 6);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(110,200,182,0.8)";
        ctx.beginPath();
        const y6 = top + h - (6 / ymax) * h;
        ctx.moveTo(left, y6);
        ctx.lineTo(left + w, y6);
        ctx.stroke();
        ctx.setLineDash([]);
        if (model.trials.length) {
          ctx.beginPath();
          model.trials.forEach((v, i) => {
            const x = left + ((i + 1) / Math.max(model.trials.length, 8)) * w;
            const y = top + h - (v / ymax) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = "#d4b15a";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.fillStyle = "#a8b0c0";
        ctx.font = "12px 'IBM Plex Sans', sans-serif";
        ctx.fillText("running mean of T  ·  mint line is 6", left, 378);
        stat.textContent = model.trials.length
          ? ("mean " + mean.toFixed(2) + "  ·  n=" + model.trials.length)
          : "mean -";
      }

      async function oneTrial() {
        if (model.busy) return;
        model.busy = true;
        model.waiting = 0;
        let face = 1;
        while (face !== 6) {
          model.waiting += 1;
          for (let k = 0; k < 8; k += 1) {
            face = 1 + Math.floor(Math.random() * 6);
            model.face = face;
            model.rot = (Math.random() - 0.5) * 0.6;
            await wait(28);
          }
          model.rot = 0;
          await wait(80);
        }
        model.lastT = model.waiting;
        model.trials.push(model.lastT);
        if (model.trials.length > 80) model.trials.shift();
        model.busy = false;
      }

      function many() {
        if (model.busy) return;
        for (let i = 0; i < 200; i += 1) {
          let t = 0, f = 0;
          while (f !== 6) { t += 1; f = 1 + Math.floor(Math.random() * 6); }
          model.trials.push(t);
        }
        if (model.trials.length > 80) model.trials = model.trials.slice(-80);
        model.lastT = model.trials[model.trials.length - 1];
        model.face = 6;
      }

      root.querySelector("[data-act=play]").onclick = () => oneTrial();
      root.querySelector("[data-act=many]").onclick = () => many();
      root.querySelector("[data-act=reset]").onclick = () => {
        if (model.busy) return;
        model.trials = [];
        model.waiting = 0;
        model.lastT = 0;
        model.face = 1;
      };
      startLoop(draw);
      later(() => oneTrial(), 400);
    },

    coupon(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Album fill</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="4" max="16" value="8" data-n /></label>
            <button class="btn primary" data-act="play">Collect</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">Gold slots are held. The remaining wait for a new type is geometric with mean n / (n − held).</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const stat = root.querySelector("[data-stat]");
      const model = { n: 8, held: [], waits: [], packs: 0, busy: false, flash: -1 };

      function theory(n) {
        let s = 0;
        for (let i = 1; i <= n; i += 1) s += n / i;
        return s;
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const n = model.n;
        const cols = Math.min(n, 8);
        const size = 56;
        for (let i = 0; i < n; i += 1) {
          const x = 40 + (i % cols) * 70;
          const y = 40 + Math.floor(i / cols) * 70;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x, y, size, size, 8) : ctx.rect(x, y, size, size);
          const on = model.held.includes(i);
          ctx.fillStyle = on ? (model.flash === i ? "#f0d789" : "#d4b15a") : "#1b2333";
          ctx.fill();
          ctx.strokeStyle = "rgba(243,239,228,0.25)";
          ctx.stroke();
          ctx.fillStyle = on ? "#0c1018" : "#a8b0c0";
          ctx.font = "600 16px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(i + 1), x + size / 2, y + size / 2);
        }
        ctx.fillStyle = "#f3efe4";
        ctx.font = "16px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText(model.held.length + " / " + n + " types   packs " + model.packs, 40, 300);
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("E[T] = n H_n = " + theory(n).toFixed(2), 40, 324);
        const p = (n - model.held.length) / n;
        if (model.held.length < n) {
          ctx.fillStyle = "#d4b15a";
          ctx.fillText("next new coupon mean " + (1 / p).toFixed(2) + " packs", 40, 346);
        }
        stat.textContent = model.held.length === n ? ("done in " + model.packs) : (model.packs + " packs");
      }

      async function play() {
        if (model.busy) return;
        model.busy = true;
        model.held = [];
        model.packs = 0;
        while (model.held.length < model.n) {
          const c = Math.floor(Math.random() * model.n);
          model.packs += 1;
          model.flash = c;
          if (!model.held.includes(c)) model.held.push(c);
          await wait(model.n > 10 ? 40 : 70);
        }
        model.flash = -1;
        model.busy = false;
      }

      nInput.oninput = () => {
        if (model.busy) return;
        model.n = Number(nInput.value);
        model.held = [];
        model.packs = 0;
      };
      root.querySelector("[data-act=play]").onclick = () => play();
      root.querySelector("[data-act=reset]").onclick = () => {
        if (model.busy) return;
        model.held = [];
        model.packs = 0;
      };
      startLoop(draw);
      later(() => play(), 400);
    }
  });
})();
