# API Guidelines

## Naming

- Endpoint paths should use plural nouns, such as /users and /orders.
- Path segments should use kebab-case.
- Query parameters should use camelCase.
- Resource identifiers in paths should not expose internal database sequence numbers.

## Responses

- Successful creation should return status 201 with the created resource.
- Deletion should return status 204 with no body.
- Errors should not include stack traces in production responses.
- Responses should not include fields the client did not request when a field selection is supported.

## Versioning

- The API version must appear in the URL path, such as /v1/users.
- Deprecated endpoints should return a deprecation header.

## Rate limiting

- Public endpoints should return rate limit headers on every response.
- Clients exceeding the rate limit must receive status 429 with a retry-after header.
