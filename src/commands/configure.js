import inquirer from "inquirer";
import fs from "node:fs";
import path from "node:path";
import { loadConfig, saveConfig } from "../config.js";

const MENU = [
  { name: "Add file", value: "add" },
  { name: "Remove file", value: "remove" },
  { name: "List files", value: "list" },
  { name: "Exit", value: "exit" },
];

async function addFile(config) {
  const { input } = await inquirer.prompt([
    {
      type: "input",
      name: "input",
      message: "Path to file:",
      validate: (v) => v.trim() !== "" || "Path cannot be empty",
    },
  ]);

  const abs = path.resolve(input.trim());

  if (!fs.existsSync(abs)) {
    console.error(`Error: path does not exist: ${abs}`);
    return;
  }
  if (!fs.statSync(abs).isFile()) {
    console.error(`Error: not a file: ${abs}`);
    return;
  }

  const entry = path.relative(process.cwd(), abs);
  if (config.files.includes(entry)) {
    console.error(`Error: already configured: ${entry}`);
    return;
  }

  config.files.push(entry);
  saveConfig(config);
  console.log(`Added: ${entry}`);
}

async function removeFile(config) {
  if (config.files.length === 0) {
    console.log("No files configured.");
    return;
  }

  const { entry } = await inquirer.prompt([
    {
      type: "list",
      name: "entry",
      message: "Remove which file?",
      choices: config.files,
    },
  ]);

  config.files = config.files.filter((f) => f !== entry);
  saveConfig(config);
  console.log(`Removed: ${entry}`);
}

function listFiles(config) {
  if (config.files.length === 0) {
    console.log("No files configured.");
    return;
  }
  config.files.forEach((f) => console.log(f));
}

export async function configure() {
  const config = loadConfig();

  for (;;) {
    const { action } = await inquirer.prompt([
      { type: "list", name: "action", message: "Configure", choices: MENU },
    ]);

    if (action === "exit") return;
    if (action === "add") await addFile(config);
    if (action === "remove") await removeFile(config);
    if (action === "list") listFiles(config);
  }
}