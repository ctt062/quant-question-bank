import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCatalog, validateCatalog } from "../scripts/validate-catalog.mjs";

const baseProblem = {
  id: "sample-id",
  topic: "probability",
  difficulty: "easy",
  time: "5 min",
  title: "Sample",
  blurb: "A fixture.",
  statement: "<p>State.</p>",
  solution: "<p>Solve.</p>",
  visual: "named"
};

const topics = [{ id: "probability", label: "Probability" }];
const difficulties = [{ id: "easy", label: "Easy" }];

test("live catalog loads and passes schema checks", () => {
  const catalog = loadCatalog();
  const result = validateCatalog(catalog);
  assert.equal(result.ok, true, (result.errors || []).join("\n"));
  assert.ok(result.count > 20);
});

test("duplicate ids fail", () => {
  const result = validateCatalog({
    topics,
    difficulties,
    problems: [baseProblem, { ...baseProblem }]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => /duplicate id/i.test(e)));
});

test("reserved hash ids fail", () => {
  const result = validateCatalog({
    topics,
    difficulties,
    problems: [{ ...baseProblem, id: "catalog" }]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => /reserved/i.test(e)));
});

test("unknown topic fails", () => {
  const result = validateCatalog({
    topics,
    difficulties,
    problems: [{ ...baseProblem, topic: "algebra" }]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => /unknown topic/i.test(e)));
});

test("explain visual requires figure.kind", () => {
  const result = validateCatalog({
    topics,
    difficulties,
    problems: [{ ...baseProblem, visual: "explain" }]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => /figure\.kind/i.test(e)));
});
