const ACCEPTANCE = {
  feature: [
    "The new behavior works end to end.",
    "Existing tests still pass.",
    "New code has tests for the main path and one failure case.",
  ],
  bugfix: [
    "Write a failing test that reproduces the bug first.",
    "The fix makes that test pass without breaking others.",
    "No unrelated changes.",
  ],
  refactor: [
    "Behavior is unchanged. Existing tests pass without edits.",
    "No new features in this change.",
  ],
  test: [
    "New tests fail on the broken behavior and pass on the fixed behavior.",
    "No production code changes unless required to make the tests run.",
  ],
  migration: [
    "Old and new paths produce the same results on the test data.",
    "A rollback path is documented.",
  ],
};

export function clarify({ prompt, task, confidence, targets, language }) {
  const q = [];
  if (prompt.trim().split(/\s+/).length < 4) {
    q.push("The task is very short. What should the result do?");
  }
  if (!task || confidence < 0.5) {
    q.push("What kind of change is this: feature, bugfix, refactor, test, or migration?");
  }
  if (!targets.length) {
    q.push("Which files should change? Name them in the task.");
  }
  if (!language) {
    q.push("Which language or framework does this use?");
  }
  return q;
}

export function buildBrief({ prompt, task, targets, language, rules }) {
  const lines = [];
  lines.push(`# Task${task ? ` (${task})` : ""}`, "", prompt.trim(), "");

  lines.push("## Target files");
  lines.push(...(targets.length ? targets.map((t) => `- ${t}`) : ["- Not specified"]), "");

  lines.push("## Language", language ?? "Not specified", "");

  const section = (title, category) => {
    const items = rules.filter((r) => r.category === category);
    if (!items.length) return;
    lines.push(`## ${title}`, ...items.map((r) => `- [${r.id}] ${r.text}`), "");
  };
  section("Security rules (must follow)", "security");
  section("Project requirements", "requirement");
  section("Project guidelines", "guideline");

  if (task && ACCEPTANCE[task]) {
    lines.push("## Acceptance criteria", ...ACCEPTANCE[task].map((c) => `- ${c}`), "");
  }

  lines.push(
    "## Scope",
    "Make only the changes this task requires. Do not add requirements beyond those listed here.",
    ""
  );

  return lines.join("\n");
}