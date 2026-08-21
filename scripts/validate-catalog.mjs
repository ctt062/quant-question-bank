import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  "js/problems.js",
  "js/problems-more.js",
  "js/problems-fill-a.js",
  "js/problems-fill-b.js",
  "js/problems-fill-c.js"
];
const REQUIRED = ["id", "topic", "difficulty", "time", "title", "blurb", "statement", "solution", "visual"];
const RESERVED = new Set(["home", "catalog", "topics", "practice", "cat", "diff"]);

export function loadCatalog(root = ROOT) {
  const sandboxWindow = {};
  const context = vm.createContext({ window: sandboxWindow, console });
  for (const file of FILES) {
    const code = readFileSync(join(root, file), "utf8");
    vm.runInContext(code, context, { filename: file });
  }
  return {
    topics: context.window.TOPICS,
    difficulties: context.window.DIFFICULTIES,
    problems: context.window.PROBLEMS
  };
}

export function validateCatalog({ topics, difficulties, problems }) {
  const errors = [];
  if (!Array.isArray(topics) || !topics.length) errors.push("TOPICS is missing or empty");
  if (!Array.isArray(difficulties) || !difficulties.length) errors.push("DIFFICULTIES is missing or empty");
  if (!Array.isArray(problems) || !problems.length) errors.push("PROBLEMS is missing or empty");
  if (errors.length) return { ok: false, errors };

  const topicIds = new Set(topics.map((t) => t && t.id).filter(Boolean));
  const diffIds = new Set(difficulties.map((d) => d && d.id).filter(Boolean));
  const seen = new Map();

  problems.forEach((p, index) => {
    const where = p && p.id ? p.id : `index ${index}`;
    if (!p || typeof p !== "object") {
      errors.push(`${where}: record is not an object`);
      return;
    }
    REQUIRED.forEach((key) => {
      if (typeof p[key] !== "string" || !p[key].trim()) {
        errors.push(`${where}: missing ${key}`);
      }
    });
    if (typeof p.id === "string") {
      if (!/^[a-z0-9-]+$/.test(p.id)) errors.push(`${where}: id must be a lowercase slug`);
      if (RESERVED.has(p.id) || RESERVED.has(p.id.split("/")[0])) {
        errors.push(`${where}: id collides with a reserved hash route`);
      }
      if (seen.has(p.id)) errors.push(`duplicate id "${p.id}" (${seen.get(p.id)} and ${index})`);
      else seen.set(p.id, index);
    }
    if (p.topic && !topicIds.has(p.topic)) errors.push(`${where}: unknown topic "${p.topic}"`);
    if (p.difficulty && !diffIds.has(p.difficulty)) errors.push(`${where}: unknown difficulty "${p.difficulty}"`);
    if (p.visual === "explain" && !(p.figure && p.figure.kind)) {
      errors.push(`${where}: explain visual needs figure.kind`);
    }
    if (p.visual === "sim" && !(p.sim && typeof p.sim === "object")) {
      errors.push(`${where}: sim visual needs a sim object`);
    }
  });

  return { ok: errors.length === 0, errors, count: problems.length };
}

function runningAsCli() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (runningAsCli()) {
  const result = validateCatalog(loadCatalog());
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  console.log(`catalog ok: ${result.count} problems`);
}
