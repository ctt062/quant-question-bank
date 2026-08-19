(() => {
  const {
    now, clamp, lerp, easeOut, easeInOut, easeOutBack,
    startLoop, tween, wait, later, roundRect, drawCoin
  } = window.Viz;

  Object.assign(window.Visuals, {
    hthhhh(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>State walk</h3>
          <div class="viz-controls">
            <button class="btn" data-act="flip">Flip once</button>
            <button class="btn primary" data-act="run">Play until done</button>
            <button class="btn" data-act="reset">Reset</button>
            <button class="btn" data-act="mc">200 trials</button>
          </div>
        </div>
        <div class="viz-stage">
          <canvas width="860" height="440"></canvas>
        </div>
        <p class="viz-caption" data-cap>The gold chip slides with each flip. HTH recycles a trailing H; HHH dies on the first T.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const cap = root.querySelector("[data-cap]");
      const state = {
        pattern: "HTH",
        node: 0,
        chipX: 90,
        chipY: 230,
        flips: 0,
        seq: "",
        done: false,
        busy: false,
        coin: { face: "H", flip: 0, show: 0 },
        means: { HTH: null, HHH: null },
        hist: [],
        histMax: 1,
        pulse: 0
      };
      const layouts = {
        HTH: [
          { id: "∅", x: 90, y: 230 },
          { id: "H", x: 300, y: 230 },
          { id: "HT", x: 520, y: 230 },
          { id: "HTH", x: 740, y: 230 }
        ],
        HHH: [
          { id: "∅", x: 90, y: 230 },
          { id: "H", x: 300, y: 230 },
          { id: "HH", x: 520, y: 230 },
          { id: "HHH", x: 740, y: 230 }
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

      function draw(t) {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, w, h);
        const nodes = layouts[state.pattern];

        ["HTH", "HHH"].forEach((p, i) => {
          const x = 40 + i * 120;
          const on = state.pattern === p;
          ctx.beginPath();
          roundRect(ctx, x, 16, 100, 32, 8);
          ctx.fillStyle = on ? "#d4b15a" : "#1b2333";
          ctx.fill();
          ctx.fillStyle = on ? "#0c1018" : "#f3efe4";
          ctx.font = "600 14px 'IBM Plex Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(p, x + 50, 37);
        });

        nodes.slice(0, -1).forEach((a, i) => {
          const b = nodes[i + 1];
          ctx.strokeStyle = "rgba(212,177,90,0.35)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x + 36, a.y);
          ctx.lineTo(b.x - 36, b.y);
          ctx.stroke();
        });

        ctx.strokeStyle = "rgba(224,122,106,0.55)";
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(nodes[2].x, nodes[2].y + 36);
        ctx.bezierCurveTo(nodes[2].x - 80, nodes[2].y + 120, nodes[0].x + 80, nodes[0].y + 120, nodes[0].x, nodes[0].y + 36);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(224,122,106,0.85)";
        ctx.font = "12px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(state.pattern === "HTH" ? "T from HT resets" : "T from H or HH resets", 400, 380);

        nodes.forEach((n, i) => {
          const glow = i === state.node ? 6 + 3 * Math.sin((t || 0) / 180) : 0;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 34 + glow * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = i === 3 ? "#16302b" : "#1b2333";
          ctx.fill();
          ctx.strokeStyle = i === 3 ? "#6ec8b6" : "rgba(212,177,90,0.4)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#f3efe4";
          ctx.font = "600 16px 'Source Serif 4', serif";
          ctx.textAlign = "center";
          ctx.fillText(n.id, n.x, n.y + 5);
        });

        ctx.beginPath();
        ctx.arc(state.chipX, state.chipY, 16, 0, Math.PI * 2);
        ctx.fillStyle = "#d4b15a";
        ctx.fill();
        ctx.shadowColor = "rgba(212,177,90,0.65)";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (state.coin.show > 0.01) {
          ctx.globalAlpha = state.coin.show;
          drawCoin(ctx, 430, 92, 28, state.coin.face, state.coin.flip);
          ctx.globalAlpha = 1;
        }

        if (state.hist.length) {
          const maxH = Math.max(1, ...state.hist);
          state.hist.forEach((c, i) => {
            const x = 40 + i * 7;
            const bh = (c / maxH) * 46 * state.histMax;
            ctx.fillStyle = "rgba(110,200,182,0.55)";
            ctx.fillRect(x, 430 - bh, 5, bh);
          });
        }

        ctx.fillStyle = "#a8b0c0";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("flips  " + state.flips, 40, 418);
        ctx.fillText("seq    " + (state.seq.slice(-28) || "—"), 200, 418);
        ctx.textAlign = "right";
        ctx.fillStyle = "#6ec8b6";
        const m1 = state.means.HTH == null ? "—" : state.means.HTH.toFixed(2);
        const m2 = state.means.HHH == null ? "—" : state.means.HHH.toFixed(2);
        ctx.fillText("MC mean HTH " + m1 + "  (10)", 820, 38);
        ctx.fillText("MC mean HHH " + m2 + "  (14)", 820, 58);
      }

      async function moveChip(from, to) {
        const nodes = layouts[state.pattern];
        const A = nodes[from];
        const B = nodes[to];
        const reset = to < from && !(from === 1 && to === 1);
        await tween(380, (u) => {
          const e = easeInOut(u);
          if (reset && from === 2 && to === 0) {
            const c1x = A.x - 80;
            const c1y = A.y + 120;
            const c2x = B.x + 80;
            const c2y = B.y + 120;
            const omt = 1 - e;
            state.chipX = omt * omt * omt * A.x + 3 * omt * omt * e * c1x + 3 * omt * e * e * c2x + e * e * e * B.x;
            state.chipY = omt * omt * omt * A.y + 3 * omt * omt * e * c1y + 3 * omt * e * e * c2y + e * e * e * B.y;
          } else {
            state.chipX = lerp(A.x, B.x, e);
            state.chipY = lerp(A.y, B.y, e);
          }
        });
        state.chipX = B.x;
        state.chipY = B.y;
      }

      async function flipOnce() {
        if (state.done || state.busy) return;
        state.busy = true;
        const face = Math.random() < 0.5 ? "H" : "T";
        state.coin.face = face;
        state.coin.show = 1;
        state.coin.flip = 0;
        await tween(420, (u) => { state.coin.flip = u; });
        const from = state.node;
        const to = nextState(state.pattern, from, face);
        state.seq += face;
        state.flips += 1;
        state.node = to;
        await moveChip(from, to);
        await tween(180, (u) => { state.coin.show = 1 - u; });
        if (to === 3) {
          state.done = true;
          cap.textContent = state.pattern + " appeared in " + state.flips + " flips.";
        }
        state.busy = false;
      }

      async function playRun() {
        if (state.busy) return;
        while (!state.done) {
          await flipOnce();
          if (state.flips > 80) break;
        }
      }

      async function playMC() {
        if (state.busy) return;
        state.busy = true;
        const n = 200;
        const hist = new Array(36).fill(0);
        let acc = 0;
        for (let i = 0; i < n; i += 1) {
          const v = trial(state.pattern);
          acc += v;
          hist[Math.min(hist.length - 1, v)] += 1;
          if (i % 8 === 0) {
            state.hist = hist.slice();
            state.means[state.pattern] = acc / (i + 1);
            state.histMax = 0.2 + 0.8 * ((i + 1) / n);
            await wait(16);
          }
        }
        state.hist = hist;
        state.histMax = 1;
        state.means[state.pattern] = acc / n;
        cap.textContent = n + " trials of " + state.pattern + ": mean " + state.means[state.pattern].toFixed(2) + ".";
        state.busy = false;
      }

      function resetWalk() {
        state.node = 0;
        state.chipX = layouts[state.pattern][0].x;
        state.chipY = layouts[state.pattern][0].y;
        state.flips = 0;
        state.seq = "";
        state.done = false;
        state.coin.show = 0;
        cap.textContent = "Reset. Play until the chip reaches the absorbing pattern.";
      }

      root.querySelector("[data-act=flip]").onclick = () => { flipOnce(); };
      root.querySelector("[data-act=run]").onclick = () => { playRun(); };
      root.querySelector("[data-act=reset]").onclick = resetWalk;
      root.querySelector("[data-act=mc]").onclick = () => { playMC(); };
      canvas.addEventListener("click", (ev) => {
        if (state.busy) return;
        const r = canvas.getBoundingClientRect();
        const x = (ev.clientX - r.left) * (canvas.width / r.width);
        const y = (ev.clientY - r.top) * (canvas.height / r.height);
        if (y < 55 && x > 40 && x < 140) state.pattern = "HTH";
        if (y < 55 && x > 160 && x < 260) state.pattern = "HHH";
        resetWalk();
      });
      startLoop(draw);
      resetWalk();
      later(() => { playRun(); }, 500);
    },

    stick(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Sample space and stick</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="one">Break once</button>
            <button class="btn" data-act="many">Rain 400</button>
            <button class="btn" data-act="clear">Clear</button>
            <span class="stat" data-stat>0 / 0</span>
          </div>
        </div>
        <div class="viz-stage">
          <canvas width="860" height="440"></canvas>
        </div>
        <p class="viz-caption">The stick splits, then the pieces try to close a triangle. Gold in the (x, y) plane is the 1/4-probability region.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const samples = [];
      const model = {
        phase: 0,
        cuts: [0.33, 0.66],
        ok: false,
        pieces: [0.33, 0.33, 0.34],
        split: 0,
        tri: 0,
        blade: 0,
        busy: false
      };

      function samplePair() {
        const u = Math.random();
        const v = Math.random();
        const x = Math.min(u, v);
        const y = Math.max(u, v);
        const ok = x < 0.5 && y > 0.5 && (y - x) < 0.5;
        return { x, y, ok, born: now(), r: 0 };
      }

      function mapPt(x, y) {
        return { px: 70 + x * 260, py: 340 - y * 260 };
      }

      function trianglePts(a, b, c, ox, oy, scale) {
        const x = (a * a + b * b - c * c) / (2 * a);
        const y = Math.sqrt(Math.max(0, b * b - x * x));
        return [
          { x: ox, y: oy },
          { x: ox + a * scale, y: oy },
          { x: ox + x * scale, y: oy - y * scale }
        ];
      }

      function draw(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        ctx.fillStyle = "rgba(212,177,90,0.22)";
        ctx.fill();
        ctx.strokeStyle = "#d4b15a";
        ctx.stroke();

        const tt = t || now();
        samples.forEach((s) => {
          const age = (tt - s.born) / 400;
          const pop = easeOutBack(clamp(age, 0, 1));
          const p = mapPt(s.x, s.y);
          ctx.beginPath();
          ctx.arc(p.px, p.py, 2.2 * pop, 0, Math.PI * 2);
          ctx.fillStyle = s.ok ? "#6ec8b6" : "#e07a6a";
          ctx.fill();
        });

        ctx.fillStyle = "#a8b0c0";
        ctx.font = "12px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("x →", 200, 372);
        ctx.fillStyle = "#d4b15a";
        ctx.fillText("favorable", 214, 214);

        const sx = 430;
        const sy = 78;
        const sw = 390;
        ctx.fillStyle = "#f3efe4";
        ctx.font = "600 16px 'Source Serif 4', serif";
        ctx.fillText("Unit stick", sx, 48);

        const cols = model.ok ? ["#6ec8b6", "#d4b15a", "#7aa2e3"] : ["#e07a6a", "#b4534a", "#8a3d36"];
        const xs = [0, model.cuts[0], model.cuts[1], 1];
        const gap = 10 * model.split;
        let acc = 0;
        for (let i = 0; i < 3; i += 1) {
          const len = (xs[i + 1] - xs[i]) * sw;
          const x = sx + acc + i * gap;
          ctx.fillStyle = cols[i];
          roundRect(ctx, x, sy, Math.max(4, len), 26, 6);
          ctx.fill();
          acc += len;
        }
        if (model.blade > 0) {
          model.cuts.forEach((cut, i) => {
            const x = sx + cut * sw;
            const y = sy - 40 + 40 * model.blade + (i === 1 ? 8 : 0);
            ctx.fillStyle = "#f3efe4";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 7, y - 18);
            ctx.lineTo(x - 7, y - 18);
            ctx.fill();
          });
        }

        const pieces = model.pieces;
        if (model.tri > 0.01 && model.ok) {
          const dest = trianglePts(pieces[0], pieces[2], pieces[1], sx + 40, 360, 280);
          const base = [
            { x: sx, y: 170 },
            { x: sx + pieces[0] * 280, y: 170 },
            { x: sx, y: 230 }
          ];
          const e = easeOut(model.tri);
          const p0 = { x: lerp(base[0].x, dest[0].x, e), y: lerp(base[0].y, dest[0].y, e) };
          const p1 = { x: lerp(base[1].x, dest[1].x, e), y: lerp(base[1].y, dest[1].y, e) };
          const p2 = { x: lerp(sx + pieces[0] * 280, dest[2].x, e), y: lerp(230, dest[2].y, e) };
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();
          ctx.fillStyle = "rgba(110,200,182,0.28)";
          ctx.fill();
          ctx.strokeStyle = "#6ec8b6";
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          pieces.forEach((len, i) => {
            const y = 168 + i * 52 + (model.ok ? 0 : Math.sin((t || 0) / 50 + i) * 2 * model.split);
            ctx.fillStyle = cols[i];
            roundRect(ctx, sx, y, Math.max(8, len * 360), 20, 5);
            ctx.fill();
            ctx.fillStyle = "#f3efe4";
            ctx.font = "12px 'IBM Plex Mono', monospace";
            ctx.fillText("piece " + (i + 1) + "  " + len.toFixed(3) + (len < 0.5 ? "  < 1/2" : "  ≥ 1/2"), sx + Math.max(8, len * 360) + 10, y + 15);
          });
        }

        ctx.fillStyle = model.ok ? "#6ec8b6" : "#e07a6a";
        ctx.font = "600 16px 'Source Serif 4', serif";
        if (samples.length) ctx.fillText(model.ok ? "forms a triangle" : "no triangle", sx, 410);

        const ok = samples.filter((s) => s.ok).length;
        stat.textContent = ok + " / " + samples.length + (samples.length ? "  =  " + (ok / samples.length).toFixed(3) : "");
      }

      async function breakOnce() {
        if (model.busy) return;
        model.busy = true;
        const s = samplePair();
        model.cuts = [s.x, s.y];
        model.ok = s.ok;
        model.pieces = [s.x, s.y - s.x, 1 - s.y];
        model.split = 0;
        model.tri = 0;
        model.blade = 0;
        await tween(280, (u) => { model.blade = u; });
        await tween(420, (u) => { model.split = easeOut(u); });
        samples.push(s);
        if (s.ok) await tween(700, (u) => { model.tri = u; });
        else await tween(420, () => {});
        model.blade = 0;
        model.busy = false;
      }

      async function rain() {
        if (model.busy) return;
        model.busy = true;
        for (let i = 0; i < 400; i += 1) {
          samples.push(samplePair());
          if (i % 10 === 0) await wait(16);
        }
        const last = samples[samples.length - 1];
        model.cuts = [last.x, last.y];
        model.ok = last.ok;
        model.pieces = [last.x, last.y - last.x, 1 - last.y];
        model.split = 1;
        model.tri = last.ok ? 1 : 0;
        model.busy = false;
      }

      root.querySelector("[data-act=one]").onclick = () => { breakOnce(); };
      root.querySelector("[data-act=many]").onclick = () => { rain(); };
      root.querySelector("[data-act=clear]").onclick = () => {
        if (model.busy) return;
        samples.length = 0;
        model.split = 0;
        model.tri = 0;
      };
      startLoop(draw);
      later(() => { breakOnce(); }, 400);
    },

    circle(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Throw until no empty semicircle</h3>
          <div class="viz-controls">
            <button class="btn" data-act="throw">Throw one</button>
            <button class="btn primary" data-act="cover">Play covering</button>
            <button class="btn" data-act="reset">Reset</button>
            <button class="btn" data-act="mc">200 coverings</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage">
          <canvas width="860" height="420"></canvas>
        </div>
        <p class="viz-caption">Points fly onto the circle. The coral arc is the live maximum gap; it turns mint when the circle is covered.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = {
        pts: [],
        mean: null,
        busy: false,
        flash: 0,
        gapFrom: 0,
        gapLen: 1,
        sweep: 0
      };

      function maxGap(points) {
        if (!points.length) return { gap: 1, from: 0 };
        const s = [...points].map((p) => p.th).sort((a, b) => a - b);
        let gap = 1 - s[s.length - 1] + s[0];
        let from = s[s.length - 1];
        for (let i = 1; i < s.length; i += 1) {
          const g = s[i] - s[i - 1];
          if (g > gap) { gap = g; from = s[i - 1]; }
        }
        return { gap, from };
      }

      function covered() {
        return model.pts.length >= 3 && maxGap(model.pts).gap <= 0.5;
      }

      function trial() {
        const p = [];
        const gapOf = (arr) => {
          if (!arr.length) return 1;
          const s = [...arr].sort((a, b) => a - b);
          let g = 1 - s[s.length - 1] + s[0];
          for (let i = 1; i < s.length; i += 1) g = Math.max(g, s[i] - s[i - 1]);
          return g;
        };
        while (!(p.length >= 3 && gapOf(p) <= 0.5) && p.length < 40) p.push(Math.random());
        return p.length;
      }

      function draw(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = 230;
        const cy = 210;
        const r = 140;
        const mg = maxGap(model.pts);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(243,239,228,0.16)";
        ctx.lineWidth = 12;
        ctx.stroke();

        ctx.strokeStyle = mg.gap > 0.5 ? "#e07a6a" : "#6ec8b6";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r, model.gapFrom * 2 * Math.PI, (model.gapFrom + model.gapLen) * 2 * Math.PI);
        ctx.stroke();

        const probe = ((t || 0) / 1800) % 1;
        ctx.strokeStyle = "rgba(212,177,90,0.18)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 16, probe * 2 * Math.PI, (probe + 0.5) * 2 * Math.PI);
        ctx.stroke();

        model.pts.forEach((p) => {
          const a = p.th * 2 * Math.PI;
          const rr = r * p.rad;
          ctx.beginPath();
          ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), 6 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = "#d4b15a";
          ctx.fill();
        });

        if (model.flash > 0) {
          ctx.globalAlpha = model.flash * 0.25;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = "#6ec8b6";
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = "#f3efe4";
        ctx.font = "600 18px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText(model.pts.length + " points", 430, 80);
        ctx.font = "14px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "#a8b0c0";
        ctx.fillText("max gap   " + mg.gap.toFixed(3), 430, 120);
        ctx.fillText("threshold 0.500", 430, 144);
        ctx.fillStyle = covered() ? "#6ec8b6" : "#e07a6a";
        ctx.font = "600 16px 'Source Serif 4', serif";
        ctx.fillText(covered() ? "covered: no empty semicircle" : "not covered", 430, 188);
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("theory E[N] = 5", 430, 234);
        if (model.mean != null) ctx.fillText("MC mean     = " + model.mean.toFixed(3), 430, 256);
        stat.textContent = covered() ? ("N = " + model.pts.length) : (model.pts.length + " so far");
      }

      async function throwOne() {
        if (model.busy || covered()) return;
        model.busy = true;
        const p = { th: Math.random(), rad: 1.55, scale: 0 };
        model.pts.push(p);
        await tween(520, (u) => {
          const e = easeOutBack(u);
          p.rad = lerp(1.55, 1, Math.min(1, e));
          p.scale = e;
        });
        const mg = maxGap(model.pts);
        const from0 = model.gapFrom;
        const len0 = model.gapLen;
        await tween(360, (u) => {
          const e = easeInOut(u);
          model.gapFrom = lerp(from0, mg.from, e);
          model.gapLen = lerp(len0, mg.gap, e);
        });
        if (covered()) {
          await tween(500, (u) => { model.flash = 1 - u; });
        }
        model.busy = false;
      }

      async function playCover() {
        if (model.busy) return;
        while (!covered()) await throwOne();
      }

      root.querySelector("[data-act=throw]").onclick = () => { throwOne(); };
      root.querySelector("[data-act=cover]").onclick = () => { playCover(); };
      root.querySelector("[data-act=reset]").onclick = () => {
        if (model.busy) return;
        model.pts = [];
        model.gapFrom = 0;
        model.gapLen = 1;
        model.flash = 0;
      };
      root.querySelector("[data-act=mc]").onclick = async () => {
        if (model.busy) return;
        model.busy = true;
        let acc = 0;
        for (let i = 0; i < 200; i += 1) {
          acc += trial();
          if (i % 8 === 0) {
            model.mean = acc / (i + 1);
            await wait(12);
          }
        }
        model.mean = acc / 200;
        model.busy = false;
      };
      startLoop(draw);
      later(() => { playCover(); }, 400);
    },

    prisoners(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Follow the cycle</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="8" max="16" step="2" value="12" data-n /></label>
            <button class="btn" data-act="shuffle">New permutation</button>
            <button class="btn primary" data-act="play">Play walk</button>
            <button class="btn" data-act="mc">1000 trials</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage">
          <canvas width="860" height="440"></canvas>
        </div>
        <p class="viz-caption">The token walks prisoner 1’s cycle. Gold is visited. A cycle longer than n/2 dooms the whole room.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const stat = root.querySelector("[data-stat]");
      const model = {
        n: 12,
        perm: [],
        walk: [0],
        token: { x: 0, y: 0 },
        done: false,
        rate: null,
        busy: false,
        appear: 0
      };

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

      function harmonicTail(n) {
        let s = 0;
        for (let k = n / 2 + 1; k <= n; k += 1) s += 1 / k;
        return s;
      }

      function layout() {
        const cycs = cycles(model.perm);
        const rings = [];
        let x = 130;
        cycs.forEach((cyc, i) => {
          const R = Math.min(78, 22 + cyc.length * 7);
          const cx = x + R;
          const cy = 200;
          const boxes = cyc.map((id, k) => {
            const a = -Math.PI / 2 + (k / cyc.length) * Math.PI * 2;
            return { id, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a };
          });
          rings.push({ cyc, R, cx, cy, boxes, long: cyc.length > model.n / 2 });
          x += R * 2 + 36;
        });
        return rings;
      }

      function boxOf(id, rings) {
        for (const ring of rings) {
          const b = ring.boxes.find((x) => x.id === id);
          if (b) return b;
        }
        return { x: 100, y: 200 };
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const rings = layout();
        const cols = ["#d4b15a", "#6ec8b6", "#7aa2e3", "#b29be0", "#e07a6a"];
        rings.forEach((ring, i) => {
          ctx.beginPath();
          ctx.arc(ring.cx, ring.cy, ring.R, 0, Math.PI * 2);
          ctx.strokeStyle = ring.long ? "rgba(224,122,106,0.55)" : "rgba(212,177,90,0.2)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = ring.long ? "#e07a6a" : cols[i % cols.length];
          ctx.font = "11px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText((ring.long ? "LONG " : "") + "len " + ring.cyc.length, ring.cx, ring.cy + ring.R + 28);
          ring.boxes.forEach((b) => {
            const on = model.walk.includes(b.id);
            ctx.beginPath();
            ctx.arc(b.x, b.y, 16, 0, Math.PI * 2);
            ctx.fillStyle = on ? "#d4b15a" : "#1b2333";
            ctx.fill();
            ctx.strokeStyle = ring.long ? "#e07a6a" : "rgba(243,239,228,0.25)";
            ctx.stroke();
            ctx.fillStyle = on ? "#0c1018" : "#f3efe4";
            ctx.font = "11px 'IBM Plex Mono', monospace";
            ctx.fillText(String(b.id + 1), b.x, b.y + 4);
          });
        });

        ctx.beginPath();
        ctx.arc(model.token.x, model.token.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#f3efe4";
        ctx.fill();
        ctx.strokeStyle = "#d4b15a";
        ctx.lineWidth = 3;
        ctx.stroke();

        const ok = Math.max(...cycles(model.perm).map((c) => c.length)) <= model.n / 2;
        ctx.fillStyle = ok ? "#6ec8b6" : "#e07a6a";
        ctx.font = "600 15px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText(ok ? "This permutation: all prisoners succeed" : "This permutation: a long cycle dooms everyone", 24, 418);
        const exact = 1 - harmonicTail(model.n);
        stat.textContent = "theory ≈ " + (100 * exact).toFixed(1) + "%" + (model.rate == null ? "" : "   MC " + (100 * model.rate).toFixed(1) + "%");
      }

      function placeToken() {
        const b = boxOf(model.walk[model.walk.length - 1], layout());
        model.token.x = b.x;
        model.token.y = b.y;
      }

      async function step() {
        if (model.done || model.busy) return false;
        model.busy = true;
        const cur = model.walk[model.walk.length - 1];
        const nxt = model.perm[cur];
        const rings = layout();
        const A = boxOf(cur, rings);
        const B = boxOf(nxt, rings);
        const ring = rings.find((r) => r.cyc.includes(cur));
        await tween(420, (u) => {
          const e = easeInOut(u);
          if (ring && ring.cyc.includes(nxt)) {
            const a0 = Math.atan2(A.y - ring.cy, A.x - ring.cx);
            const a1 = Math.atan2(B.y - ring.cy, B.x - ring.cx);
            let da = a1 - a0;
            while (da <= -Math.PI) da += Math.PI * 2;
            while (da > Math.PI) da -= Math.PI * 2;
            const a = a0 + da * e;
            model.token.x = ring.cx + ring.R * Math.cos(a);
            model.token.y = ring.cy + ring.R * Math.sin(a);
          } else {
            model.token.x = lerp(A.x, B.x, e);
            model.token.y = lerp(A.y, B.y, e);
          }
        });
        model.walk.push(nxt);
        placeToken();
        if (nxt === 0 || model.walk.length > model.n / 2 + 1) model.done = true;
        model.busy = false;
        return !model.done;
      }

      async function play() {
        if (model.busy) return;
        while (await step()) await wait(80);
      }

      function fresh() {
        if (model.busy) return;
        model.n = Number(nInput.value);
        model.perm = shuffle(model.n);
        model.walk = [0];
        model.done = false;
        placeToken();
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
      root.querySelector("[data-act=play]").onclick = () => { play(); };
      root.querySelector("[data-act=mc]").onclick = async () => {
        if (model.busy) return;
        model.busy = true;
        let ok = 0;
        for (let i = 0; i < 1000; i += 1) {
          if (trial(model.n)) ok += 1;
          if (i % 40 === 0) {
            model.rate = ok / (i + 1);
            await wait(10);
          }
        }
        model.rate = ok / 1000;
        model.busy = false;
      };
      startLoop(draw);
      fresh();
      later(() => { play(); }, 500);
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
          <canvas width="860" height="410"></canvas>
        </div>
        <p class="viz-caption">Dots fall, then the histogram grows. Coral is uncorrected 0.05; gold is Bonferroni; mint is the BH line.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const qInput = root.querySelector("[data-q]");
      const qv = root.querySelector("[data-qv]");
      const stat = root.querySelector("[data-stat]");
      const m = 10000;
      const model = { ps: [], grow: 0, fall: [], busy: false, sweep: 0 };

      function resampleRaw() {
        return Array.from({ length: m }, () => Math.random()).sort((a, b) => a - b);
      }

      function bhK(q) {
        let kstar = 0;
        for (let k = 1; k <= m; k += 1) {
          if (model.ps[k - 1] <= (k / m) * q) kstar = k;
        }
        return kstar;
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const q = Number(qInput.value) / 100;
        qv.textContent = q.toFixed(2);
        const bins = 40;
        const counts = new Array(bins).fill(0);
        model.ps.forEach((p) => { counts[Math.min(bins - 1, Math.floor(p * bins))] += 1; });
        const maxC = Math.max(1, ...counts);
        const left = 50;
        const top = 20;
        const bw = 520;
        const bh = 290;
        counts.forEach((c, i) => {
          const x = left + (i / bins) * bw;
          const barH = (c / maxC) * bh * model.grow;
          ctx.fillStyle = i / bins < 0.05 ? "rgba(224,122,106,0.75)" : "#1b2333";
          ctx.fillRect(x + 1, top + bh - barH, bw / bins - 2, barH);
        });
        ctx.strokeStyle = "rgba(243,239,228,0.2)";
        ctx.strokeRect(left, top, bw, bh);

        function xOf(p) { return left + p * bw; }
        ctx.save();
        ctx.beginPath();
        ctx.rect(left, top, bw * model.sweep, bh);
        ctx.clip();
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
        ctx.restore();

        model.fall.forEach((d) => {
          ctx.globalAlpha = d.a;
          ctx.fillStyle = d.p < 0.05 ? "#e07a6a" : "#7aa2e3";
          ctx.beginPath();
          ctx.arc(left + d.p * bw, d.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        const rx = 600;
        const yMax = 0.025;
        ctx.fillStyle = "#f3efe4";
        ctx.font = "13px 'IBM Plex Sans', sans-serif";
        ctx.fillText("smallest 120 p-values", rx, 36);
        if (model.ps.length) {
          for (let i = 0; i < 120; i += 1) {
            const x = rx + i * 2;
            const reveal = clamp((model.grow * 120 - i) / 8, 0, 1);
            if (reveal <= 0) continue;
            const yP = 330 - Math.min(yMax, model.ps[i]) / yMax * 250;
            const yBh = 330 - Math.min(yMax, ((i + 1) / m) * q) / yMax * 250;
            ctx.globalAlpha = reveal;
            ctx.fillStyle = "#7aa2e3";
            ctx.fillRect(x, yP, 2, 2);
            ctx.fillStyle = "rgba(110,200,182,0.85)";
            ctx.fillRect(x, yBh, 2, 2);
            ctx.globalAlpha = 1;
          }
        }

        if (model.ps.length) {
          const uncorr = model.ps.filter((p) => p <= 0.05).length;
          const bon = model.ps.filter((p) => p <= 0.05 / m).length;
          const k = bhK(q);
          ctx.fillStyle = "#a8b0c0";
          ctx.font = "13px 'IBM Plex Mono', monospace";
          ctx.fillText("uncorrected 0.05   rejections " + uncorr, 50, 350);
          ctx.fillText("Bonferroni 5e-6    rejections " + bon, 50, 372);
          ctx.fillText("BH q=" + q.toFixed(2) + "          rejections " + k, 360, 350);
          stat.textContent = "E[FP] at 0.05 = 500; this draw " + uncorr;
        }
      }

      async function playSample() {
        if (model.busy) return;
        model.busy = true;
        model.ps = resampleRaw();
        model.grow = 0;
        model.sweep = 0;
        model.fall = model.ps.filter((_, i) => i % 40 === 0).map((p) => ({
          p, y: 20 + Math.random() * 40, a: 1, v: 1.6 + Math.random() * 2.2
        }));
        const t0 = now();
        await tween(900, () => {
          const dt = 16;
          model.fall.forEach((d) => {
            d.y += d.v * (dt / 16);
            if (d.y > 300) d.a = Math.max(0, d.a - 0.06);
          });
          model.grow = clamp((now() - t0) / 900, 0, 1);
        });
        model.fall = [];
        await tween(500, (u) => { model.sweep = easeOut(u); });
        model.busy = false;
      }

      root.querySelector("[data-act=draw]").onclick = () => { playSample(); };
      qInput.oninput = draw;
      startLoop(draw);
      playSample();
    },

    orderstats(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Beta(k, n−k+1)</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="2" max="24" value="9" data-n /> <span data-nv>9</span></label>
            <label class="stat">k <input type="range" min="1" max="9" value="3" data-k /> <span data-kv>3</span></label>
            <button class="btn primary" data-act="sample">Drop sample</button>
          </div>
        </div>
        <div class="viz-stage">
          <canvas width="860" height="400"></canvas>
        </div>
        <p class="viz-caption">Points fall onto [0,1], then the k-th order statistic lights up. The curve morphs as you move n and k.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const kInput = root.querySelector("[data-k]");
      const nv = root.querySelector("[data-nv]");
      const kv = root.querySelector("[data-kv]");
      const model = {
        dots: [],
        pdf: [],
        pdfTo: [],
        morph: 1,
        meanX: 0.3,
        meanTo: 0.3,
        busy: false
      };

      function logBeta(a, b) { return lgamma(a) + lgamma(b) - lgamma(a + b); }
      function lgamma(z) {
        const p = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
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
      function makePdf(n, k) {
        const a = k;
        const b = n - k + 1;
        const out = [];
        for (let i = 1; i < 240; i += 1) {
          const u = i / 240;
          out.push({ u, y: betaPdf(u, a, b) });
        }
        return out;
      }

      function draw() {
        const n = Number(nInput.value);
        kInput.max = String(n);
        if (Number(kInput.value) > n) kInput.value = String(n);
        const k = Number(kInput.value);
        nv.textContent = String(n);
        kv.textContent = String(k);
        const mean = k / (n + 1);
        model.meanTo = mean;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const left = 50;
        const top = 20;
        const bw = 760;
        const bh = 280;
        const src = model.pdf.length ? model.pdf : makePdf(n, k);
        const dst = model.pdfTo.length ? model.pdfTo : src;
        let ymax = 0.1;
        const pts = src.map((p, i) => {
          const y = lerp(p.y, (dst[i] || p).y, model.morph);
          if (y > ymax) ymax = y;
          return { u: p.u, y };
        });
        ctx.beginPath();
        pts.forEach((p, i) => {
          const x = left + p.u * bw;
          const y = top + bh - (p.y / ymax) * bh;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "#7aa2e3";
        ctx.lineWidth = 2;
        ctx.stroke();

        const mx = left + lerp(model.meanX, model.meanTo, 1) * bw;
        model.meanX = lerp(model.meanX, model.meanTo, 0.12);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#6ec8b6";
        ctx.beginPath();
        ctx.moveTo(left + model.meanX * bw, top);
        ctx.lineTo(left + model.meanX * bw, top + bh);
        ctx.stroke();
        ctx.setLineDash([]);

        model.dots.forEach((d, i) => {
          const x = left + d.u * bw;
          const y = d.y;
          const on = d.rank === k;
          ctx.beginPath();
          ctx.arc(x, y, on ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = on ? "#d4b15a" : "rgba(243,239,228,0.45)";
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, Math.min(y + 8, top + bh));
          ctx.lineTo(x, top + bh + 18);
          ctx.strokeStyle = on ? "#d4b15a" : "rgba(243,239,228,0.25)";
          ctx.lineWidth = on ? 2 : 1;
          ctx.stroke();
        });

        ctx.strokeStyle = "rgba(243,239,228,0.2)";
        ctx.strokeRect(left, top, bw, bh);
        ctx.fillStyle = "#a8b0c0";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("E[U(k)] = k/(n+1) = " + mean.toFixed(3), 50, 370);
        ctx.fillText("Beta(" + k + ", " + (n - k + 1) + ")", 360, 370);
        void mx;
      }

      async function morphPdf() {
        const n = Number(nInput.value);
        const k = Number(kInput.value);
        model.pdf = model.pdfTo.length ? model.pdfTo : makePdf(n, k);
        model.pdfTo = makePdf(n, k);
        model.morph = 0;
        await tween(380, (u) => { model.morph = easeInOut(u); });
        model.pdf = model.pdfTo;
        model.morph = 1;
      }

      async function dropSample() {
        if (model.busy) return;
        model.busy = true;
        const n = Number(nInput.value);
        const k = Number(kInput.value);
        const us = Array.from({ length: n }, () => Math.random());
        const ranked = us.map((u, i) => ({ u, i })).sort((a, b) => a.u - b.u);
        const rankOf = new Map(ranked.map((d, r) => [d.i, r + 1]));
        model.dots = us.map((u, i) => ({
          u, y: 8, dest: 300, rank: rankOf.get(i), delay: i * 45
        }));
        const t0 = now();
        await tween(900 + n * 45, () => {
          const t = now() - t0;
          model.dots.forEach((d) => {
            const local = clamp((t - d.delay) / 520, 0, 1);
            const e = easeOutBack(local);
            d.y = lerp(-10, 300, Math.min(1, e));
          });
        });
        const hit = model.dots.find((d) => d.rank === k);
        if (hit) {
          await tween(280, (u) => { hit.y = 300 - 18 * Math.sin(u * Math.PI); });
        }
        model.busy = false;
      }

      nInput.oninput = () => { morphPdf(); };
      kInput.oninput = () => { morphPdf(); };
      root.querySelector("[data-act=sample]").onclick = () => { dropSample(); };
      model.pdf = makePdf(9, 3);
      model.pdfTo = model.pdf;
      startLoop(draw);
      later(() => { dropSample(); }, 350);
    },

    redblack(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Lock the same fortune</h3>
          <div class="viz-controls">
            <label class="stat">n <input type="range" min="2" max="8" value="5" data-n /> <span data-nv>5</span></label>
            <button class="btn" data-act="flip">Flip one</button>
            <button class="btn primary" data-act="play">Play the deck</button>
            <button class="btn" data-act="reshuffle">New shuffle</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage">
          <canvas width="860" height="440"></canvas>
        </div>
        <p class="viz-caption">Bet only when remaining red and black are unequal, and always on the majority. Every shuffle of a given n ends at the same dollar amount.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const nInput = root.querySelector("[data-n]");
      const nv = root.querySelector("[data-nv]");
      const stat = root.querySelector("[data-stat]");
      const model = {
        n: 5,
        deck: [],
        i: 0,
        r: 5,
        b: 5,
        F: 1,
        displayF: 1,
        path: [1],
        flip: 0,
        last: null,
        busy: false,
        chip: 0
      };

      function binom(n, k) {
        if (k < 0 || k > n) return 0;
        k = Math.min(k, n - k);
        let v = 1;
        for (let i = 1; i <= k; i += 1) v = v * (n - k + i) / i;
        return v;
      }

      function fortune(n, r, b) {
        return Math.pow(2, 2 * n - r - b) * binom(r + b, r) / binom(2 * n, n);
      }

      function target() {
        return Math.pow(2, 2 * model.n) / binom(2 * model.n, model.n);
      }

      function stake(n, r, b) {
        if (r + b <= 0) return { x: 0, color: null };
        const x = Math.pow(2, 2 * n - r - b) * (binom(r + b - 1, r - 1) - binom(r + b - 1, r)) / binom(2 * n, n);
        if (Math.abs(x) < 1e-12) return { x: 0, color: null };
        return x > 0 ? { x, color: "R" } : { x: -x, color: "B" };
      }

      function shuffleDeck(n) {
        const d = Array(n).fill("R").concat(Array(n).fill("B"));
        for (let i = d.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [d[i], d[j]] = [d[j], d[i]];
        }
        return d;
      }

      function reset() {
        model.n = Number(nInput.value);
        nv.textContent = String(model.n);
        model.deck = shuffleDeck(model.n);
        model.i = 0;
        model.r = model.n;
        model.b = model.n;
        model.F = 1;
        model.displayF = 1;
        model.path = [1];
        model.flip = 0;
        model.last = null;
        model.chip = 0;
      }

      function drawCard(x, y, w, h, face, flip) {
        const sy = Math.cos(flip * Math.PI);
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(Math.max(0.08, Math.abs(sy)), 1);
        roundRect(ctx, -w / 2, -h / 2, w, h, 6);
        if (sy >= 0) {
          ctx.fillStyle = "#1b2333";
          ctx.fill();
          ctx.strokeStyle = "#d4b15a";
          ctx.stroke();
          ctx.fillStyle = "#d4b15a";
          ctx.font = "700 16px 'Source Serif 4', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Q", 0, 1);
        } else {
          ctx.fillStyle = face === "R" ? "#e07a6a" : "#1b2333";
          ctx.fill();
          ctx.strokeStyle = face === "R" ? "#f3efe4" : "#7aa2e3";
          ctx.stroke();
          ctx.fillStyle = face === "R" ? "#f3efe4" : "#7aa2e3";
          ctx.font = "700 18px 'Source Serif 4', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(face, 0, 1);
        }
        ctx.restore();
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const bet = stake(model.n, model.r, model.b);

        ctx.fillStyle = "#f3efe4";
        ctx.font = "600 18px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText("fortune  $" + model.displayF.toFixed(3), 28, 36);
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("target   $" + target().toFixed(3) + "   =  2^{2n} / C(2n,n)", 28, 58);

        ctx.fillStyle = "#e07a6a";
        ctx.fillText("red left  " + model.r, 28, 88);
        ctx.fillStyle = "#7aa2e3";
        ctx.fillText("black left " + model.b, 160, 88);
        ctx.fillStyle = "#d4b15a";
        if (bet.color) ctx.fillText("bet $" + bet.x.toFixed(3) + " on " + (bet.color === "R" ? "red" : "black"), 320, 88);
        else ctx.fillText("sit out  (r = b)", 320, 88);

        const remaining = model.deck.length - model.i;
        for (let k = 0; k < remaining; k += 1) {
          const x = 28 + k * 18;
          const y = 118;
          const flipping = k === 0 && model.flip > 0 && model.i < model.deck.length;
          drawCard(x, y, 44, 62, flipping ? model.deck[model.i] : "?", flipping ? model.flip : 0);
        }

        const played = model.deck.slice(0, model.i);
        played.forEach((c, k) => {
          drawCard(28 + k * 22, 200, 36, 50, c, 1);
        });

        const left = 28;
        const top = 280;
        const bw = 800;
        const bh = 120;
        ctx.strokeStyle = "rgba(243,239,228,0.2)";
        ctx.strokeRect(left, top, bw, bh);
        const tgt = target();
        const ymax = Math.max(tgt * 1.15, ...model.path, 1.2);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(110,200,182,0.7)";
        ctx.beginPath();
        const ty = top + bh - (tgt / ymax) * bh;
        ctx.moveTo(left, ty);
        ctx.lineTo(left + bw, ty);
        ctx.stroke();
        ctx.setLineDash([]);
        if (model.path.length > 1) {
          ctx.beginPath();
          model.path.forEach((f, i) => {
            const x = left + (i / (2 * model.n)) * bw;
            const y = top + bh - (f / ymax) * bh;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = "#d4b15a";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.fillStyle = "#a8b0c0";
        ctx.font = "12px 'IBM Plex Sans', sans-serif";
        ctx.fillText("fortune path  ·  every shuffle ends on the mint line", left, 418);

        const done = model.i >= model.deck.length;
        stat.textContent = done
          ? ("locked $" + model.F.toFixed(3))
          : ((2 * model.n - model.i) + " cards left");
      }

      async function flipOne() {
        if (model.busy || model.i >= model.deck.length) return;
        model.busy = true;
        const color = model.deck[model.i];
        model.last = color;
        model.flip = 0;
        await tween(420, (u) => { model.flip = u; });
        if (color === "R") model.r -= 1;
        else model.b -= 1;
        model.i += 1;
        model.F = fortune(model.n, model.r, model.b);
        model.path.push(model.F);
        const from = model.displayF;
        await tween(280, (u) => { model.displayF = lerp(from, model.F, easeOut(u)); });
        model.displayF = model.F;
        model.flip = 0;
        model.busy = false;
      }

      async function playAll() {
        if (model.busy) return;
        while (model.i < model.deck.length) {
          await flipOne();
          await wait(90);
        }
      }

      nInput.oninput = () => { if (!model.busy) reset(); };
      root.querySelector("[data-act=flip]").onclick = () => { flipOne(); };
      root.querySelector("[data-act=play]").onclick = () => { playAll(); };
      root.querySelector("[data-act=reshuffle]").onclick = () => { if (!model.busy) reset(); };
      reset();
      startLoop(draw);
      later(() => { playAll(); }, 450);
    }
  });
})();
