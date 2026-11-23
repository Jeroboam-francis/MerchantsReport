# Operations Guide

## Local operations
Use `.env.example` as a template, choose unique secrets, then run `npm install` and `npm run dev`. The health endpoint is `/health`; logs are structured JSON to stdout and a rotating local file in development.

## Production checklist
- Configure strong, independently generated JWT keys in a secret manager.
- Replace seed accounts and enforce enterprise identity, MFA, and audited access.
- Set restrictive CORS origins, TLS, reverse-proxy limits, and database network policy.
- Configure Oracle pool sizing and service account grants; test pool health and failover.
- Establish retention, backups, restore drills, monitoring/alerts, and incident ownership.
- Review synthetic-data assumptions and all risk rules with business stakeholders.

## Backup and recovery
Back up Oracle using the organization's RMAN/Data Guard standards; test point-in-time recovery. Back up configuration and deployment definitions in version control, never secrets. The dummy repository is ephemeral and is not backed up.
