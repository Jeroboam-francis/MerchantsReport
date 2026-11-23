<<<<<<< HEAD
# Merchant Analytics Platform

A full-stack foundation for merchant management, transaction monitoring, revenue and subscriber analytics, alerts, and fraud review. The initial release runs in **Dummy Data Mode** and includes an Oracle schema and reproducible PL/SQL seed path for migration to Oracle.

> This repository is a development foundation, not a certified production deployment. Before production use, replace demo credentials, provision secrets through a secret manager, validate business rules and Oracle compatibility against your target database, and complete operational/security acceptance testing.

## Architecture

- **Frontend:** React, React Router, Axios, Context API, native CSS, Recharts.
- **Backend:** Node.js 20+, Express, JWT, bcrypt, validation, Winston, scheduled jobs.
- **Database:** Oracle DDL, indexes, views, materialized view, package, procedure, sequences.
- **Modes:** `APP_MODE=dummy` runs without Oracle. `APP_MODE=oracle` requires Oracle connection settings and uses the Oracle adapter.
- **Deployment:** Docker Compose (app + Nginx), GitHub Actions CI, Azure/AWS deployment notes.

## Quick start

1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env`; replace both JWT secrets and the seed admin password.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

Seed login uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env`. Never use the example credentials outside local development.

The local-only `.env` in this workspace is configured with `admin@merchant-analytics.local` / `LocalDemo-Only-2026!`. These are development credentials; replace them before any shared or production deployment.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start backend and frontend |
| `npm test` | Run backend and frontend tests |
| `npm run build` | Build the frontend |
| `npm run seed:oracle` | Write Oracle seed SQL to `database/seeds/generated_seed.sql` |
| `docker compose up --build` | Run the containerized application |

## API

Backend base URL: `http://localhost:4000/api/v1`. OpenAPI contract: `http://localhost:4000/api-docs`.

Initial routes include auth, dashboard KPIs, merchants, transactions, revenue series, subscriber series, alerts, and fraud-risk summaries. API responses use `{ data }`; errors use `{ error: { code, message, details? } }`.

## Oracle setup

Connect as the intended application schema owner and run scripts in order:

1. `database/schema/001_tables.sql`
2. `database/schema/002_indexes.sql`
3. `database/schema/003_analytics.sql`
4. `database/schema/004_security.sql`
5. `database/seeds/seed_dummy_data.sql` (or generate a customized seed with `npm run seed:oracle`)

The seed procedure generates 50 merchants, 100 profiles, 100,000 transactions, 10,000 transaction details, and 24 monthly subscriber observations. No real personal information is included.

## Project map

```text
backend/       Express API, services, repositories, jobs and tests
frontend/      React application, pages, components and styles
database/      Oracle schema, analytics objects and dummy seed
deployment/    Azure and AWS deployment references
docker/        Nginx configuration
docs/          Architecture, API, database, operations, security, SRS and TDD
scripts/       Oracle seed generator
tests/         Cross-project acceptance test notes
```

See [docs/architecture.md](docs/architecture.md), [docs/deployment.md](docs/deployment.md), and [docs/operations.md](docs/operations.md) for implementation and operating guidance.
=======
# merchants
>>>>>>> origin/main
