# Contributing

## Pull requests

- Keep pull requests small. One change per pull request.
- Developers should describe the reason for a change in the pull request summary.
- Pull requests must link to the related ticket.
- Reviewers must check the change against the security rules before approval.
- Pull requests that change the database schema must include the migration file.
- Each pull request must pass the linter before review.

## Code style

- Functions should not exceed 50 lines.
- Public functions should have a doc comment.
- Files should not exceed 400 lines. Split larger modules by responsibility.
- Variable names should describe the value, not its type.
- Commented-out code should be removed before merging.
- Magic numbers should be replaced with named constants.

## Commits

- Commit messages should use the imperative mood.
- Commits should not mix formatting changes with logic changes.
- Never force push to the main branch.

## Dependencies

- New dependencies should be justified in the pull request description.
- Dependencies with known critical vulnerabilities must not be added.
- Developers should avoid adding a dependency for a function that the standard library provides.
