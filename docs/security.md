# Security

## Logging

- Never log passwords, tokens, or API keys.
- Always mask personal data in log output.

## Authentication

- Passwords must be hashed with bcrypt or argon2 before storage.
- Never return password hashes in API responses.
- Session tokens must expire after 30 minutes of inactivity.

## Input handling

- All user input must be validated before use.
- Never build SQL queries with string concatenation. Use parameterized queries.
