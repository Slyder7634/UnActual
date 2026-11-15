import fs from "node:fs";
import path from "node:path";

const CONFIG_NAME = ".unactual.json";

export function loadConfig(dir = process.cwd()) {
  const file = path.join(dir, CONFIG_NAME);
  if (!fs.existsSync(file)) return { files: [] };
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return { files: Array.isArray(data.files) ? data.files : [] };
}

export function saveConfig(config, dir = process.cwd()) {
  const file = path.join(dir, CONFIG_NAME);
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
}