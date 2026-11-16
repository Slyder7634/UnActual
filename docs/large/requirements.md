# Requirements

## Architecture

- Database access must go through the repository layer. Handlers must never query the database directly.
- Business logic must not live in API handlers.
- Services must not import from API handler modules.
- Shared utilities must not depend on feature modules.
- External API calls must go through a client module, never directly from business logic.
- Background jobs must be idempotent.
- Cross-module communication must use defined service interfaces, not direct access to internal files.

## API design

- Every endpoint must return a consistent error format with a code and a message.
- List endpoints must support pagination.
- Breaking changes to public endpoints must be versioned.
- Endpoints that change data must validate the request body against a schema.
- Response times for read endpoints must stay under 300 milliseconds at the 95th percentile.
- Endpoints must return 401 for missing credentials and 403 for insufficient permissions.

## Data

- Schema changes must be delivered as migration files.
- Migrations must be reversible.
- Deleting user records must remove or anonymize related personal data.
- Timestamps must be stored in UTC.
- Money values must be stored as integers in the smallest currency unit.

## Testing

- New features must include tests for the main path and one failure case.
- Bug fixes must start with a failing test that reproduces the bug.
- Existing tests must pass before a change is merged.
- Repository layer code must have integration tests against a real database.
- Public API endpoints must have contract tests.
- Test data must not contain real personal information.

## Frontend

- Forms must show validation errors next to the field that caused them.
- Pages must remain usable at 320 pixels width.
- User-facing text must be stored in translation files, never hardcoded in components.
- Components must not fetch data directly. Data loading must go through hooks or services.
