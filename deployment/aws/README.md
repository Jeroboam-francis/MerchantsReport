# AWS deployment

Recommended baseline: ECS Fargate services behind an Application Load Balancer, frontend delivered through CloudFront/S3 or a container, and Oracle connectivity through private subnets to RDS for Oracle or an approved Oracle service. Store credentials in Secrets Manager, use task roles, enable ALB health checks on `/health`, and forward structured logs to CloudWatch. Apply database DDL through a controlled migration job.
