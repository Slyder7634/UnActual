# UnActual

A developer CLI that builds a structured brief for AI coding assistants. It selects project rules that match your task, attaches the context files you configure, and copies the result to your clipboard. It does not call any AI model or API.

## Why

Developers, and junior developers in particular, often forget the actual architecture of a project: what the system is versus what it is supposed to be. UnActual keeps the team's rules and reference documents in the repository and includes the relevant ones with every task, so the AI reads them before making changes.

## Requirements

- Node.js 18 or later
- A clipboard tool on Linux:
  - X11: `sudo apt install xclip`
  - Wayland: `sudo apt install wl-clipboard`
- macOS uses `pbcopy` and Windows uses `clip`. Both are built in.

## Installation

Install globally from GitHub:

```bash
npm install -g github:Slyder7634/UnActual
```

Verify the installation:

```bash
unactual help
```

### Development setup

From the cloned project folder:

```bash
npm install
npm link
```

`npm link` registers the `unactual` command from your local source. After editing the source, you do not need to link again.

## Usage

```bash
unactual "<task>"          Build the brief, select rules, and copy it to the clipboard
unactual configure         Add, remove, or list context files for this repo
unactual rules init        Draft rules from the configured files into .unactual/rules.json
unactual rules list        List rules with their ID, status, category, and text
unactual help              Show usage
```

## Quick start

Run these from the root of your repository:

```bash
unactual configure            # add docs/security.md, docs/requirements.md, etc.
unactual rules init           # draft rules from those files
unactual rules list           # review the drafts
unactual "add a login endpoint that checks the password"
```

Paste the clipboard contents into your AI assistant.

## How it works

1. **Configure.** `unactual configure` records the context files in `.unactual.json`.
2. **Draft rules.** `unactual rules init` reads each configured file, splits it into sections, and extracts sentences that contain a modal verb such as "must", "never", "always", or "avoid". Each sentence becomes a draft rule. Drafts are added to `.unactual/rules.json`. Rules that already exist, matched by text, are not duplicated.
3. **Review.** Open `.unactual/rules.json` and set `"status"` to `"active"` on the rules you want to use. Delete the rest. Only active rules are ever selected. You can also correct the `category`, `always`, `scope`, `languages`, `change_types`, and `triggers` fields.
4. **Analyze the task.** UnActual detects the task type (feature, bugfix, refactor, test, or migration) from keywords, the language from keywords or file extensions, and any files the task mentions.
5. **Select rules.**
   - Every active rule with `"always": true` is included. These are security and data-handling rules.
   - Other active rules are included only if their language, change type, and scope match the task.
   - Remaining rules are ranked by TF-IDF similarity to the task, plus exact trigger matches and priority, and added within a token budget.
   - Each included rule records a reason, such as "mandatory", "matched trigger 'password'", or "required by SEC-004".
6. **Build the brief.** The brief contains the task, target files, language, the selected rules grouped by category, acceptance criteria for the task type, and a scope note.
7. **Attach context.** The full contents of every configured context file are appended after the brief.
8. **Copy.** The result is copied to the clipboard, and the applied rules and their reasons are printed to the terminal.

### Example output

```
# Task (feature)

add a login endpoint that checks the password

## Target files
- services/auth/api/login.py

## Language
python

## Security rules (must follow)
- [SEC-003] Never log passwords, tokens, or API keys.
- [SEC-005] Passwords must be hashed with bcrypt or argon2 before storage.

## Project requirements
- [REQ-010] Database access must go through the repository layer.

## Acceptance criteria
- The new behavior works end to end.
- Existing tests still pass.
- New code has tests for the main path and one failure case.

## Scope
Make only the changes this task requires. Do not add requirements beyond those listed here.

# Context files (read before making any change)

## File: docs/security.md
...
```

## Configuration

Two files are stored in the repository root and should be committed so the team shares them:

- `.unactual.json` lists the context files.
- `.unactual/rules.json` holds the rules.

```json
{
  "files": [
    "docs/security.md",
    "docs/requirements.md"
  ]
}
```

Paths are resolved from the directory where you run the command, so run all commands from the repository root. The tool checks that each configured path exists before saving it, and rejects folders.

### Rule format

```json
{
  "id": "SEC-003",
  "text": "Never log passwords, tokens, or API keys.",
  "source": "docs/security.md",
  "section": "Logging",
  "category": "security",
  "scope": ["**"],
  "languages": [],
  "change_types": [],
  "triggers": ["password", "tokens", "log"],
  "always": true,
  "priority": 1.0,
  "requires": [],
  "conflicts_with": [],
  "tokens": 16,
  "status": "active"
}
```

- `status`: `draft`, `active`, or `deprecated`. Only `active` rules are selected.
- `category`: `security`, `requirement`, or `guideline`. Sets the section and the default priority.
- `always`: includes the rule in every brief. Keep this list short and limited to security and data handling.
- `scope`: glob patterns matched against target files. `["**"]` matches everything. Empty means any.
- `languages` and `change_types`: empty means any.
- `triggers`: words or phrases that raise a rule's ranking when they appear in the task.
- `requires` and `conflicts_with`: rule IDs. A required rule is added with the rule that needs it. A conflicting rule is not added alongside the one it conflicts with.
- `tokens`: estimated size, used for the budget.

Drafted rules have empty `scope`, `languages`, and `change_types`, so they apply to every task until you narrow them.

## Commands

| Command | Purpose |
|---|---|
| `unactual configure` | Add, remove, or list context files |
| `unactual rules init` | Draft rules from configured files. Adds only new rules. |
| `unactual rules list` | Show every rule with its ID, status, and category |
| `unactual "<task>"` | Build the brief and copy it |
| `unactual help` | Show usage |

## Update

Run the install command again:

```bash
npm install -g github:Slyder7634/UnActual
```

## Uninstall

```bash
npm uninstall -g unactual
```

## Limitations

Version 1 has these limits:

- Rule extraction is heuristic. Review every draft. A sentence may be drafted in the wrong category or with a poor trigger list.
- Negation is not understood. "Do not store passwords in plain text" is treated like any other sentence.
- Task type and language are detected from keywords. Questions such as "how to add a feature?" are treated as feature tasks. Use a concrete task statement.
- Clarifying questions are printed to the terminal only and are not included in the clipboard brief.
- Context files are attached in full. Large files produce large prompts, which some assistants may reject.
- Commands must be run from the repository root.
- Windows paths saved in `.unactual.json` may use backslashes, which do not resolve on other systems. Use forward slashes.
- The selection logic has no automated tests yet.

## Project structure

```
src/
  index.js            entry point, routing, help
  config.js           read and write .unactual.json
  clipboard.js        copy text to the system clipboard
  text.js             tokenize, TF-IDF, cosine similarity
  analyze.js          task type, language, mentioned files, repo file list
  rules.js            load and save rules, draft rules from documents
  select.js           mandatory rules, scope filter, ranking, budget, reasons
  rewrite.js          brief and clarifying questions
  commands/
    configure.js      add, remove, list context files
    build.js          analyze, select, build brief, copy
    rules.js          rules init, rules list
```

## Status

Version 1. Rule selection is deterministic and runs without an AI model or external service.