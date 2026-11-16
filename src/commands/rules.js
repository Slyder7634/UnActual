import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { loadRules, saveRules, draftRules, PREFIX } from "../rules.js";

export function rules(sub) {
  if (sub === "init") return init();
  if (sub === "list") return list();
  console.log("Usage: unactual rules init | unactual rules list");
}

function init() {
  const config = loadConfig();
  if (config.files.length === 0) {
    throw new Error("no configured files. Run: unactual configure");
  }

  const all = loadRules();
  const seen = new Set(all.map((r) => r.text));
  let n = Math.max(0, ...all.map((r) => Number(r.id?.split("-")[1]) || 0)) + 1;
  let added = 0;

  for (const entry of config.files) {
    const text = fs.readFileSync(path.resolve(entry), "utf8");
    for (const r of draftRules(text, entry)) {
      if (seen.has(r.text)) continue;
      seen.add(r.text);
      r.id = `${PREFIX[r.category]}-${String(n++).padStart(3, "0")}`;
      all.push(r);
      added++;
    }
  }

  saveRules(all);
  console.log(`Drafted ${added} rule(s) in .unactual/rules.json.`);
  console.log('Review them and set "status" to "active" on the rules to keep. Delete the rest.');
}

function list() {
  const all = loadRules();
  if (all.length === 0) {
    console.log("No rules. Run: unactual rules init");
    return;
  }
  for (const r of all) {
    console.log(`${r.id.padEnd(9)} ${r.status.padEnd(10)} ${r.category.padEnd(12)} ${r.text}`);
  }
}