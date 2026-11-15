# UnActual

A developer CLI that builds a structured prompt for AI coding assistants. It attaches the project files you configure (requirements, architecture, rules) to your task and copies the result to your clipboard. It does not call any AI or API.

## Why

Developers, and junior developers in particular, often forget the actual architecture of a project: what the system is versus what it is supposed to be. UnActual keeps those reference files in one place and includes them with every request, so the AI reads them before making changes.

## Requirements

- Node.js 18 or later
- A clipboard tool on Linux:
  - X11: `sudo apt install xclip`
  - Wayland: `sudo apt install wl-clipboard`
- macOS and Windows use built-in clipboard tools (`pbcopy` and `clip`).

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
unactual "<task>"     Build the prompt with configured files and copy it to the clipboard
unactual configure    Add, remove, or list configured files for this repo
unactual help         Show usage
```

### Example

```bash
cd your-repo
unactual configure            # add requirements.md, architecture.md, etc.
unactual "add a login page"   # prompt is copied to the clipboard
```

Paste the clipboard contents into your AI assistant.

## Configuration

Configuration is stored in `.unactual.json` in the directory where you run the command.

Run all commands from the repository root. Paths are relative to that directory. The tool checks that each path exists before saving it, and returns an error if it does not. It also rejects folders.

Commit `.unactual.json` so the team shares the same list.

```json
{
  "files": [
    "docs/requirements.md",
    "docs/architecture.md"
  ]
}
```

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

- Attaches files only. Plain text entries are not supported.
- No size limit. Large files produce large prompts, which some AI assistants may reject.
- Commands must be run from the repository root.
- Linux requires a clipboard tool (`xclip` or `wl-clipboard`).

## Project Structure

```
src/
  index.js            entry point, command routing, help
  config.js           read and write .unactual.json
  clipboard.js        copy text to the system clipboard
  commands/
    configure.js      add, remove, list configured files
    build.js          build the prompt and copy it
```