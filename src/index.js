#!/usr/bin/env node
import { configure } from "./commands/configure.js";
import { build } from "./commands/build.js";

function help() {
  console.log(`Usage:
  unactual "<task>"     build prompt with configured files and copy to clipboard
  unactual configure    manage configured files for this repo
  unactual help         show this help`);
}

async function main() {
  const args = process.argv.slice(2);
  const first = args[0];

  if (!first || first === "help" || first === "--help" || first === "-h") {
    return help();
  }
  if (first === "configure") {
    return configure();
  }
  return build(args.join(" "));
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});