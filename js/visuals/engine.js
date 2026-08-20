(() => {
  const stops = [];
  const tweens = [];

  function now() { return performance.now(); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function startLoop(draw) {
    let alive = true;
    function tick(t) {
      if (!alive) return;
      for (let i = tweens.length - 1; i >= 0; i -= 1) {
        if (!tweens[i].step(t)) tweens.splice(i, 1);
      }
      draw(t);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    stops.push(() => { alive = false; });
  }

  function tween(ms, update, done) {
    if (prefersReducedMotion()) {
      update(1);
      if (done) done();
      return Promise.resolve();
    }
    const t0 = now();
    return new Promise((resolve) => {
      tweens.push({
        step(t) {
          const u = clamp((t - t0) / ms, 0, 1);
          update(u);
          if (u >= 1) {
            if (done) done();
            resolve();
            return false;
          }
          return true;
        }
      });
    });
  }

  function wait(ms) {
    return tween(ms, () => {});
  }

  function clearAnim() {
    while (stops.length) stops.pop()();
    tweens.length = 0;
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    stops.push(() => clearTimeout(id));
  }

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

  function drawCoin(ctx, x, y, r, face, flip) {
    const sy = Math.cos(flip * Math.PI);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, Math.max(0.1, Math.abs(sy)));
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    const gold = ctx.createLinearGradient(-r, -r, r, r);
    gold.addColorStop(0, "#f0d789");
    gold.addColorStop(1, "#8a7030");
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#f3efe4";
    ctx.stroke();
    ctx.fillStyle = "#0c1018";
    ctx.font = "700 " + Math.round(r * 0.9) + "px 'Source Serif 4', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(face, 0, 2);
    ctx.restore();
  }

  function drawDie(ctx, x, y, size, face, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    roundRect(ctx, -size / 2, -size / 2, size, size, 8);
    const g = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    g.addColorStop(0, "#f6f0dc");
    g.addColorStop(1, "#c8b48a");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#8a7030";
    ctx.lineWidth = 2;
    ctx.stroke();
    const pips = {
      1: [[0, 0]],
      2: [[-0.28, -0.28], [0.28, 0.28]],
      3: [[-0.28, -0.28], [0, 0], [0.28, 0.28]],
      4: [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]],
      5: [[-0.28, -0.28], [0.28, -0.28], [0, 0], [-0.28, 0.28], [0.28, 0.28]],
      6: [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0], [0.28, 0], [-0.28, 0.28], [0.28, 0.28]]
    }[face] || [[0, 0]];
    ctx.fillStyle = "#0c1018";
    pips.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px * size, py * size, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawCard(ctx, x, y, w, h, face, flip) {
    const sy = Math.cos((flip || 0) * Math.PI);
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(Math.max(0.08, Math.abs(sy)), 1);
    roundRect(ctx, -w / 2, -h / 2, w, h, 6);
    if (sy >= 0 && face && face !== "?") {
      ctx.fillStyle = "#f3efe4";
      ctx.fill();
      ctx.strokeStyle = "rgba(12,16,24,0.35)";
      ctx.stroke();
      ctx.fillStyle = face === "R" || face === "red" ? "#e07a6a" : "#7aa2e3";
      ctx.font = "700 16px 'Source Serif 4', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(face === "R" || face === "red" ? "R" : (face === "B" || face === "black" ? "B" : String(face)), 0, 1);
    } else {
      ctx.fillStyle = "#1b2333";
      ctx.fill();
      ctx.strokeStyle = "rgba(212,177,90,0.35)";
      ctx.stroke();
    }
    ctx.restore();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function harmonic(n) {
    let s = 0;
    for (let i = 1; i <= n; i += 1) s += 1 / i;
    return s;
  }

  window.Viz = {
    now, clamp, lerp, easeOut, easeInOut, easeOutBack,
    startLoop, tween, wait, later, roundRect, drawCoin, drawDie, drawCard,
    shuffle, harmonic, clearAnim
  };

  function describeFigure(el, problem) {
    const canvas = el.querySelector("canvas");
    if (!canvas) return;
    const head = el.querySelector(".viz-head h3");
    const cap = el.querySelector(".viz-caption");
    const pid = (problem && problem.id) || "figure";
    const title = ((head && head.textContent) || (problem && problem.title) || "Figure").trim();
    const caption = ((cap && cap.textContent) || "").trim();
    const alt = [title, caption].filter(Boolean).join(". ");
    if (head) {
      head.id = "viz-title-" + pid;
      canvas.setAttribute("aria-labelledby", head.id);
    }
    if (cap) {
      cap.id = "viz-cap-" + pid;
      canvas.setAttribute("aria-describedby", cap.id);
    }
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", alt);
  }

  window.Visuals = {
    mount(name, el, problem) {
      clearAnim();
      const fn = this[name] || (problem && problem.figure ? this.explain : null) || (problem && problem.sim ? this.sim : null);
      if (!fn) {
        el.innerHTML = "<p class=\"viz-caption\">No figure for this problem yet.</p>";
        return;
      }
      el.innerHTML = "";
      fn.call(this, el, problem);
      describeFigure(el, problem);
    }
  };
})();
