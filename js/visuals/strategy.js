(() => {
  const { startLoop, wait, later } = window.Viz;

  Object.assign(window.Visuals, {
    threeprisoners(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Who is pardoned?</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="play">One drawing</button>
            <button class="btn" data-act="many">300 drawings</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="400"></canvas></div>
        <p class="viz-caption">Condition on “guard says B.” A’s pardon mass stays 1/3; C absorbs the rest. Not a coin flip between A and C.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = {
        pardon: "A", says: "B", cond: { A: 0, C: 0, B: 0 }, n: 0, busy: false
      };

      function drawOnce() {
        const pardon = ["A", "B", "C"][Math.floor(Math.random() * 3)];
        let says;
        if (pardon === "A") says = Math.random() < 0.5 ? "B" : "C";
        else if (pardon === "B") says = "C";
        else says = "B";
        model.pardon = pardon;
        model.says = says;
        if (says === "B") {
          model.n += 1;
          model.cond[pardon] += 1;
        }
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ["A", "B", "C"].forEach((name, i) => {
          const x = 120 + i * 220;
          ctx.fillStyle = name === model.pardon ? "#d4b15a" : "#1b2333";
          ctx.fillRect(x, 70, 160, 120);
          ctx.strokeStyle = "rgba(243,239,228,0.25)";
          ctx.strokeRect(x, 70, 160, 120);
          ctx.fillStyle = name === model.pardon ? "#0c1018" : "#f3efe4";
          ctx.font = "600 28px 'Source Serif 4', serif";
          ctx.textAlign = "center";
          ctx.fillText(name, x + 80, 125);
          ctx.font = "13px 'IBM Plex Sans', sans-serif";
          ctx.fillStyle = "#a8b0c0";
          ctx.fillText(name === model.pardon ? "pardoned" : "condemned", x + 80, 155);
        });
        ctx.fillStyle = "#f3efe4";
        ctx.font = "16px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText("guard says  " + model.says + " will be executed", 120, 230);
        const tot = model.n || 1;
        const pA = model.cond.A / tot;
        const pC = model.cond.C / tot;
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("given says B:  P(A pardoned)=" + (model.n ? pA.toFixed(3) : "-") + " (1/3)   P(C pardoned)=" + (model.n ? pC.toFixed(3) : "-") + " (2/3)   n=" + model.n, 120, 280);
        stat.textContent = model.n ? ("P(A|B) " + pA.toFixed(3) + "  P(C|B) " + pC.toFixed(3)) : "ready";
      }

      async function play() {
        if (model.busy) return;
        model.busy = true;
        drawOnce();
        await wait(200);
        model.busy = false;
      }

      root.querySelector("[data-act=play]").onclick = () => play();
      root.querySelector("[data-act=many]").onclick = () => { for (let i = 0; i < 800; i += 1) drawOnce(); };
      root.querySelector("[data-act=reset]").onclick = () => { model.cond = { A: 0, C: 0, B: 0 }; model.n = 0; };
      startLoop(draw);
      later(() => { for (let i = 0; i < 40; i += 1) drawOnce(); }, 300);
    },

    hats(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Eight color triples</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="play">Random hats</button>
            <button class="btn" data-act="cycle">Cycle all 8</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="420"></canvas></div>
        <p class="viz-caption">Pass on a mix. Announce the opposite of a match. The six mixed triples win; the two monochrome triples lose.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = { hats: [1, 0, 1], wins: 0, n: 0, idx: 0 };

      function announce(see0, see1) {
        if (see0 === see1) return 1 - see0;
        return null;
      }

      function outcome(h) {
        const calls = [
          announce(h[1], h[2]),
          announce(h[0], h[2]),
          announce(h[0], h[1])
        ];
        const spoke = calls.filter((c) => c !== null);
        const ok = spoke.length > 0 && calls.every((c, i) => c === null || c === h[i]);
        return { calls, ok };
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const { calls, ok } = outcome(model.hats);
        model.hats.forEach((h, i) => {
          const x = 140 + i * 200;
          ctx.beginPath();
          ctx.arc(x, 130, 36, 0, Math.PI * 2);
          ctx.fillStyle = h ? "#e07a6a" : "#7aa2e3";
          ctx.fill();
          ctx.fillStyle = "#f3efe4";
          ctx.font = "14px 'IBM Plex Sans', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("player " + (i + 1), x, 190);
          const c = calls[i];
          ctx.fillStyle = c === null ? "#a8b0c0" : "#d4b15a";
          ctx.fillText(c === null ? "pass" : (c ? "says red" : "says blue"), x, 214);
        });
        ctx.fillStyle = ok ? "#6ec8b6" : "#e07a6a";
        ctx.font = "18px 'Source Serif 4', serif";
        ctx.textAlign = "left";
        ctx.fillText(ok ? "win" : "lose (all hats equal)", 140, 270);

        for (let k = 0; k < 8; k += 1) {
          const h = [(k >> 2) & 1, (k >> 1) & 1, k & 1];
          const res = outcome(h);
          const x = 80 + k * 90;
          ctx.strokeStyle = res.ok ? "#6ec8b6" : "#e07a6a";
          ctx.strokeRect(x, 310, 70, 70);
          h.forEach((bit, j) => {
            ctx.beginPath();
            ctx.arc(x + 18 + j * 18, 345, 7, 0, Math.PI * 2);
            ctx.fillStyle = bit ? "#e07a6a" : "#7aa2e3";
            ctx.fill();
          });
        }
        const rate = model.n ? model.wins / model.n : 0;
        stat.textContent = model.n ? ("win rate " + rate.toFixed(3) + "  vs  0.750") : "theory 3/4";
      }

      function play() {
        const k = Math.floor(Math.random() * 8);
        model.hats = [(k >> 2) & 1, (k >> 1) & 1, k & 1];
        model.n += 1;
        if (outcome(model.hats).ok) model.wins += 1;
      }

      root.querySelector("[data-act=play]").onclick = () => play();
      root.querySelector("[data-act=cycle]").onclick = () => {
        model.wins = model.n = 0;
        for (let k = 0; k < 8; k += 1) {
          model.hats = [(k >> 2) & 1, (k >> 1) & 1, k & 1];
          model.n += 1;
          if (outcome(model.hats).ok) model.wins += 1;
        }
      };
      startLoop(draw);
      later(() => play(), 300);
    }
  });
})();
