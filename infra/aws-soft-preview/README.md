# Soft-safe LockHabit / Site N AWS SSR preview (App Runner)

> **SOFT HOLD:** Never create Route 53 records or attach custom domains
> (`lockhabit.com`, `halenor.com`, …). Soft URLs only until Oral GO.
>
> Platform checklist: [`docs/aws-platform/`](../../docs/aws-platform/README.md)

## Naming + tags

| Input | Soft default | Effect |
| --- | --- | --- |
| `app` | `lockhabit` | Tag `app` + name segment |
| `env` | `preview` | Tag `env` (must stay Soft preview here) |
| `name_prefix` | `{app}-{env}-web` | ECR + App Runner + IAM names |

Default tags: `app`, `env`, `SoftSafe`, `SoftHoldDns`, `ManagedBy=terraform`, `Purpose=ssr-preview`.

To Soft-add Site N SSR: copy this folder (or new tfvars/workspace) and set
`app = "<slug>"`. See [add a new site in 5 steps](../../docs/aws-platform/05-add-a-new-site.md).

## Creates

- Private ECR repo
- IAM role for App Runner → ECR
- App Runner Soft service (port 3000)
- Optional CloudFront Soft distribution (`*.cloudfront.net`)
- Soft URL + tag outputs only

## Does not create

- Route 53 / ACM custom domains
- Railway teardown
- SES / MX changes

## Usage (two Soft phases)

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init

# Phase A — Soft registry
terraform apply -target=aws_ecr_repository.soft -target=aws_ecr_lifecycle_policy.soft

# Build/push Soft image (root Dockerfile), then Phase B:
terraform plan    # confirm: no Route53 / no custom domains; tags app+env present
terraform apply
```

Set Stripe TEST / Supabase / Resend secrets in App Runner console or CI after
apply. Never commit secrets to `terraform.tfvars`.

**Do not apply from Cloud Agents unless AWS credentials are already present.**
Oral / Grok Soft-apply after SSO.
