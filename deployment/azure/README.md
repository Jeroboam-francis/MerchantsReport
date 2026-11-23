# Azure deployment

Deploy the backend and static frontend as separate Container Apps (or use the Compose stack for a controlled single-host deployment). Store JWT secrets and Oracle credentials in Azure Key Vault and inject them as Container App secrets. Configure HTTPS ingress, health probes at `/health`, restricted database network access, and Azure Monitor collection. Run database migrations as a reviewed release step; do not run schema DDL automatically during application startup.
