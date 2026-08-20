import { expect, test } from "@playwright/test";

async function catalog(page) {
  await page.goto("/#home");
  await page.waitForFunction(() => Array.isArray(window.PROBLEMS) && window.PROBLEMS.length > 0);
  return page.evaluate(() => ({
    hard: window.PROBLEMS.filter((p) => p.difficulty === "hard").map((p) => p.id),
    easy: window.PROBLEMS.filter((p) => p.difficulty === "easy").map((p) => p.id),
    medium: window.PROBLEMS.filter((p) => p.difficulty === "medium").map((p) => p.id),
    probability: window.PROBLEMS.filter((p) => p.topic === "probability").map((p) => p.id)
  }));
}

function store(status, extra) {
  return Object.assign({
    notes: {},
    seen: {},
    status: status || {},
    timer: { remain: 720, running: false }
  }, extra);
}

function markAllBut(ids, keep) {
  const held = new Set(keep);
  const status = {};
  ids.forEach((id) => {
    if (!held.has(id)) status[id] = "confident";
  });
  return status;
}

async function boot(page, hash, payload) {
  await page.evaluate((data) => {
    localStorage.setItem("qip-desk-v2", JSON.stringify(data));
  }, payload);
  await page.goto("about:blank");
  await page.goto("/#" + hash);
}

test("practice sessions fill from confident to keep their lengths", async ({ page }) => {
  const ids = await catalog(page);
  expect(ids.hard.length).toBeGreaterThanOrEqual(5);
  expect(ids.easy.length).toBeGreaterThanOrEqual(1);
  expect(ids.medium.length).toBeGreaterThanOrEqual(2);
  expect(ids.probability.length).toBeGreaterThanOrEqual(6);

  await boot(page, "practice/hard", store(markAllBut(ids.hard, ids.hard.slice(0, 4))));
  await expect(page.locator(".session-meta")).toContainText("1 / 5");

  const mockKeep = ids.easy.slice(0, 1).concat(ids.medium.slice(0, 1), ids.hard.slice(0, 1));
  await boot(page, "practice/mock", store(markAllBut(ids.hard.concat(ids.easy, ids.medium), mockKeep)));
  await expect(page.locator(".session-meta")).toContainText("1 / 5");

  await boot(page, "practice/timed", store(markAllBut(ids.easy.concat(ids.medium, ids.hard), [])));
  await expect(page.locator(".session-meta")).toContainText("1 / 3");

  await boot(page, "practice/topic/probability", store(markAllBut(ids.probability, ids.probability.slice(0, 2))));
  await expect(page.locator(".session-meta")).toContainText("1 / 6");
});

test("starting a session replaces the launcher history entry", async ({ page }) => {
  await page.goto("/#practice");
  await expect(page.locator(".catalog-head h1")).toContainText("Train");
  await page.locator('a[href="#practice/hard"]').click();
  await expect(page.locator("article.problem")).toBeVisible();
  await expect(page.locator(".session-bar")).toContainText("Random hard");
  await page.goBack();
  await expect(page).toHaveURL(/#practice$/);
  await expect(page.locator(".catalog-head h1")).toContainText("Train");
});

test("seen-to-attempted migration runs only when status is missing", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("qip-desk-v2", JSON.stringify({
      notes: {},
      seen: { "hth-hhh": true },
      status: {},
      timer: { remain: 720, running: false }
    }));
  });
  await page.goto("/#hth-hhh");
  await expect(page.locator("[data-status=attempted]")).toHaveAttribute("aria-pressed", "false");
});

test("legacy seen reveals still migrate to attempted", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("qip-desk-v2", JSON.stringify({
      notes: {},
      seen: { "hth-hhh": true },
      timer: { remain: 720, running: false }
    }));
  });
  await page.goto("/#hth-hhh");
  await expect(page.locator("[data-status=attempted]")).toHaveAttribute("aria-pressed", "true");
});

test("mock session clock stops saving after it reaches zero", async ({ page }) => {
  await page.goto("/#home");
  await page.waitForFunction(() => Array.isArray(window.PROBLEMS) && window.PROBLEMS.length > 0);
  const id = await page.evaluate(() => window.PROBLEMS[0].id);
  await boot(page, id, store({}, {
    session: {
      kind: "mock",
      title: "Mock interview",
      ids: [id],
      index: 0,
      topic: null,
      perProblemSec: null,
      totalRemain: 1
    }
  }));
  await expect(page.locator("[data-session-timer]")).toHaveText("00:00");
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("qip-desk-v2"));
    raw.session.totalRemain = 50;
    localStorage.setItem("qip-desk-v2", JSON.stringify(raw));
  });
  await page.waitForTimeout(1500);
  const remain = await page.evaluate(() => JSON.parse(localStorage.getItem("qip-desk-v2")).session.totalRemain);
  expect(remain).toBe(50);
});
