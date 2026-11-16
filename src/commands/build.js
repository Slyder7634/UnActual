import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { loadRules } from "../rules.js";
import { copyToClipboard } from "../clipboard.js";
import { detectTask, detectLanguage, mentionedFiles, repoFiles } from "../analyze.js";
import { selectRules } from "../select.js";
import { clarify, buildBrief } from "../rewrite.js";

export async function build(task) {
  const config = loadConfig();
  const rules = loadRules();

  if (rules.length === 0) console.warn("Warning: no rules loaded. Run: unactual rules init");
  if (config.files.length === 0) console.warn("Warning: no context files configured. Run: unactual configure");

  const { type, confidence } = detectTask(task);
  const targets = mentionedFiles(task, repoFiles());
  const language = detectLanguage(task, targets);

  const { rules: selected, applied } = selectRules({
    prompt: task,
    task: type,
    language,
    targets,
    rules,
  });

  const questions = clarify({ prompt: task, task: type, confidence, targets, language });
  const brief = buildBrief({ prompt: task, task: type, targets, language, rules: selected });

  const context = config.files.map((entry) => {
    const abs = path.resolve(entry);
    if (!fs.existsSync(abs)) throw new Error(`configured file is missing: ${entry}`);
    return `## File: ${entry}\n\n\`\`\`\n${fs.readFileSync(abs, "utf8")}\n\`\`\``;
  });

  const message = [
    brief,
    ...(context.length
      ? ["# Context files (read before making any change)", "", ...context.flatMap((s) => [s, ""])]
      : []),
  ].join("\n");

  const copied = await copyToClipboard(message);

  if (!copied) {
    console.log(message);
    throw new Error("clipboard not available. Install xclip, xsel, or wl-copy on Linux.");
  }

  if (applied.length) {
    console.log("Applied rules:");
    for (const a of applied) console.log(`  ${a.id.padEnd(9)} ${a.reason}`);
  }
  console.log(`Copied to clipboard (${context.length} context file(s), ${selected.length} rule(s)).`);

  if (questions.length) {
    console.log("\nAnswer before sending:");
    for (const q of questions) console.log(`  - ${q}`);
  }
}