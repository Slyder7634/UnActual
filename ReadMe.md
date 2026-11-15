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

From the project folder:

```bash
npm install
npm link
```

`npm link` registers the `unactual` command on your system. After editing the source, you do not need to link again.

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

Configuration is stored in `.unactual.json` in the directory where you run the command. Run it from the repository root and commit the file so the team shares the same list.

```json
{
  "files": [
    "docs/requirements.md",
    "docs/architecture.md"
  ]
}
```

Paths are relative to the repository root. The tool checks that each path exists before saving it, and returns an error if it does not. It also rejects folders.