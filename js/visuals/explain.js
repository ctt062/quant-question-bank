(() => {
  const { startLoop, later, roundRect, drawCoin, drawDie, drawCard, shuffle } = window.Viz;
  const GOLD = "#e2c57a";
  const MINT = "#6ec8b6";
  const PAPER = "#f4f0e6";
  const FOG = "#9aa3b5";
  const CORAL = "#e07a6a";
  const SKY = "#7aa2e3";
  const INK = "#0c1018";

  function ink(ctx) {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  function label(ctx, text, x, y, color, size, align) {
    ctx.fillStyle = color || FOG;
    ctx.font = (size || 13) + "px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }
  function title(ctx, text) {
    ctx.fillStyle = PAPER;
    ctx.font = "600 18px 'Source Serif 4', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, 24, 16);
  }

  const kinds = {
    square(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Sample space");
      const s = 280, x0 = 80, y0 = 58;
      ctx.strokeStyle = "rgba(243,239,228,0.35)";
      ctx.strokeRect(x0, y0, s, s);
      const pred = fig.pred || ((x, y) => x + y < 1);
      ctx.fillStyle = "rgba(226,197,122,0.28)";
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 80; i += 1) {
        for (let j = 0; j <= 80; j += 1) {
          const u = i / 80, v = 1 - j / 80;
          if (!pred(u, v)) continue;
          const px = x0 + u * s, py = y0 + (1 - v) * s;
          ctx.fillRect(px, py - s / 80, s / 80 + 0.5, s / 80 + 0.5);
        }
      }
      const pts = sample.pts || [];
      if (fig.triangle && pts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(x0 + pts[0][0] * s, y0 + (1 - pts[0][1]) * s);
        ctx.lineTo(x0 + pts[1][0] * s, y0 + (1 - pts[1][1]) * s);
        ctx.lineTo(x0 + pts[2][0] * s, y0 + (1 - pts[2][1]) * s);
        ctx.closePath();
        ctx.fillStyle = "rgba(226,197,122,0.18)";
        ctx.fill();
        ctx.strokeStyle = GOLD;
        ctx.stroke();
      }
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(x0 + p[0] * s, y0 + (1 - p[1]) * s, 5, 0, Math.PI * 2);
        ctx.fillStyle = pred(p[0], p[1]) ? GOLD : SKY;
        ctx.fill();
      });
      label(ctx, "0", x0 - 4, y0 + s + 14);
      label(ctx, "1", x0 + s - 4, y0 + s + 14);
      label(ctx, fig.xLabel || "X", x0 + s / 2, y0 + s + 28, FOG, 12, "center");
      label(ctx, fig.yLabel || "Y", x0 - 22, y0 + s / 2, FOG, 12, "center");
      label(ctx, fig.note || "Gold region is the event.", 400, 90, PAPER, 15);
      const hit = pts.filter((p) => pred(p[0], p[1])).length;
      if (pts.length) label(ctx, hit + " / " + pts.length + " in the region", 400, 120, MINT, 14);
    },

    diceGrid(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "36 equally likely faces");
      const pred = fig.pred || ((a, b) => a + b === 7);
      const cell = 46, x0 = 70, y0 = 58;
      for (let a = 1; a <= 6; a += 1) {
        for (let b = 1; b <= 6; b += 1) {
          const x = x0 + (b - 1) * cell, y = y0 + (a - 1) * cell;
          const win = pred(a, b);
          roundRect(ctx, x, y, cell - 4, cell - 4, 6);
          ctx.fillStyle = win ? "rgba(226,197,122,0.28)" : "#141b29";
          ctx.fill();
          ctx.strokeStyle = win ? GOLD : "rgba(243,239,228,0.12)";
          ctx.stroke();
          ctx.fillStyle = win ? GOLD : FOG;
          ctx.font = "12px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(a + "," + b, x + (cell - 4) / 2, y + (cell - 4) / 2);
        }
      }
      if (sample.a) {
        const x = x0 + (sample.b - 1) * cell, y = y0 + (sample.a - 1) * cell;
        ctx.strokeStyle = MINT;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y - 1, cell - 2, cell - 2);
        ctx.lineWidth = 1;
      }
      const n = [...Array(6)].reduce((c, _, i) => c + [...Array(6)].filter((_, j) => pred(i + 1, j + 1)).length, 0);
      label(ctx, n + " gold cells out of 36", 430, 80, PAPER, 15);
      label(ctx, fig.note || ("P = " + n + "/36"), 430, 108, MINT, 14);
    },

    stick(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "The stick");
      const x0 = 80, y = 160, w = 700;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y);
      ctx.stroke();
      ctx.lineWidth = 1;
      const cuts = sample.cuts || fig.cuts || [0.5];
      const marks = fig.marks || [1 / 3, 2 / 3];
      marks.forEach((m) => {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = FOG;
        ctx.beginPath();
        ctx.moveTo(x0 + m * w, y - 36);
        ctx.lineTo(x0 + m * w, y + 36);
        ctx.stroke();
        ctx.setLineDash([]);
        label(ctx, String(m), x0 + m * w, y + 52, FOG, 12, "center");
      });
      cuts.forEach((c, i) => {
        ctx.fillStyle = CORAL;
        ctx.beginPath();
        ctx.arc(x0 + c * w, y, 8, 0, Math.PI * 2);
        ctx.fill();
        label(ctx, "cut " + (i + 1), x0 + c * w, y - 28, PAPER, 12, "center");
      });
      label(ctx, fig.note || "Gold marks are the thresholds in the argument.", 80, 250, PAPER, 15);
    },

    payoff(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Payoffs");
      const rows = fig.rows || ["H", "T"];
      const cols = fig.cols || ["H", "T"];
      const cells = fig.cells || [["+1", "-1"], ["-1", "+1"]];
      const x0 = 160, y0 = 70, cw = 150, rh = 70;
      label(ctx, fig.colPlayer || "B", x0 + cw, 48, FOG, 12, "center");
      cols.forEach((c, j) => label(ctx, c, x0 + j * cw + cw / 2, y0 - 8, PAPER, 13, "center"));
      rows.forEach((r, i) => {
        label(ctx, r, x0 - 28, y0 + i * rh + rh / 2, PAPER, 13, "right");
        cols.forEach((_, j) => {
          const x = x0 + j * cw, y = y0 + i * rh;
          roundRect(ctx, x + 4, y + 4, cw - 8, rh - 8, 10);
          const on = fig.hot && fig.hot[0] === i && fig.hot[1] === j;
          ctx.fillStyle = on ? "rgba(226,197,122,0.22)" : "#141b29";
          ctx.fill();
          ctx.strokeStyle = on ? GOLD : "rgba(243,239,228,0.12)";
          ctx.stroke();
          ctx.fillStyle = PAPER;
          ctx.font = "16px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(cells[i][j], x + cw / 2, y + rh / 2);
        });
      });
      label(ctx, fig.rowPlayer || "A", 48, y0 + rh, FOG, 12, "center");
      label(ctx, fig.note || "", 80, 250, MINT, 15);
    },

    piles(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Piles");
      const sizes = fig.sizes || [3, 5];
      sizes.forEach((n, i) => {
        const x = 140 + i * 220;
        for (let k = 0; k < n; k += 1) {
          roundRect(ctx, x, 250 - k * 28, 70, 22, 6);
          ctx.fillStyle = i ? SKY : GOLD;
          ctx.fill();
        }
        label(ctx, "pile " + (i + 1) + "  (" + n + ")", x + 35, 280, PAPER, 14, "center");
      });
      label(ctx, fig.note || "", 80, 320, MINT, 15);
    },

    curve(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Graph");
      const x0 = 70, y0 = 50, w = 720, h = 250;
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(x0, y0, w, h);
      const xmin = fig.xmin == null ? 0 : fig.xmin;
      const xmax = fig.xmax == null ? 1 : fig.xmax;
      const f = fig.f || ((x) => x);
      const xs = [];
      for (let i = 0; i <= 80; i += 1) xs.push(xmin + (i / 80) * (xmax - xmin));
      const ys = xs.map(f);
      const ymin = Math.min(0, ...ys);
      const ymax = Math.max(...ys, 0.01);
      const xOf = (x) => x0 + ((x - xmin) / (xmax - xmin)) * w;
      const yOf = (y) => y0 + h - ((y - ymin) / (ymax - ymin || 1)) * h;
      ctx.beginPath();
      xs.forEach((x, i) => {
        const X = xOf(x), Y = yOf(ys[i]);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      });
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      if (fig.markX != null) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = MINT;
        ctx.beginPath();
        ctx.moveTo(xOf(fig.markX), y0);
        ctx.lineTo(xOf(fig.markX), y0 + h);
        ctx.stroke();
        ctx.setLineDash([]);
        label(ctx, fig.markLabel || String(fig.markX), xOf(fig.markX) + 8, y0 + 16, MINT, 12);
      }
      label(ctx, fig.xLabel || "x", x0 + w / 2, y0 + h + 22, FOG, 12, "center");
      label(ctx, fig.note || "", 80, 330, PAPER, 14);
    },

    bars(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Counts");
      const items = fig.items || [];
      const max = Math.max(...items.map((it) => it.value), 1);
      const x0 = 80, y0 = 300, bw = Math.min(70, 700 / Math.max(items.length, 1));
      items.forEach((it, i) => {
        const h = (it.value / max) * 210;
        const x = x0 + i * (bw + 18);
        roundRect(ctx, x, y0 - h, bw, h, 6);
        ctx.fillStyle = it.gold ? GOLD : SKY;
        ctx.fill();
        label(ctx, it.label, x + bw / 2, y0 + 18, PAPER, 12, "center");
        label(ctx, String(it.value), x + bw / 2, y0 - h - 12, FOG, 11, "center");
      });
      label(ctx, fig.note || "", 80, 340, MINT, 14);
    },

    network(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Network");
      const nodes = fig.nodes || [];
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = n.gold ? GOLD : "#1b2333";
        ctx.fill();
        ctx.strokeStyle = PAPER;
        ctx.stroke();
        label(ctx, n.label, n.x, n.y + 28, PAPER, 12, "center");
      });
      (fig.edges || []).forEach((e) => {
        const a = nodes[e[0]], b = nodes[e[1]];
        ctx.strokeStyle = e[3] ? CORAL : GOLD;
        ctx.lineWidth = e[3] ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.lineWidth = 1;
        if (e[2]) label(ctx, e[2], (a.x + b.x) / 2, (a.y + b.y) / 2 - 10, MINT, 12, "center");
      });
      label(ctx, fig.note || "", 40, 330, PAPER, 14);
    },

    circle(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Circle");
      const cx = 250, cy = 190, r = 120;
      ctx.strokeStyle = "rgba(243,239,228,0.35)";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      if (fig.square) {
        ctx.strokeRect(cx - r, cy - r, 2 * r, 2 * r);
      }
      const angs = sample.angs || fig.angs || [0, 2.2, 4.1];
      const pts = fig.interior
        ? (sample.pts || [])
        : angs.map((t) => [cx + r * Math.cos(t), cy + r * Math.sin(t)]);
      if (fig.triangle && pts.length >= 3 && !fig.interior) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        pts.slice(1, 3).forEach((p) => ctx.lineTo(p[0], p[1]));
        ctx.closePath();
        ctx.fillStyle = "rgba(226,197,122,0.18)";
        ctx.fill();
        ctx.strokeStyle = GOLD;
        ctx.stroke();
      }
      if (fig.chord && pts.length >= 2 && !fig.interior) {
        ctx.strokeStyle = GOLD;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.lineTo(pts[1][0], pts[1][1]);
        ctx.stroke();
      }
      if (fig.showCenter) {
        ctx.fillStyle = CORAL;
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      pts.forEach((p) => {
        const inDisk = (p[0] - cx) ** 2 + (p[1] - cy) ** 2 <= r * r + 0.5;
        ctx.fillStyle = fig.square ? (inDisk ? GOLD : SKY) : MINT;
        ctx.beginPath();
        ctx.arc(p[0], p[1], fig.interior ? 4 : 6, 0, Math.PI * 2);
        ctx.fill();
      });
      label(ctx, fig.note || "", 420, 90, PAPER, 15);
    },

    boxes(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Three boxes");
      const boxes = fig.boxes || [
        { label: "GG", faces: ["G", "G"] },
        { label: "GS", faces: ["G", "S"] },
        { label: "SS", faces: ["S", "S"] }
      ];
      const gap = boxes.length === 2 ? 280 : Math.min(200, 720 / boxes.length);
      const x0 = boxes.length === 2 ? 180 : 80;
      boxes.forEach((b, i) => {
        const x = x0 + i * gap;
        roundRect(ctx, x, 80, 150, 160, 12);
        ctx.fillStyle = sample.pick === i ? "rgba(226,197,122,0.16)" : "#141b29";
        ctx.fill();
        ctx.strokeStyle = sample.pick === i ? GOLD : "rgba(243,239,228,0.16)";
        ctx.stroke();
        label(ctx, b.label, x + 75, 100, PAPER, 16, "center");
        b.faces.forEach((face, k) => {
          ctx.beginPath();
          ctx.arc(x + 50 + k * 50, 170, 18, 0, Math.PI * 2);
          const goldish = face === "G" || face === "H";
          ctx.fillStyle = goldish ? GOLD : FOG;
          ctx.fill();
          label(ctx, face, x + 50 + k * 50, 170, INK, 12, "center");
          if (sample.pick === i && sample.drawer === k) {
            ctx.strokeStyle = MINT;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x + 50 + k * 50, 170, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        });
      });
      label(ctx, fig.note || "Three gold faces. Two of them sit in GG.", 80, 280, PAPER, 15);
    },

    shrink(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Iterated dominance");
      const steps = sample.step || 0;
      const max = fig.steps || 6;
      for (let i = 0; i <= Math.min(steps, max); i += 1) {
        const hi = 100 * Math.pow(2 / 3, i);
        const y = 70 + i * 36;
        ctx.fillStyle = "rgba(226,197,122," + (0.12 + i * 0.04) + ")";
        ctx.fillRect(80, y, 6.8 * hi, 22);
        label(ctx, "round " + i + "   [0, " + hi.toFixed(1) + "]", 80 + 6.8 * hi + 12, y + 11, PAPER, 13);
      }
      label(ctx, fig.note || "The only number that survives every round is 0.", 80, 330, MINT, 14);
    },

    week(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "The week");
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      days.forEach((d, i) => {
        const x = 80 + i * 140;
        roundRect(ctx, x, 90, 120, 140, 12);
        const on = fig.mark === i;
        ctx.fillStyle = on ? "rgba(226,197,122,0.2)" : "#141b29";
        ctx.fill();
        ctx.strokeStyle = on ? GOLD : "rgba(243,239,228,0.14)";
        ctx.stroke();
        label(ctx, d, x + 60, 160, PAPER, 16, "center");
      });
      label(ctx, fig.note || "", 80, 270, PAPER, 15);
    },

    lockers(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "100 lockers");
      const open = new Set([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
      for (let i = 1; i <= 100; i += 1) {
        const c = (i - 1) % 20, r = Math.floor((i - 1) / 20);
        const x = 50 + c * 38, y = 55 + r * 48;
        roundRect(ctx, x, y, 32, 36, 4);
        ctx.fillStyle = open.has(i) ? GOLD : "#1b2333";
        ctx.fill();
        ctx.fillStyle = open.has(i) ? INK : FOG;
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(i), x + 16, y + 20);
      }
      label(ctx, fig.note || "Gold lockers are the squares: 10 of them.", 50, 310, PAPER, 14);
    },

    scatter(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Scatter");
      const x0 = 70, y0 = 50, w = 520, h = 250;
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(x0, y0, w, h);
      const pts = sample.pts || [];
      const lim = 3;
      const xOf = (x) => x0 + ((x + lim) / (2 * lim)) * w;
      const yOf = (y) => y0 + h - ((y + lim) / (2 * lim)) * h;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = FOG;
      ctx.beginPath();
      ctx.moveTo(xOf(-lim), yOf(-lim));
      ctx.lineTo(xOf(lim), yOf(lim));
      ctx.stroke();
      const rho = fig.slope == null ? 0.5 : fig.slope;
      ctx.strokeStyle = MINT;
      ctx.beginPath();
      ctx.moveTo(xOf(-lim), yOf(-rho * lim));
      ctx.lineTo(xOf(lim), yOf(rho * lim));
      ctx.stroke();
      ctx.setLineDash([]);
      pts.forEach((p) => {
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(xOf(p[0]), yOf(p[1]), 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      label(ctx, fig.note || "Mint: E[Y|X]=ρX. Gold dashed is y=x.", 620, 80, PAPER, 14);
    },

    ci(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Repeated intervals");
      const bands = sample.bands || [];
      const x0 = 80, w = 700;
      ctx.strokeStyle = CORAL;
      ctx.beginPath();
      ctx.moveTo(x0 + w / 2, 50);
      ctx.lineTo(x0 + w / 2, 320);
      ctx.stroke();
      bands.forEach((b, i) => {
        const y = 58 + i * 12;
        const xL = x0 + ((b[0] + 1) / 2) * w;
        const xR = x0 + ((b[1] + 1) / 2) * w;
        ctx.strokeStyle = b[2] ? MINT : CORAL;
        ctx.beginPath();
        ctx.moveTo(xL, y);
        ctx.lineTo(xR, y);
        ctx.stroke();
      });
      label(ctx, fig.note || "Mint intervals cover the true 0. Coral miss. The 95% is over this ensemble.", 80, 340, PAPER, 13);
    },

    coins(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Flips");
      const seq = sample.seq || ["T", "T", "H"];
      seq.forEach((f, i) => {
        const x = 80 + (i % 10) * 70;
        const y = 140 + Math.floor(i / 10) * 80;
        if (fig.bits) {
          roundRect(ctx, x - 22, y - 22, 44, 44, 8);
          ctx.fillStyle = f === "in" ? GOLD : "#1b2333";
          ctx.fill();
          ctx.strokeStyle = f === "in" ? GOLD : "rgba(243,239,228,0.16)";
          ctx.stroke();
          label(ctx, f, x, y, f === "in" ? INK : PAPER, 12, "center");
        } else {
          drawCoin(ctx, x, y, 26, f, 0);
        }
      });
      label(ctx, fig.note || "T is the waiting time, including the first head.", 80, 250, PAPER, 15);
    },

    induction(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Common knowledge");
      const n = fig.n || 5;
      const night = sample.night || n;
      for (let i = 1; i <= n; i += 1) {
        const x = 60 + (i - 1) * 150;
        ctx.beginPath();
        ctx.arc(x + 40, 160, 28, 0, Math.PI * 2);
        ctx.fillStyle = i <= night ? SKY : "#1b2333";
        ctx.fill();
        ctx.strokeStyle = i === night ? GOLD : "rgba(243,239,228,0.2)";
        ctx.stroke();
        label(ctx, "n=" + i, x + 40, 210, PAPER, 13, "center");
        label(ctx, "night " + i, x + 40, 232, FOG, 12, "center");
      }
      label(ctx, fig.note || "Each silent night is a signal. They leave together on night n.", 60, 280, PAPER, 15);
    },

    starsBars(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Stars and bars");
      const stars = fig.stars || 6;
      const bars = fig.bars || 3;
      const seq = [];
      for (let i = 0; i < stars; i += 1) seq.push("*");
      for (let i = 0; i < bars; i += 1) seq.push("|");
      const shown = fig.example || seq;
      shown.forEach((ch, i) => {
        label(ctx, ch, 70 + i * 36, 160, ch === "|" ? CORAL : GOLD, 28, "center");
      });
      label(ctx, fig.note || "Bars split stars into k bins. Count is C(stars+bars, bars).", 70, 230, PAPER, 15);
    },

    simpson(ctx) {
      ink(ctx);
      title(ctx, "Strata vs pooled");
      const groups = [
        { name: "Group A", t: 0.8, c: 70 / 90 },
        { name: "Group B", t: 20 / 90, c: 0.2 },
        { name: "Pooled", t: 0.28, c: 0.72 }
      ];
      groups.forEach((g, i) => {
        const x = 80 + i * 250;
        label(ctx, g.name, x + 80, 70, PAPER, 14, "center");
        [["T", g.t, GOLD], ["C", g.c, SKY]].forEach((row, k) => {
          const y = 110 + k * 80;
          ctx.fillStyle = row[2];
          ctx.fillRect(x, y, 160 * row[1], 36);
          ctx.strokeStyle = "rgba(243,239,228,0.2)";
          ctx.strokeRect(x, y, 160, 36);
          label(ctx, row[0] + " " + row[1].toFixed(2), x + 170, y + 18, PAPER, 13);
        });
      });
      label(ctx, "Treatment wins both strata. Control wins the pool.", 80, 310, MINT, 15);
    },

    tank(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Serial numbers 1..N");
      const N = fig.N || 40;
      const seen = sample.seen || [3, 11, 18, 22, 31];
      const M = Math.max(...seen);
      for (let i = 1; i <= N; i += 1) {
        const x = 40 + ((i - 1) % 20) * 40, y = 60 + Math.floor((i - 1) / 20) * 44;
        roundRect(ctx, x, y, 32, 32, 4);
        ctx.fillStyle = seen.includes(i) ? GOLD : "#1b2333";
        ctx.fill();
        if (i === M) {
          ctx.strokeStyle = MINT;
          ctx.strokeRect(x, y, 32, 32);
        }
      }
      label(ctx, fig.note || ("M is mint-outlined. Unbiased N-hat = M(1+1/k)-1."), 40, 330, PAPER, 14);
    },

    hats(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Parity of hats");
      const bits = sample.bits || Array.from({ length: 12 }, () => Number(Math.random() < 0.5));
      bits.forEach((b, i) => {
        const x = 50 + (i % 12) * 66, y = 100;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = b ? CORAL : SKY;
        ctx.fill();
        label(ctx, b ? "R" : "B", x, y, PAPER, 12, "center");
      });
      const p = bits.reduce((a, b) => a ^ b, 0);
      label(ctx, p === 0 ? "Even parity: every guess is correct." : "Odd parity: every guess is wrong.", 50, 180, MINT, 15);
      label(ctx, fig.note || "They agree to make the total even. Win together on half the worlds.", 50, 220, PAPER, 14);
    },

    truel(ctx) {
      ink(ctx);
      title(ctx, "A should fire into the air");
      const people = [
        { x: 180, y: 180, name: "A  1/3", color: GOLD },
        { x: 430, y: 90, name: "B  2/3", color: SKY },
        { x: 680, y: 180, name: "C  1", color: CORAL }
      ];
      people.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        label(ctx, p.name, p.x, p.y + 56, PAPER, 14, "center");
      });
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = FOG;
      ctx.beginPath();
      ctx.moveTo(180, 140);
      ctx.lineTo(180, 70);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, "air", 180, 54, MINT, 13, "center");
      label(ctx, "If A kills anyone, the survivor shoots A. Missing forces B and C onto each other.", 80, 300, PAPER, 14);
    },

    pirates(ctx) {
      ink(ctx);
      title(ctx, "Backward induction");
      const rows = [
        ["C alone", "C: 100"],
        ["B, C", "B: 100   C: 0"],
        ["A, B, C", "A: 99   B: 0   C: 1"]
      ];
      rows.forEach((r, i) => {
        const y = 70 + i * 80;
        roundRect(ctx, 80, y, 700, 64, 10);
        ctx.fillStyle = i === 2 ? "rgba(226,197,122,0.16)" : "#141b29";
        ctx.fill();
        ctx.strokeStyle = i === 2 ? GOLD : "rgba(243,239,228,0.12)";
        ctx.stroke();
        label(ctx, r[0], 110, y + 32, FOG, 14);
        label(ctx, r[1], 420, y + 32, PAPER, 16);
      });
    },

    median(ctx, fig) {
      ink(ctx);
      title(ctx, fig.heading || "Hotelling line");
      const x0 = 80, y = 170, w = 700;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = MINT;
      ctx.beginPath();
      ctx.arc(x0 + w / 2, y, 10, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, "median", x0 + w / 2, y + 28, MINT, 13, "center");
      label(ctx, "0", x0, y + 28, FOG, 12, "center");
      label(ctx, "1", x0 + w, y + 28, FOG, 12, "center");
      label(ctx, fig.note || "Any platform off the median is pulled toward it. Both candidates sit here.", 80, 250, PAPER, 15);
    },

    auction(ctx) {
      ink(ctx);
      title(ctx, "Second-price sealed bid");
      const bids = [
        { name: "you", v: "value v", pay: "pay second bid" },
        { name: "rival", v: "bid b", pay: "sets the price" }
      ];
      bids.forEach((b, i) => {
        roundRect(ctx, 80 + i * 360, 90, 320, 140, 12);
        ctx.fillStyle = "#141b29";
        ctx.fill();
        ctx.strokeStyle = i === 0 ? GOLD : "rgba(243,239,228,0.14)";
        ctx.stroke();
        label(ctx, b.name, 240 + i * 360, 130, PAPER, 16, "center");
        label(ctx, b.v, 240 + i * 360, 165, FOG, 14, "center");
        label(ctx, b.pay, 240 + i * 360, 195, MINT, 14, "center");
      });
      label(ctx, "Your bid only decides whether you win. The price is the other bid. Bid v.", 80, 270, PAPER, 15);
    },

    cake(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "I cut, you choose");
      const cut = sample.cut == null ? 0.5 : sample.cut;
      roundRect(ctx, 80, 100, 700, 90, 16);
      ctx.fillStyle = "rgba(226,197,122,0.35)";
      ctx.fill();
      ctx.fillStyle = "rgba(122,162,227,0.45)";
      ctx.fillRect(80 + 700 * cut, 100, 700 * (1 - cut), 90);
      ctx.fillStyle = CORAL;
      ctx.fillRect(80 + 700 * cut - 2, 88, 4, 114);
      label(ctx, "chooser takes the larger piece", 80, 230, PAPER, 15);
      label(ctx, fig.note || "Cutter equalises, so both get 1/2 in the cutter's measure.", 80, 258, MINT, 14);
    },

    walk(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Path");
      const path = sample.path || [0];
      const N = fig.N || 10;
      const x0 = 60, y0 = 40, w = 760, h = 260;
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(x0, y0, w, h);
      const xOf = (t) => x0 + (t / Math.max(path.length - 1, 1)) * w;
      const yOf = (k) => y0 + h - (k / N) * h;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = FOG;
      [0, N].forEach((k) => {
        ctx.beginPath();
        ctx.moveTo(x0, yOf(k));
        ctx.lineTo(x0 + w, yOf(k));
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.beginPath();
      path.forEach((k, t) => {
        const X = xOf(t), Y = yOf(k);
        if (t === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      });
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      label(ctx, fig.note || "Absorbing at 0 and N.", 80, 330, PAPER, 14);
    },

    perm(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Permutation");
      const a = sample.a || [2, 0, 3, 1, 4];
      a.forEach((v, i) => {
        const x = 70 + i * 90;
        roundRect(ctx, x, 90, 70, 70, 10);
        const rec = fig.records && a.slice(0, i).every((u) => u < v);
        const hit = fig.fixed && v === i;
        const sampleBand = fig.cutoff && i < fig.cutoff;
        ctx.fillStyle = rec || hit ? "rgba(226,197,122,0.25)" : sampleBand ? "rgba(122,162,227,0.18)" : "#141b29";
        ctx.fill();
        ctx.strokeStyle = rec || hit ? GOLD : sampleBand ? SKY : "rgba(243,239,228,0.14)";
        ctx.stroke();
        label(ctx, String(v + 1), x + 35, 125, PAPER, 18, "center");
        label(ctx, sampleBand ? "skip" : ("pos " + (i + 1)), x + 35, 175, sampleBand ? SKY : FOG, 11, "center");
      });
      label(ctx, fig.note || "", 70, 230, PAPER, 15);
    },

    dyck(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Dyck path");
      const seq = sample.seq || [1, 1, -1, 1, -1, -1, 1, -1];
      let hgt = 0;
      const pts = [[0, 0]];
      let bad = false;
      seq.forEach((s) => {
        hgt += s;
        if (hgt < 0) bad = true;
        pts.push([pts.length, hgt]);
      });
      const x0 = 70, y0 = 40, w = 720, h = 250;
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(x0, y0, w, h);
      const xOf = (t) => x0 + (t / 8) * w;
      const yOf = (v) => y0 + h - ((v + 1) / 6) * h;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const X = xOf(p[0]), Y = yOf(p[1]);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      });
      ctx.strokeStyle = bad ? CORAL : GOLD;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      label(ctx, bad ? "Goes below zero: not a Dyck word." : "Stays nonnegative: counted by C_n.", 80, 320, bad ? CORAL : MINT, 15);
    },

    match(ctx) {
      ink(ctx);
      title(ctx, "Unlabeled pairs");
      const pairs = [[0, 1], [2, 3], [4, 5], [6, 7]];
      pairs.forEach((p, i) => {
        const x = 80 + i * 180;
        [0, 1].forEach((k) => {
          ctx.beginPath();
          ctx.arc(x + k * 70, 150, 22, 0, Math.PI * 2);
          ctx.fillStyle = GOLD;
          ctx.fill();
          label(ctx, String(p[k] + 1), x + k * 70, 150, INK, 14, "center");
        });
        ctx.strokeStyle = MINT;
        ctx.beginPath();
        ctx.moveTo(x + 22, 150);
        ctx.lineTo(x + 48, 150);
        ctx.stroke();
      });
      label(ctx, "8! / (2^4 4!) = 105 ways. Pair order and pair sequence do not count.", 80, 230, PAPER, 15);
    },

    seats(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Last passenger");
      const n = 12;
      const taken = sample.taken || { 0: true };
      for (let i = 0; i < n; i += 1) {
        const x = 50 + i * 64;
        roundRect(ctx, x, 110, 52, 70, 8);
        const mine = i === 0 || i === n - 1;
        ctx.fillStyle = taken[i] ? (i === 0 ? CORAL : SKY) : (mine ? "rgba(226,197,122,0.2)" : "#141b29");
        ctx.fill();
        ctx.strokeStyle = mine ? GOLD : "rgba(243,239,228,0.12)";
        ctx.stroke();
        label(ctx, String(i + 1), x + 26, 145, PAPER, 14, "center");
      }
      label(ctx, fig.note || "Seat 1 and seat n stay symmetric until one of them is taken.", 50, 220, PAPER, 15);
    },

    pond(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Capture-recapture");
      ctx.beginPath();
      ctx.ellipse(430, 180, 280, 120, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#102030";
      ctx.fill();
      ctx.strokeStyle = SKY;
      ctx.stroke();
      const fish = sample.fish || [];
      fish.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = f.tag ? GOLD : FOG;
        ctx.fill();
      });
      label(ctx, fig.note || "Gold fish are tagged. Recapture fraction estimates K/N.", 80, 330, PAPER, 14);
    },

    diceRow(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Rolls");
      const faces = sample.faces || [3, 6, 2, 5];
      faces.forEach((f, i) => drawDie(ctx, 120 + i * 140, 170, 72, f, 0));
      const six = faces.some((f) => f === 6);
      label(ctx, six ? "At least one six." : "No six this time. Complement is (5/6)^n.", 80, 270, six ? MINT : PAPER, 15);
    },

    typeI(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Uniform p-values under the null");
      const ps = sample.ps || [];
      const x0 = 70, y0 = 60, w = 720, h = 220;
      ctx.strokeStyle = "rgba(243,239,228,0.2)";
      ctx.strokeRect(x0, y0, w, h);
      ctx.fillStyle = "rgba(224,122,106,0.25)";
      ctx.fillRect(x0, y0, w * 0.05, h);
      ps.forEach((p, i) => {
        ctx.fillStyle = p < 0.05 ? CORAL : GOLD;
        ctx.fillRect(x0 + p * w, y0 + h - 8 - (i % 12), 2, 8);
      });
      label(ctx, "0", x0, y0 + h + 16);
      label(ctx, "α = 0.05", x0 + w * 0.05, y0 + h + 16, CORAL, 12, "center");
      label(ctx, "1", x0 + w, y0 + h + 16, FOG, 12, "right");
      label(ctx, fig.note || "Coral region is a false reject. Its width is α.", 70, 330, PAPER, 14);
    },

    meanline(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Sample mean");
      const xs = sample.xs || [];
      const mu = fig.mu == null ? 0.5 : fig.mu;
      const x0 = 80, y = 170, w = 700;
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + w, y);
      ctx.stroke();
      ctx.lineWidth = 1;
      xs.forEach((v) => {
        const x = x0 + v * w;
        ctx.fillStyle = GOLD;
        ctx.fillRect(x - 1.5, y - 28, 3, 28);
      });
      const mean = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : mu;
      ctx.strokeStyle = MINT;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0 + mean * w, y - 48);
      ctx.lineTo(x0 + mean * w, y + 18);
      ctx.stroke();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0 + mu * w, y - 58);
      ctx.lineTo(x0 + mu * w, y + 28);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      label(ctx, "0", x0, y + 24);
      label(ctx, "1", x0 + w, y + 24, FOG, 12, "right");
      label(ctx, "bar X", x0 + mean * w + 8, y - 54, MINT, 13);
      label(ctx, "μ", x0 + mu * w - 18, y + 44, CORAL, 14, "center");
      label(ctx, fig.note || "Gold ticks are the sample. Mint is their mean. Coral is the true μ.", 80, 300, PAPER, 14);
    },

    patterns(ctx, fig, sample) {
      ink(ctx);
      title(ctx, fig.heading || "Pattern wait");
      const seq = sample.seq || ["H", "T", "H"];
      seq.forEach((f, i) => drawCoin(ctx, 50 + i * 52, 120, 20, f, 0));
      const s = seq.join("");
      const targets = fig.targets || ["HH", "HT"];
      targets.forEach((pat, k) => {
        const at = s.indexOf(pat);
        const y = 200 + k * 40;
        label(ctx, pat, 50, y, GOLD, 16);
        if (at < 0) label(ctx, "not yet in this run", 110, y, FOG, 14);
        else {
          label(ctx, "first appears ending at flip " + (at + pat.length), 110, y, MINT, 14);
          ctx.strokeStyle = k ? SKY : CORAL;
          ctx.lineWidth = 2;
          ctx.strokeRect(50 + at * 52 - 24, 96, 52 * pat.length, 48);
          ctx.lineWidth = 1;
        }
      });
      label(ctx, fig.note || "HT finishes on a tail after H. HH needs a second H and a tail wastes the start.", 50, 300, PAPER, 14);
    }
  };

  function sampleOf(fig) {
    const k = fig.kind;
    if (k === "square") {
      const pts = [];
      for (let i = 0; i < (fig.n || 40); i += 1) pts.push([Math.random(), Math.random()]);
      return { pts };
    }
    if (k === "diceGrid") {
      return { a: 1 + Math.floor(Math.random() * 6), b: 1 + Math.floor(Math.random() * 6) };
    }
    if (k === "stick") {
      const n = fig.nCuts || 1;
      const cuts = [];
      for (let i = 0; i < n; i += 1) cuts.push(Math.random());
      cuts.sort((a, b) => a - b);
      return { cuts };
    }
    if (k === "circle") {
      const n = fig.nPts || 2;
      if (fig.interior) {
        const cx = 250, cy = 190, r = 120;
        const pts = [];
        while (pts.length < (fig.n || 40)) {
          const x = cx + (Math.random() * 2 - 1) * r;
          const y = cy + (Math.random() * 2 - 1) * r;
          if (fig.square || (x - cx) ** 2 + (y - cy) ** 2 <= r * r) pts.push([x, y]);
        }
        return { pts };
      }
      const angs = [];
      for (let i = 0; i < n; i += 1) angs.push(Math.random() * Math.PI * 2);
      return { angs };
    }
    if (k === "boxes") {
      const boxes = fig.boxes || [
        { label: "GG", faces: ["G", "G"] },
        { label: "GS", faces: ["G", "S"] },
        { label: "SS", faces: ["S", "S"] }
      ];
      const want = fig.given;
      for (let t = 0; t < 40; t += 1) {
        const pick = Math.floor(Math.random() * boxes.length);
        const drawer = Math.random() < 0.5 ? 0 : 1;
        if (!want || boxes[pick].faces[drawer] === want) return { pick, drawer };
      }
      return { pick: 0, drawer: 0 };
    }
    if (k === "shrink") return { step: fig.steps || 6 };
    if (k === "scatter") {
      const pts = [];
      const rho = fig.slope == null ? 0.5 : fig.slope;
      for (let i = 0; i < 80; i += 1) {
        let u = 0, v = 0;
        while (!u) u = Math.random();
        while (!v) v = Math.random();
        const z1 = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        const z2 = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v);
        pts.push([z1, rho * z1 + Math.sqrt(1 - rho * rho) * z2]);
      }
      return { pts };
    }
    if (k === "ci") {
      const bands = [];
      for (let i = 0; i < 22; i += 1) {
        let s = 0;
        for (let j = 0; j < 30; j += 1) {
          let u = 0, v = 0;
          while (!u) u = Math.random();
          while (!v) v = Math.random();
          s += Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        }
        const m = s / 30, se = 1 / Math.sqrt(30), half = 1.96 * se;
        bands.push([m - half, m + half, Math.abs(m) <= half]);
      }
      return { bands };
    }
    if (k === "coins") {
      if (fig.bits) {
        return { seq: Array.from({ length: fig.count || 8 }, () => (Math.random() < 0.5 ? "in" : "out")) };
      }
      if (fig.count) {
        return { seq: Array.from({ length: fig.count }, () => (Math.random() < 0.5 ? "H" : "T")) };
      }
      const seq = [];
      while (true) {
        const f = Math.random() < 0.5 ? "H" : "T";
        seq.push(f);
        if (f === "H" || seq.length > 10) break;
      }
      return { seq };
    }
    if (k === "diceRow") {
      const n = fig.n || 4;
      return { faces: Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6)) };
    }
    if (k === "induction") return { night: fig.n || 5 };
    if (k === "tank") {
      const N = fig.N || 40, k0 = fig.k || 5, s = new Set();
      while (s.size < k0) s.add(1 + Math.floor(Math.random() * N));
      return { seen: [...s] };
    }
    if (k === "hats") return { bits: Array.from({ length: 12 }, () => Number(Math.random() < 0.5)) };
    if (k === "cake") return { cut: 0.18 + Math.random() * 0.64 };
    if (k === "meanline") {
      const n = fig.n || 12;
      return { xs: Array.from({ length: n }, () => Math.random()) };
    }
    if (k === "patterns") {
      return { seq: Array.from({ length: 14 }, () => (Math.random() < 0.5 ? "H" : "T")) };
    }
    if (k === "walk") {
      const N = fig.N || 10;
      let k0 = fig.start == null ? 5 : fig.start;
      const path = [k0];
      const bold = !!fig.bold;
      while (k0 > 0 && k0 < N && path.length < 80) {
        const stake = bold ? Math.min(k0, N - k0) : 1;
        k0 += Math.random() < (fig.p || 0.5) ? stake : -stake;
        path.push(k0);
      }
      return { path };
    }
    if (k === "perm") return { a: shuffle([...Array(fig.n || 5).keys()]) };
    if (k === "dyck") return { seq: shuffle([1, 1, 1, 1, -1, -1, -1, -1]) };
    if (k === "seats") {
      const taken = {};
      taken[Math.floor(Math.random() * 12)] = true;
      return { taken };
    }
    if (k === "pond") {
      const fish = [];
      for (let i = 0; i < 40; i += 1) {
        fish.push({
          x: 430 + (Math.random() - 0.5) * 480,
          y: 180 + (Math.random() - 0.5) * 180,
          tag: i < 8
        });
      }
      return { fish };
    }
    if (k === "typeI") {
      const ps = [];
      for (let i = 0; i < 80; i += 1) ps.push(Math.random());
      return { ps };
    }
    return {};
  }

  window.Visuals.explain = function explain(root, problem) {
    const fig = (problem && problem.figure) || { kind: "payoff" };
    const titleText = fig.title || problem.title || "Figure";
    const caption = fig.caption || "A picture of the argument, not a running mean.";
    const staticKind = {
      payoff: 1, piles: 1, simpson: 1, truel: 1, pirates: 1, median: 1, auction: 1,
      lockers: 1, network: 1, week: 1, starsBars: 1, match: 1, curve: 1, bars: 1,
      shrink: 1, induction: 1
    };
    const live = !!kinds[fig.kind] && !staticKind[fig.kind];
    root.innerHTML = `
      <div class="viz-head">
        <h3>${titleText}</h3>
        <div class="viz-controls">
          ${live ? '<button class="btn primary" data-act="one">New sample</button>' : ""}
          <span class="stat" data-stat></span>
        </div>
      </div>
      <div class="viz-stage"><canvas width="860" height="360"></canvas></div>
      <p class="viz-caption">${caption}</p>
    `;
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const stat = root.querySelector("[data-stat]");
    const model = { sample: sampleOf(fig) };

    function draw() {
      const fn = kinds[fig.kind];
      if (!fn) {
        ink(ctx);
        label(ctx, "No figure kind " + fig.kind, 40, 40, PAPER, 16);
        return;
      }
      fn(ctx, fig, model.sample);
    }

    const one = root.querySelector("[data-act=one]");
    if (one) {
      one.onclick = () => {
        model.sample = sampleOf(fig);
        if (stat) stat.textContent = "new sample";
      };
    }
    startLoop(draw);
    later(() => { model.sample = sampleOf(fig); }, 80);
  };
})();
