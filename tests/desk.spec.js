import { expect, test } from "@playwright/test";

async function catalogMeta(page) {
  await page.goto("/#home");
  await page.waitForFunction(() => Array.isArray(window.PROBLEMS) && window.PROBLEMS.length > 0);
  return page.evaluate(() => ({
    ids: window.PROBLEMS.map((p) => p.id),
    topics: window.TOPICS.map((t) => t.id),
    diffs: window.DIFFICULTIES.map((d) => d.id)
  }));
}

test("hash routes render their views", async ({ page }) => {
  const { ids, topics, diffs } = await catalogMeta(page);

  await page.evaluate(() => { location.hash = "home"; });
  await expect(page.locator(".hero-home h1")).toBeVisible();

  await page.evaluate(() => { location.hash = "catalog"; });
  await expect(page.locator(".catalog-head h1")).toHaveText("Catalog");

  await page.evaluate(() => { location.hash = "topics"; });
  await expect(page.locator("#topics")).toBeVisible();

  await page.evaluate(() => { location.hash = "practice"; });
  await expect(page.locator(".catalog-head h1")).toContainText("Train");
  await expect(page.locator("[data-stat=attempted]")).toBeVisible();

  for (const topic of topics) {
    await page.evaluate((id) => { location.hash = "cat/" + id; }, topic);
    await expect(page.locator(".catalog-head h1")).toBeVisible();
    await expect(page.locator(".grid-cards .card").first()).toBeVisible();
  }

  for (const diff of diffs) {
    await page.evaluate((id) => { location.hash = "diff/" + id; }, diff);
    await expect(page.locator(`.grid-cards .card .diff-${diff}`).first()).toBeVisible();
  }

  expect(ids.length).toBeGreaterThan(20);
  for (const id of ids) {
    await page.evaluate((problemId) => { location.hash = problemId; }, id);
    const article = page.locator(`article.problem[data-problem-id="${id}"]`);
    await expect(article).toBeVisible();
    const canvas = article.locator("[data-viz] canvas");
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute("aria-label", /./);
    await expect(canvas).toHaveAttribute("role", "img");
  }
});

test("search opens, filters, and navigates", async ({ page }) => {
  await page.goto("/#home");
  const launch = page.locator(".search-launch");
  await expect(launch).toHaveAttribute("aria-expanded", "false");
  await launch.click();
  await expect(launch).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#cmdk-input")).toBeFocused();
  await page.locator("#cmdk-input").fill("broken stick");
  await page.locator(".cmdk-item").first().click();
  await expect(page.locator('article.problem[data-problem-id="broken-stick"]')).toBeVisible();
});

test("search traps focus and restores it on close", async ({ page }) => {
  await page.goto("/#home");
  const launch = page.locator(".search-launch");
  await launch.click();
  await expect(page.locator("#cmdk-input")).toBeFocused();
  await page.keyboard.press("Tab");
  const inside = await page.evaluate(() => document.getElementById("cmdk").contains(document.activeElement));
  expect(inside).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#cmdk")).toBeHidden();
  await expect(launch).toBeFocused();
  await expect(launch).toHaveAttribute("aria-expanded", "false");
});

test("solution reveal and note persistence", async ({ page }) => {
  await page.goto("/#hth-hhh");
  const solution = page.locator("[data-solution]");
  await expect(solution).toBeHidden();
  await page.locator("[data-act=reveal]").click();
  await expect(solution).toBeVisible();
  await page.locator("[data-notes]").fill("condition on the current suffix");
  await page.reload();
  await expect(page.locator("[data-notes]")).toHaveValue("condition on the current suffix");
  await expect(page.locator("[data-viz] canvas")).toBeVisible();
});

test("practice statuses, progress, and continue queue", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("qip-desk-v2", JSON.stringify({
      notes: {},
      seen: {},
      status: { "hth-hhh": "revisit" },
      timer: { remain: 720, running: false }
    }));
  });
  await page.goto("/#practice");
  await expect(page.locator("[data-stat=revisit]")).toContainText("1 revisit");
  await page.goto("/#practice/continue");
  await expect(page.locator('article.problem[data-problem-id="hth-hhh"]')).toBeVisible();
  await page.locator("[data-status=confident]").click();
  await expect(page.locator("[data-status=confident]")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/#practice");
  await expect(page.locator("[data-stat=confident]")).toContainText("1 confident");
  await expect(page.locator("[data-stat=revisit]")).toContainText("0 revisit");
});

test("practice modes start sessions", async ({ page }) => {
  await page.goto("/#practice/hard");
  await expect(page.locator("article.problem")).toBeVisible();
  await expect(page.locator(".session-bar")).toContainText("Random hard");
  await expect(page.locator(".diff-hard").first()).toBeVisible();

  await page.goto("/#practice/timed");
  await expect(page.locator(".session-bar")).toContainText("Timed set");

  await page.goto("/#practice/mock");
  await expect(page.locator(".session-bar")).toContainText("Mock interview");
  await expect(page.locator("[data-session-timer]")).toBeVisible();

  await page.goto("/#practice/topic/probability");
  await expect(page.locator(".session-bar")).toContainText("Probability drill");
});

test("logo is home and hero actions match search", async ({ page }) => {
  await page.goto("/#catalog");
  await expect(page.locator("#primary-nav")).not.toContainText("Home");
  await expect(page.locator(".brand")).toHaveAttribute("aria-label", "Home");
  await page.locator(".brand").click();
  await expect(page.locator(".hero-home h1")).toBeVisible();

  const search = page.locator(".search-hero");
  const catalog = page.locator('.hero-launch a[href="#catalog"]');
  const practice = page.locator('.hero-launch a[href="#practice"]');
  const s = await search.boundingBox();
  const c = await catalog.boundingBox();
  const p = await practice.boundingBox();
  expect(s && c && p).toBeTruthy();
  expect(Math.abs(c.height - s.height)).toBeLessThan(2);
  expect(Math.abs(p.height - s.height)).toBeLessThan(2);
  expect(Math.abs(c.x - s.x)).toBeLessThan(2);
  expect(Math.abs((p.x + p.width) - (s.x + s.width))).toBeLessThan(2);
});

test("mobile nav keeps catalog reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#home");
  await expect(page.locator(".nav-compact")).toBeVisible();
  await expect(page.locator(".nav-toggle")).toBeVisible();
  await expect(page.locator("#primary-nav")).toBeHidden();
  await page.locator(".nav-toggle").click();
  await expect(page.locator(".nav-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#primary-nav")).toBeVisible();
  await page.locator("#primary-nav a[data-nav=practice]").click();
  await expect(page).toHaveURL(/#practice/);
  await page.locator(".nav-compact").click();
  await expect(page).toHaveURL(/#catalog/);
  await expect(page.locator(".catalog-head h1")).toHaveText("Catalog");
});
