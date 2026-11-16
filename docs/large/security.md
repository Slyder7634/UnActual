# Security

## Logging

- Never log passwords, tokens, or API keys.
- Always mask personal data in log output.
- Never log full credit card numbers or bank account details.
- Never write session identifiers to log files.
- Always include a request ID in error logs for traceability.
- Never log request bodies for authentication endpoints.

## Authentication

- Passwords must be hashed with bcrypt or argon2 before storage.
- Never return password hashes in API responses.
- Session tokens must expire after 30 minutes of inactivity.
- Login attempts must be rate limited per account and per IP address.
- Failed login responses must not reveal whether the username exists.
- Password reset tokens must be single use and expire within 15 minutes.
- Multi-factor authentication codes must not be reused.
- Never store authentication tokens in local storage in browser code.

## Input handling

- All user input must be validated before use.
- Never build SQL queries with string concatenation. Use parameterized queries.
- Uploaded files must be checked for type and size before processing.
- Never pass user input to shell commands without escaping.
- Never render user-supplied HTML without sanitizing it first.
- Redirect targets must be validated against an allow list.

## Secrets and configuration

- Never commit secrets, keys, or passwords to the repository.
- Secrets must be loaded from environment variables or a secret manager.
- Never print environment variables that contain secrets.
- Rotate API keys at least every 90 days.
- Development configuration must never point at production databases.

## Transport and data protection

- All external traffic must use TLS 1.2 or later.
- Personal data must be encrypted at rest.
- Database backups must be encrypted and access controlled.
- Never disable certificate verification in production code.
