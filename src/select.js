import { tokenize, tfidf, cosine } from "./text.js";

const ORDER = { security: 0, requirement: 1, guideline: 2 };

function globToRegex(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") {
        re += "(?:.*/)?";
        i += 2;
      } else {
        re += ".*";
        i += 1;
      }
    } else if (c === "*") {
      re += "[^/]*";
    } else {
      re += c.replace(/[.+^${}()|[\]\\?]/g, "\\$&");
    }
  }
  return new RegExp("^" + re + "$");
}

// With no target files, scope is not used to filter.
export function matchScope(scope, targets) {
  if (!targets.length || !scope || !scope.length) return true;
  const patterns = scope.map(globToRegex);
  return targets.some((f) => patterns.some((p) => p.test(f)));
}

export function selectRules({ prompt, task, language, targets, rules, budget = 800 }) {
  const active = rules.filter((r) => r.status === "active");
  const byId = new Map(active.map((r) => [r.id, r]));
  const mandatory = active.filter((r) => r.always);

  const pool = active.filter(
    (r) =>
      !r.always &&
      (!r.languages?.length || !language || r.languages.includes(language)) &&
      (!r.change_types?.length || !task || r.change_types.includes(task)) &&
      matchScope(r.scope, targets)
  );

  const promptTokens = tokenize(prompt);
  const lower = prompt.toLowerCase();
  const vecs = tfidf([
    promptTokens,
    ...pool.map((r) => tokenize(`${r.text} ${(r.triggers ?? []).join(" ")}`)),
  ]);

  const ranked = pool
    .map((rule, i) => {
      const sim = cosine(vecs[0], vecs[i + 1]);
      const hits = (rule.triggers ?? []).filter((t) => {
        const tl = t.toLowerCase();
        return tl.includes(" ") ? lower.includes(tl) : promptTokens.includes(tl);
      });
      const score = sim + 0.15 * hits.length + 0.1 * (rule.priority ?? 0.5);
      return { rule, sim, hits, score };
    })
    .filter((x) => x.hits.length > 0 || x.sim > 0.05)
    .sort(
      (a, b) =>
        b.score / (b.rule.tokens || 1) - a.score / (a.rule.tokens || 1)
    );

  const selected = [];
  const ids = new Set();
  const applied = [];

  const conflicts = (r) =>
    selected.some(
      (s) => (r.conflicts_with ?? []).includes(s.id) || (s.conflicts_with ?? []).includes(r.id)
    );

  const add = (r, reason) => {
    if (ids.has(r.id)) return;
    ids.add(r.id);
    selected.push(r);
    applied.push({ id: r.id, reason });
    for (const dep of r.requires ?? []) {
      if (byId.has(dep)) add(byId.get(dep), `required by ${r.id}`);
    }
  };

  for (const r of mandatory) add(r, "mandatory: security or data rule");

  const used = () => selected.reduce((n, r) => n + (r.tokens ?? 0), 0);

  for (const { rule, sim, hits } of ranked) {
    if (ids.has(rule.id) || conflicts(rule)) continue;
    if (used() + (rule.tokens ?? 0) > budget) continue;
    const reason = hits.length
      ? `matched trigger '${hits[0]}'`
      : `relevance ${sim.toFixed(2)}`;
    add(rule, reason);
  }

  selected.sort((a, b) => ORDER[a.category] - ORDER[b.category]);
  return { rules: selected, applied };
}