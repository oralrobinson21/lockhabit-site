# Soft preview host — apply checklist

> Soft HOLD: Soft URLs only. No Route 53, no custom domains, no Railway changes.
> Do **not** Soft-apply if your SSO session lacks even Soft deploy rights — escalate
> OWNER_ONLY instead of using root keys.

## Choose Soft stack

| App needs Node at request time? | Soft stack |
| --- | --- |
| Yes (LockHabit SSR, Stripe webhook, server fns) | [`infra/aws-soft-preview`](../../infra/aws-soft-preview/) |
| No (static marketing shell) | [`infra/aws-soft-static-preview`](../../infra/aws-soft-static-preview/) |

LockHabit = **SSR Soft**. Detail why: [docs/aws-hosting/04-soft-path.md](../aws-hosting/04-soft-path.md).

## Prerequisites (Soft-safe)

- [ ] SSO into Oral21 `021067821343` / us-east-1 (HalenorEmailDeploy or Soft hosting role)
- [ ] Terraform ≥ 1.5 + AWS provider ~5.x on your machine or CloudShell
- [ ] Docker (SSR Soft) for image build
- [ ] Confirmed [00-HARD-HOLDS.md](./00-HARD-HOLDS.md)

## LockHabit SSR Soft (recommended Soft first host)

```bash
cd infra/aws-soft-preview
cp terraform.tfvars.example terraform.tfvars
# set: app = "lockhabit", env = "preview"  (defaults already Soft-safe)
# do NOT put secrets in terraform.tfvars

terraform init

# Phase A — Soft registry only (App Runner needs an image before healthy Soft URL)
terraform apply \
  -target=aws_ecr_repository.soft \
  -target=aws_ecr_lifecycle_policy.soft

# Build + push Soft image (repo-root Dockerfile) — TEST Vite build-args only
# then Phase B:
terraform plan   # confirm: no Route53, no lockhabit.com, tags app/env present
terraform apply
```

Record Soft outputs:

- `apprunner_soft_url`
- `cloudfront_soft_url` (if enabled)
- `name_prefix` / `resource_tags`

Then Soft-set TEST Stripe / Supabase / Resend in App Runner console (or CI secrets).
Never commit them.

Optional Soft image push via GitHub: `.github/workflows/aws-soft-preview.yml`
(`workflow_dispatch` only — needs Oral-configured OIDC/role secrets).

## Static Soft (Site N marketing)

```bash
cd infra/aws-soft-static-preview
cp terraform.tfvars.example terraform.tfvars
# set app = "<site-slug>", env = "preview"
terraform init
terraform plan    # Soft CF + S3 OAC only
terraform apply
# aws s3 sync ./dist s3://$(terraform output -raw bucket_name)/
```

## Soft smoke (SSR)

- [ ] Soft home / product / bag load on Soft URL
- [ ] Stripe **TEST** checkout + webhook on Soft URL
- [ ] Resend TEST receipt (if Soft-configured)
- [ ] Railway production still healthy on `lockhabit.com`
- [ ] MX unchanged (LockHabit feedback MX; Halenor Zoho apex)

## Blocked here

| Item | Why |
| --- | --- |
| Live Soft URL from this Cloud Agent | No AWS credentials in agent environment |
| Custom domain | Soft HOLD / OWNER Route 53 later |
| Railway teardown | Soft HOLD |

## After Soft green

Stop. Dual-run is expected. Cutover is a **separate Oral GO** runbook, not this pack.
