#!/usr/bin/env node
import { configure } from "./commands/configure.js";
import { build } from "./commands/build.js";
import { rules } from "./commands/rules.js";

function help() {
  console.log(`Usage:
  unactual "<task>"        build the brief with rules and context files, copy to clipboard
  unactual configure       manage context files for this repo
  unactual rules init      draft rules from configured files into .unactual/rules.json
  unactual rules list      list rules and their status
  unactual help            show this help`);
}

async function main() {
  const args = process.argv.slice(2);
  const first = args[0];

  if (!first || first === "help" || first === "--help" || first === "-h") return help();
  if (first === "configure") return configure();
  if (first === "rules") return rules(args[1]);
  return build(args.join(" "));
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});