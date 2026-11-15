import { spawn } from "node:child_process";

const COMMANDS = {
  darwin: [["pbcopy", []]],
  win32: [["clip", []]],
  linux: [
    ["wl-copy", []],
    ["xclip", ["-selection", "clipboard"]],
    ["xsel", ["--clipboard", "--input"]],
  ],
};

function run(cmd, args, text) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ["pipe", "ignore", "ignore"] });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
    child.stdin.end(text);
  });
}

export async function copyToClipboard(text) {
  for (const [cmd, args] of COMMANDS[process.platform] ?? []) {
    if (await run(cmd, args, text)) return true;
  }
  return false;
}