# Software Requirements Specification

## Purpose and scope
Provide a role-aware application for merchant operations, revenue and subscriber monitoring, fraud triage, alert review, and executive analytics. The initial implementation provides a working dummy-data environment and an Oracle integration path.

## Functional requirements
- Authenticate users and issue expiring access tokens.
- Browse merchants and transactions with filtering and pagination.
- View revenue, subscriber, dashboard KPI, and risk/alert summaries.
- Generate deterministic synthetic data for local evaluation.
- Support Oracle-backed repositories without changing HTTP contracts.

## Non-functional requirements
- Node.js 20+, versioned REST API, input validation, structured logging, rate limiting, and Oracle bind variables.
- Responsive Airtel-inspired interface using native CSS.
- Automated backend/frontend unit tests and container health checks.

## Deferred production acceptance
SSO/MFA, full administrative user/role lifecycle, report export/email delivery, formal privacy review, load/security testing, and production Oracle execution plans require environment-specific approval before release.
