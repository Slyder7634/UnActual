import fs from "node:fs";
import path from "node:path";
import { tokenize } from "./text.js";

export const RULES_DIR = ".unactual";
export const RULES_FILE = path.join(RULES_DIR, "rules.json");
export const PREFIX = { security: "SEC", requirement: "REQ", guideline: "GUI" };

const PRIORITY = { security: 1.0, requirement: 0.8, guideline: 0.5 };
const MODAL = /\b(must|never|always|avoid|do not|don't|shall|should not)\b/i;
const SECURITY = /\b(password|passwords|token|tokens|secret|secrets|credential|credentials|api key|auth|encrypt|encryption|sql|injection|pii|log|logs|logging)\b/i;
const REQUIREMENT = /\b(must|shall|required)\b/i;

export function loadRules(dir = process.cwd()) {
  const file = path.join(dir, RULES_FILE);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8")).rules ?? [];
}

export function saveRules(rules, dir = process.cwd()) {
  fs.mkdirSync(path.join(dir, RULES_DIR), { recursive: true });
  fs.writeFileSync(path.join(dir, RULES_FILE), JSON.stringify({ rules }, null, 2) + "\n");
}

// Returns draft rules without ids. The caller assigns ids after de-duplication.
export function draftRules(text, source) {
  const out = [];
  let section = "";

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const heading = line.match(/^#+\s+(.*)$/);
    if (heading) {
      section = heading[1];
      continue;
    }

    for (const piece of line.replace(/^[-*]\s+/, "").split(/(?<=[.!?])\s+/)) {
      const sentence = piece.trim();
      if (sentence.length < 20 || !MODAL.test(sentence)) continue;

      const category = SECURITY.test(sentence)
        ? "security"
        : REQUIREMENT.test(sentence)
          ? "requirement"
          : "guideline";

      out.push({
        text: sentence,
        source,
        section,
        category,
        scope: ["**"],
        languages: [],
        change_types: [],
        triggers: [...new Set(tokenize(sentence).filter((t) => t.length > 3))].slice(0, 5),
        always: category === "security",
        priority: PRIORITY[category],
        requires: [],
        conflicts_with: [],
        tokens: Math.ceil(sentence.length / 4),
        status: "draft",
      });
    }
  }
  return out;
}