# Operations

## Deployment

- Deployments must be performed through the CI pipeline, never by hand.
- Every deployment must have a rollback plan documented in the release notes.
- Feature flags should be used for changes that cannot be rolled back quickly.
- Production deployments must not occur on Fridays after 14:00.

## Monitoring

- Every service must expose a health check endpoint.
- Errors must be reported to the central error tracker with the request ID.
- Alerts must link to a runbook.
- Metrics should be named with the service name as a prefix.

## Incidents

- Incidents must be recorded in the incident tracker within one hour of detection.
- Post-incident reviews must be written without assigning personal blame.
- Hotfixes must be merged back into the main branch the same day.
