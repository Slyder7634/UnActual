import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../config.js";
import { copyToClipboard } from "../clipboard.js";

export async function build(task) {
  const config = loadConfig();

  if (config.files.length === 0) {
    console.warn("Warning: no files configured. Run: unactual configure");
  }

  const sections = config.files.map((entry) => {
    const abs = path.resolve(entry);
    if (!fs.existsSync(abs)) {
      throw new Error(`configured file is missing: ${entry}`);
    }
    const content = fs.readFileSync(abs, "utf8");
    return `## File: ${entry}\n\n\`\`\`\n${content}\n\`\`\``;
  });

  const message = [
    "# Task",
    "",
    task,
    "",
    ...(sections.length
      ? ["# Context files (read before making any change)", "", ...sections.flatMap((s) => [s, ""])]
      : []),
  ].join("\n");

  const copied = await copyToClipboard(message);

  if (!copied) {
    console.log(message);
    throw new Error("clipboard not available. Install xclip, xsel, or wl-copy on Linux.");
  }

  console.log(`Copied to clipboard (${config.files.length} file(s) attached).`);
}