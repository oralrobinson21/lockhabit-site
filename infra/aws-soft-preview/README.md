# Soft-safe LockHabit AWS SSR preview (App Runner)

> **SOFT HOLD:** Never create Route 53 records or attach `lockhabit.com` /
> `www.lockhabit.com`. Soft URLs only until Oral GO.

## Creates

- Private ECR repo
- IAM role for App Runner → ECR
- App Runner Soft service (port 3000)
- Optional CloudFront Soft distribution (`*.cloudfront.net`)
- Soft URL outputs only

## Does not create

- Route 53 / ACM custom domains
- Railway teardown

## Usage (two Soft phases)

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init

# Phase A — Soft registry
terraform apply -target=aws_ecr_repository.soft -target=aws_ecr_lifecycle_policy.soft

# Build/push Soft image (root Dockerfile), then Phase B:
terraform plan    # confirm: no Route53 / no lockhabit.com
terraform apply
```

Set Stripe TEST / Supabase / Resend secrets in App Runner console or CI after
apply. Never commit secrets to `terraform.tfvars`.
