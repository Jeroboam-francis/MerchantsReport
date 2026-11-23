# Deployment Guide

## Docker
Set secure values in a deployment secret store (or a local `.env` for development), then run `docker compose up --build`. Frontend traffic is exposed on port 8080; Nginx proxies `/api` to the backend. Do not commit `.env`.

## Cloud
See `deployment/azure/README.md` and `deployment/aws/README.md`. Deploy immutable images, use managed secrets, health probes, TLS, private Oracle connectivity, and a controlled schema migration job. Review the CI workflow before enabling automated release/deployment.
