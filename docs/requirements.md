# Requirements

## Architecture

- Database access must go through the repository layer. Handlers must never query the database directly.
- Business logic must not live in API handlers.

## Testing

- New features must include tests for the main path and one failure case.
- Bug fixes must start with a failing test that reproduces the bug.
- Existing tests must pass before a change is merged.
