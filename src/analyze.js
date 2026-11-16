import fs from "node:fs";
import path from "node:path";
import { tokenize } from "./text.js";

const TASK_KEYWORDS = {
  bugfix: { fix: 3, bug: 3, broken: 2, error: 2, crash: 2, fails: 2, failing: 2, regression: 2 },
  test: { test: 3, tests: 3, coverage: 2, spec: 2, unittest: 2 },
  refactor: { refactor: 3, rename: 2, cleanup: 2, restructure: 2, extract: 2, simplify: 2 },
  migration: { migrate: 3, migration: 3, upgrade: 2 },
  feature: { add: 2, implement: 2, create: 2, build: 2, new: 1, support: 1, feature: 2 },
};

const LANG_NAMES = {
  python: ["python", "django", "flask"],
  javascript: ["javascript", "node", "nodejs", "react"],
  typescript: ["typescript"],
  go: ["golang"],
  java: ["java", "spring"],
  csharp: ["csharp", "dotnet"],
};

const EXT_LANG = {
  ".py": "python",
  ".js": "javascript",
  ".mjs": "javascript",
  ".jsx": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".go": "go",
  ".java": "java",
  ".cs": "csharp",
};

export function detectTask(prompt) {
  const tokens = tokenize(prompt);
  const scores = {};
  for (const [type, kw] of Object.entries(TASK_KEYWORDS)) {
    scores[type] = tokens.reduce((sum, t) => sum + (kw[t] ?? 0), 0);
  }
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return { type: null, confidence: 0 };
  const [type, best] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return { type, confidence: best / total };
}

export function detectLanguage(prompt, targets) {
  const tokens = new Set(tokenize(prompt));
  for (const [lang, names] of Object.entries(LANG_NAMES)) {
    if (names.some((n) => tokens.has(n))) return lang;
  }
  for (const t of tokens) {
    if (EXT_LANG[path.extname(t)]) return EXT_LANG[path.extname(t)];
  }
  for (const f of targets) {
    if (EXT_LANG[path.extname(f)]) return EXT_LANG[path.extname(f)];
  }
  return null;
}

function bigrams(s) {
  const m = new Map();
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    m.set(g, (m.get(g) ?? 0) + 1);
  }
  return m;
}

function dice(a, b) {
  const A = bigrams(a);
  const B = bigrams(b);
  let inter = 0;
  for (const [g, c] of A) inter += Math.min(c, B.get(g) ?? 0);
  const total = (a.length - 1) + (b.length - 1);
  return total > 0 ? (2 * inter) / total : 0;
}

export function mentionedFiles(prompt, files) {
  const candidates = [...new Set(tokenize(prompt))].filter(
    (t) => t.includes(".") || t.includes("/")
  );
  const found = new Set();

  for (const raw of candidates) {
    const t = raw.replace(/^\.\//, "");
    const exact = files.find((f) => f === t || f.endsWith("/" + t));
    if (exact) {
      found.add(exact);
      continue;
    }
    const ext = path.extname(t);
    let best = null;
    let bestScore = 0.85;
    for (const f of files) {
      if (path.extname(f) !== ext) continue;
      const score = dice(t, path.basename(f));
      if (score >= bestScore) {
        best = f;
        bestScore = score;
      }
    }
    if (best) found.add(best);
  }
  return [...found];
}

export function repoFiles(root = process.cwd(), limit = 5000) {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (out.length >= limit) return;
      if (e.name === "node_modules" || e.name === ".git") continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else out.push(path.relative(root, full).split(path.sep).join("/"));
    }
  };
  walk(root);
  return out;
}