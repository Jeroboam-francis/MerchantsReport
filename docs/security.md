# Security Notes

Implemented baseline controls include JWT expiration, bcrypt password hashes, role checks, request validation, rate limiting, Helmet headers, strict CORS, body-size limits, request IDs, parameterized Oracle statements, and normalized errors.

Production hardening still requires key rotation, refresh-token persistence/revocation, CSRF strategy if switching to cookies, identity-provider/MFA integration, audit-log retention, dependency scanning, penetration testing, and approval of PII handling. Do not expose demo credentials or synthetic-user records as real merchant data.
