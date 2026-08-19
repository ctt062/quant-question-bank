(() => {
  const { lerp, easeOut, startLoop, tween, wait, later } = window.Viz;

  Object.assign(window.Visuals, {
    samehalf(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Stick and unit square</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="one">Drop two points</button>
            <button class="btn" data-act="rain">Rain 400</button>
            <button class="btn" data-act="clear">Clear</button>
            <span class="stat" data-stat>0 / 0</span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">Gold squares are both-left and both-right. Their area is 1/2. This is not the broken-stick triangle.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const samples = [];
      const stick = { u: 0.2, v: 0.7, t: 1 };

      function ok(u, v) {
        return (u <= 0.5 && v <= 0.5) || (u >= 0.5 && v >= 0.5);
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const s0 = 40, sw = 360, sy = 70;
        ctx.strokeStyle = "#f3efe4";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(s0, sy);
        ctx.lineTo(s0 + sw, sy);
        ctx.stroke();
        ctx.strokeStyle = "rgba(212,177,90,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s0 + sw / 2, sy - 18);
        ctx.lineTo(s0 + sw / 2, sy + 18);
        ctx.stroke();
        const uu = lerp(0, stick.u, stick.t);
        const vv = lerp(0, stick.v, stick.t);
        [[uu, "#d4b15a"], [vv, "#6ec8b6"]].forEach(([p, c]) => {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(s0 + p * sw, sy, 8, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = "#a8b0c0";
        ctx.font = "13px 'IBM Plex Sans', sans-serif";
        ctx.fillText("left half                 right half", s0, sy + 36);

        const L = 460, T = 40, S = 300;
        ctx.fillStyle = "rgba(212,177,90,0.16)";
        ctx.fillRect(L, T + S / 2, S / 2, S / 2);
        ctx.fillRect(L + S / 2, T, S / 2, S / 2);
        ctx.strokeStyle = "rgba(243,239,228,0.3)";
        ctx.strokeRect(L, T, S, S);
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(L + S / 2, T);
        ctx.lineTo(L + S / 2, T + S);
        ctx.moveTo(L, T + S / 2);
        ctx.lineTo(L + S, T + S / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        samples.forEach((pt) => {
          ctx.fillStyle = pt.ok ? "#d4b15a" : "#7aa2e3";
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(L + pt.u * S, T + (1 - pt.v) * S, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.fillStyle = "#a8b0c0";
        ctx.fillText("U →", L + S - 30, T + S + 22);
        ctx.fillText("V ↑", L - 28, T + 14);
        const n = samples.length;
        const hits = samples.filter((s) => s.ok).length;
        stat.textContent = n ? (hits + " / " + n + "  =  " + (hits / n).toFixed(3)) : "0 / 0";
      }

      async function one() {
        const u = Math.random();
        const v = Math.random();
        stick.u = u;
        stick.v = v;
        stick.t = 0;
        await tween(280, (t) => { stick.t = easeOut(t); });
        samples.push({ u, v, ok: ok(u, v) });
      }

      root.querySelector("[data-act=one]").onclick = () => one();
      root.querySelector("[data-act=rain]").onclick = () => {
        for (let i = 0; i < 400; i += 1) {
          const u = Math.random(), v = Math.random();
          samples.push({ u, v, ok: ok(u, v) });
        }
      };
      root.querySelector("[data-act=clear]").onclick = () => { samples.length = 0; };
      startLoop(draw);
      later(() => one(), 350);
    },

    buffon(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Needles on ruled paper</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="drop">Drop 1</button>
            <button class="btn" data-act="many">Drop 200</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">L = D here, so the crossing probability is 2/π ≈ 0.637. Gold needles crossed a line.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const D = 56;
      const L = 56;
      const needles = [];
      const theory = (2 * L) / (Math.PI * D);

      function dropOne() {
        const x = 40 + Math.random() * 780;
        const y = 40 + Math.random() * 320;
        const th = Math.random() * Math.PI;
        const dx = (L / 2) * Math.cos(th);
        const dy = (L / 2) * Math.sin(th);
        const y1 = y - dy, y2 = y + dy;
        const line = (v) => Math.floor(v / D);
        const cross = line(y1) !== line(y2);
        needles.push({ x, y, th, cross, born: 1 });
        return cross;
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(243,239,228,0.18)";
        ctx.lineWidth = 1;
        for (let y = 0; y < canvas.height; y += D) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        needles.forEach((n) => {
          const dx = (L / 2) * Math.cos(n.th);
          const dy = (L / 2) * Math.sin(n.th);
          ctx.strokeStyle = n.cross ? "#d4b15a" : "#7aa2e3";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(n.x - dx, n.y - dy);
          ctx.lineTo(n.x + dx, n.y + dy);
          ctx.stroke();
        });
        const n = needles.length;
        const hits = needles.filter((x) => x.cross).length;
        const rate = n ? hits / n : 0;
        stat.textContent = n
          ? (hits + "/" + n + " = " + rate.toFixed(3) + "   theory " + theory.toFixed(3))
          : ("theory " + theory.toFixed(3));
      }

      root.querySelector("[data-act=drop]").onclick = () => dropOne();
      root.querySelector("[data-act=many]").onclick = () => { for (let i = 0; i < 200; i += 1) dropOne(); };
      root.querySelector("[data-act=reset]").onclick = () => { needles.length = 0; };
      startLoop(draw);
      later(() => { for (let i = 0; i < 40; i += 1) dropOne(); }, 300);
    }
  });
})();
