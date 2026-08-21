import { expect, test } from "@playwright/test";

async function boot(page, hash, payload) {
  await page.evaluate((data) => {
    localStorage.setItem("qip-desk-v2", JSON.stringify(data));
  }, payload);
  await page.goto("about:blank");
  await page.goto("/#" + hash);
}

test("progress appears on home and practice", async ({ page }) => {
  await page.goto("/#home");
  await expect(page.locator("#desk-progress [data-stat=attempted]")).toBeVisible();
  await expect(page.locator("#desk-progress [data-stat=confident]")).toBeVisible();
  await expect(page.locator("#desk-progress [data-stat=revisit]")).toBeVisible();
  await expect(page.locator("[data-continue]")).toContainText("Continue practicing");
  await page.goto("/#practice");
  await expect(page.locator("#practice-progress [data-stat=attempted]")).toBeVisible();
  await expect(page.locator(".catalog-head h1")).toContainText("Train");
});

test("continue practicing walks revisit, then unseen, then attempted", async ({ page }) => {
  await page.goto("/#home");
  await page.waitForFunction(() => Array.isArray(window.PROBLEMS) && window.PROBLEMS.length > 0);
  const payload = await page.evaluate(() => {
    const status = {};
    window.PROBLEMS.forEach((p) => { status[p.id] = "confident"; });
    status["hth-hhh"] = "revisit";
    delete status["broken-stick"];
    status["circle-cover"] = "attempted";
    return {
      notes: {},
      seen: {},
      status,
      timer: { remain: 720, running: false }
    };
  });
  await boot(page, "practice/continue", payload);
  await expect(page.locator("article.problem")).toHaveAttribute("data-problem-id", "hth-hhh");
  await expect(page.locator(".session-bar")).toContainText("Continue practicing");
  await page.locator("[data-session=next]").click();
  await expect(page.locator("article.problem")).toHaveAttribute("data-problem-id", "broken-stick");
  await page.locator("[data-session=next]").click();
  await expect(page.locator("article.problem")).toHaveAttribute("data-problem-id", "circle-cover");
});

test("timed set is one of each band at twelve minutes", async ({ page }) => {
  await page.goto("/#practice/timed");
  await expect(page.locator(".session-bar")).toContainText("Timed set");
  await expect(page.locator(".session-meta")).toContainText("1 / 3");
  await expect(page.locator("[data-timer]")).toHaveText("12:00");
  const diffs = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("qip-desk-v2")).session;
    return session.ids.map((id) => window.PROBLEMS.find((p) => p.id === id).difficulty).sort();
  });
  expect(diffs).toEqual(["easy", "hard", "medium"]);
});

test("mock interview is five mixed problems with a 45-minute clock", async ({ page }) => {
  await page.goto("/#practice/mock");
  await expect(page.locator(".session-bar")).toContainText("Mock interview");
  await expect(page.locator(".session-meta")).toContainText("1 / 5");
  await expect(page.locator("[data-session-timer]")).toHaveText("45:00");
  const mix = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("qip-desk-v2")).session;
    const picked = session.ids.map((id) => window.PROBLEMS.find((p) => p.id === id));
    return {
      count: picked.length,
      topics: new Set(picked.map((p) => p.topic)).size,
      diffs: new Set(picked.map((p) => p.difficulty)).size
    };
  });
  expect(mix.count).toBe(5);
  expect(mix.topics).toBeGreaterThan(1);
  expect(mix.diffs).toBeGreaterThan(1);
});

test("random hard prefers problems that are not confident", async ({ page }) => {
  await page.goto("/#home");
  await page.waitForFunction(() => Array.isArray(window.PROBLEMS) && window.PROBLEMS.length > 0);
  const { payload, keep } = await page.evaluate(() => {
    const hard = window.PROBLEMS.filter((p) => p.difficulty === "hard").map((p) => p.id);
    const keep = hard.slice(0, 5);
    const status = {};
    hard.forEach((id) => {
      if (!keep.includes(id)) status[id] = "confident";
    });
    return {
      keep,
      payload: { notes: {}, seen: {}, status, timer: { remain: 720, running: false } }
    };
  });
  await boot(page, "practice/hard", payload);
  await expect(page.locator(".session-bar")).toContainText("Random hard");
  await expect(page.locator(".session-meta")).toContainText("1 / 5");
  await expect(page.locator(".diff-hard").first()).toBeVisible();
  const ids = await page.evaluate(() => JSON.parse(localStorage.getItem("qip-desk-v2")).session.ids);
  expect(ids.sort()).toEqual(keep.sort());
});

test("topic drill stays inside one topic and caps at six", async ({ page }) => {
  await page.goto("/#practice/topic/probability");
  await expect(page.locator(".session-bar")).toContainText("Probability drill");
  const picked = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("qip-desk-v2")).session;
    return session.ids.map((id) => window.PROBLEMS.find((p) => p.id === id));
  });
  expect(picked.length).toBeGreaterThan(0);
  expect(picked.length).toBeLessThanOrEqual(6);
  expect(picked.every((p) => p.topic === "probability")).toBe(true);
});

test("reduced motion collapses CSS animation and tween delays", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#home");
  const duration = await page.locator(".hero-home").evaluate((el) => getComputedStyle(el).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThan(0.05);
  await page.goto("/#hth-hhh");
  await page.waitForFunction(() => window.Viz && typeof window.Viz.tween === "function");
  const elapsed = await page.evaluate(async () => {
    const t0 = performance.now();
    await window.Viz.tween(4000, () => {});
    return performance.now() - t0;
  });
  expect(elapsed).toBeLessThan(250);
});

test("hard-set answers still reveal on the live desk", async ({ page }) => {
  await page.goto("/#hth-hhh");
  await page.locator("[data-act=reveal]").click();
  const hth = page.locator("[data-solution] .answer-box");
  await expect(hth).toContainText("10");
  await expect(hth).toContainText("14");
  await page.goto("/#broken-stick");
  await page.locator("[data-act=reveal]").click();
  await expect(page.locator("[data-solution] .answer-box")).toContainText("1/4");
  await page.goto("/#circle-cover");
  await page.locator("[data-act=reveal]").click();
  await expect(page.locator("[data-solution] .answer-box")).toContainText("5");
  await page.goto("/#prisoners");
  await page.locator("[data-act=reveal]").click();
  await expect(page.locator("[data-solution] .answer-box")).toContainText("31.2");
});
