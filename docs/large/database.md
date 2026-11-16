# Database

## Queries

- Queries must use parameters, never string interpolation.
- Queries that return many rows must be paginated or streamed.
- N+1 query patterns should be avoided. Use joins or batch loading.
- Long-running queries must have a timeout set.
- Transactions should be kept as short as possible.

## Schema

- Every table must have a primary key.
- Foreign keys must be defined in the database, not only in application code.
- Columns that are queried often should have an index.
- Soft-deleted rows must be excluded from default queries.
- Column names should use snake_case.

## Connections

- Database connections must be released after use.
- Connection pool size must be configured per service, not hardcoded.
- Database credentials must not appear in source code.

## Migrations

- Migrations must be reviewed by a second developer before running in production.
- Destructive migrations must be preceded by a backup.
- Migrations should not depend on application code.
