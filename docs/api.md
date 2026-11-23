# API Documentation

Base path: `/api/v1`. OpenAPI JSON is served at `/api-docs`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Exchange email/password for access and refresh tokens |
| POST | `/auth/refresh` | Rotate refresh token |
| GET | `/auth/me` | Current user and permissions |
| GET | `/dashboard/summary` | Executive KPIs |
| GET | `/merchants` | Search and paginate merchants |
| GET | `/merchants/:id` | Merchant detail |
| GET | `/transactions` | Filter and paginate transaction aggregates |
| GET | `/analytics/revenue` | Revenue time series |
| GET | `/analytics/subscribers` | Subscriber time series |
| GET | `/alerts` | Rule-based alerts |
| GET | `/fraud/summary` | Risk-ranked merchant summary |

Protected routes require `Authorization: Bearer <access-token>`. List routes accept `page`, `limit`; analytics accept ISO `from` and `to` dates. Errors carry an HTTP status and stable error code.
