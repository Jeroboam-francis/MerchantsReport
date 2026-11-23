# Architecture Guide

## System context

The React SPA calls a versioned Express REST API. Controllers validate transport input and delegate to services; services use repositories selected by `APP_MODE`. Dummy mode uses deterministic local records; Oracle mode uses bind-variable SQL through `node-oracledb`. Analytics and risk logic are provider-independent.

## Boundaries

- `backend/src/repositories`: storage implementations and provider selection.
- `backend/src/services`: business operations, analytics, risk, alerts.
- `backend/src/routes`: versioned HTTP surface and validation.
- `frontend/src/services`: API client; auth token state is held in Context.
- `database/schema`: repeatable Oracle DDL, separate from runtime startup.

## Operational principles

Use least privilege for the Oracle account, bind variables for all user data, avoid logging credentials or personal identifiers, paginate list endpoints, and monitor health/readiness separately in a production rollout. The demo mode is intentionally not a durable multi-instance data store.
