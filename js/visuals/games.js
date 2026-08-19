(() => {
  const { startLoop, tween, wait, later, drawCoin } = window.Viz;

  Object.assign(window.Visuals, {
    monty(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>Three doors</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="play">Play</button>
            <button class="btn" data-act="many">300 games</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="400"></canvas></div>
        <p class="viz-caption">Host always opens a goat. Gold is the car. Stay wins 1/3 of the time; switch wins 2/3.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = {
        car: 0, pick: 0, open: 1, switchTo: 2, phase: "idle",
        stayW: 0, switchW: 0, games: 0, busy: false
      };

      function doors() {
        return [0, 1, 2].map((i) => ({
          i,
          x: 140 + i * 200,
          label: String.fromCharCode(65 + i)
        }));
      }

      function setup() {
        model.car = Math.floor(Math.random() * 3);
        model.pick = Math.floor(Math.random() * 3);
        const goats = [0, 1, 2].filter((i) => i !== model.car && i !== model.pick);
        model.open = goats[Math.floor(Math.random() * goats.length)];
        model.switchTo = [0, 1, 2].find((i) => i !== model.pick && i !== model.open);
        model.phase = "pick";
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        doors().forEach((d) => {
          const opened = model.phase !== "pick" && d.i === model.open;
          const chosen = d.i === model.pick;
          ctx.fillStyle = opened ? "#1b2333" : "#141a26";
          ctx.fillRect(d.x, 70, 140, 180);
          ctx.strokeStyle = chosen ? "#d4b15a" : "rgba(243,239,228,0.25)";
          ctx.lineWidth = chosen ? 3 : 1;
          ctx.strokeRect(d.x, 70, 140, 180);
          ctx.fillStyle = "#f3efe4";
          ctx.font = "600 28px 'Source Serif 4', serif";
          ctx.textAlign = "center";
          ctx.fillText(d.label, d.x + 70, 120);
          if (opened || model.phase === "reveal") {
            ctx.fillStyle = d.i === model.car ? "#d4b15a" : "#7aa2e3";
            ctx.font = "16px 'IBM Plex Sans', sans-serif";
            ctx.fillText(d.i === model.car ? "car" : "goat", d.x + 70, 170);
          }
        });
        ctx.fillStyle = "#a8b0c0";
        ctx.font = "14px 'IBM Plex Sans', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("pick " + String.fromCharCode(65 + model.pick) + "   host opens " + String.fromCharCode(65 + model.open) + "   switch to " + String.fromCharCode(65 + model.switchTo), 140, 280);
        const stay = model.games ? model.stayW / model.games : 0;
        const sw = model.games ? model.switchW / model.games : 0;
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("stay " + stay.toFixed(3) + " (1/3)     switch " + sw.toFixed(3) + " (2/3)     n=" + model.games, 140, 320);
        stat.textContent = model.games ? ("stay " + stay.toFixed(3) + "  switch " + sw.toFixed(3)) : "ready";
      }

      async function play() {
        if (model.busy) return;
        model.busy = true;
        setup();
        model.phase = "pick";
        await wait(350);
        model.phase = "host";
        await wait(450);
        model.phase = "reveal";
        model.games += 1;
        if (model.pick === model.car) model.stayW += 1;
        if (model.switchTo === model.car) model.switchW += 1;
        model.busy = false;
      }

      function many() {
        for (let i = 0; i < 300; i += 1) {
          setup();
          model.games += 1;
          if (model.pick === model.car) model.stayW += 1;
          if (model.switchTo === model.car) model.switchW += 1;
        }
        model.phase = "reveal";
      }

      root.querySelector("[data-act=play]").onclick = () => play();
      root.querySelector("[data-act=many]").onclick = () => many();
      root.querySelector("[data-act=reset]").onclick = () => {
        model.stayW = model.switchW = model.games = 0;
        setup();
        model.phase = "pick";
      };
      setup();
      startLoop(draw);
      later(() => play(), 400);
    },

    penney(root) {
      root.innerHTML = `
        <div class="viz-head">
          <h3>HTH vs HHH race</h3>
          <div class="viz-controls">
            <button class="btn primary" data-act="run">Race</button>
            <button class="btn" data-act="many">200 races</button>
            <button class="btn" data-act="reset">Reset</button>
            <span class="stat" data-stat></span>
          </div>
        </div>
        <div class="viz-stage"><canvas width="860" height="400"></canvas></div>
        <p class="viz-caption">Same chain as the waiting-time problem, now with two absorbers. HTH should win about 3/5 of races, not 2/3.</p>
      `;
      const canvas = root.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const stat = root.querySelector("[data-stat]");
      const model = {
        seq: "", winner: null, busy: false, coin: "H", flip: 0,
        hth: 0, hhh: 0, n: 0
      };

      function next(seq, face) { return (seq + face).slice(-3); }

      function winnerOf(s) {
        if (s.endsWith("HTH")) return "HTH";
        if (s.endsWith("HHH")) return "HHH";
        return null;
      }

      function draw() {
        ctx.fillStyle = "#0c1018";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawCoin(ctx, 120, 120, 36, model.coin, model.flip);
        ctx.fillStyle = "#f3efe4";
        ctx.font = "20px 'IBM Plex Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(model.seq || "…", 190, 128);
        ctx.font = "16px 'Source Serif 4', serif";
        ctx.fillStyle = model.winner === "HTH" ? "#d4b15a" : "#a8b0c0";
        ctx.fillText("HTH", 190, 180);
        ctx.fillStyle = model.winner === "HHH" ? "#e07a6a" : "#a8b0c0";
        ctx.fillText("HHH", 280, 180);
        const p = model.n ? model.hth / model.n : 0;
        ctx.fillStyle = "#6ec8b6";
        ctx.font = "13px 'IBM Plex Mono', monospace";
        ctx.fillText("P(HTH first)  empirical " + p.toFixed(3) + "   theory 0.600   n=" + model.n, 80, 260);
        const w = 700;
        ctx.fillStyle = "#1b2333";
        ctx.fillRect(80, 290, w, 22);
        if (model.n) {
          ctx.fillStyle = "#d4b15a";
          ctx.fillRect(80, 290, w * p, 22);
        }
        stat.textContent = model.n ? (p.toFixed(3) + " vs 0.600") : "theory 3/5";
      }

      async function race() {
        if (model.busy) return;
        model.busy = true;
        model.seq = "";
        model.winner = null;
        while (!model.winner) {
          const face = Math.random() < 0.5 ? "H" : "T";
          model.coin = face;
          model.flip = 0;
          await tween(180, (u) => { model.flip = u; });
          model.seq = next(model.seq, face);
          model.winner = winnerOf(model.seq);
          await wait(60);
        }
        model.n += 1;
        if (model.winner === "HTH") model.hth += 1;
        else model.hhh += 1;
        model.busy = false;
      }

      function many() {
        for (let i = 0; i < 200; i += 1) {
          let s = "", w = null;
          while (!w) {
            s = next(s, Math.random() < 0.5 ? "H" : "T");
            w = winnerOf(s);
          }
          model.n += 1;
          if (w === "HTH") model.hth += 1;
          else model.hhh += 1;
          model.seq = s;
          model.winner = w;
        }
      }

      root.querySelector("[data-act=run]").onclick = () => race();
      root.querySelector("[data-act=many]").onclick = () => many();
      root.querySelector("[data-act=reset]").onclick = () => {
        model.seq = "";
        model.winner = null;
        model.hth = model.hhh = model.n = 0;
      };
      startLoop(draw);
      later(() => race(), 400);
    }
  });
})();
