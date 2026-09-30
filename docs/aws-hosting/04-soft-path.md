# Soft path — AWS Soft SSR preview (not DNS)

## Decision

| Option | Soft fit for LockHabit | Verdict |
| --- | --- | --- |
| S3 + CloudFront static only | Serves HTML/JS/CSS only; **breaks** Checkout / webhook / SSR | Soft marketing shell only — **not** Railway replacement |
| CloudFront Soft URL → Railway origin | Soft CDN test; **does not** save Railway $ | Skip for cost goal |
| **App Runner Soft SSR + optional CloudFront Soft URL** | Runs existing Nitro `node-server` output | **Chosen Soft next step** |
| Amplify Hosting SSR | Also viable Soft preview | Deferred; App Runner matches current Docker/Node path cleanly |

S3 + CloudFront remains a **later Soft CDN** for static assets once SSR is Soft-hosted.
It is **not** the Soft replacement for Railway compute.

## Soft architecture

```
[ Soft preview clients ]
          |
          v
 optional CloudFront Soft (*.cloudfront.net)   <-- no custom domain
          |
          v
 App Runner Soft service (*.awsapprunner.com)
          |
          v
 ECR image: Nitro node-server (.output/server)
          |
    +-----+-----+
    |           |
 Supabase    Stripe TEST / Resend (Soft secrets)
```

**Hard Soft rule:** Terraform in this repo must not create Route 53 records or
attach `lockhabit.com` / `www.lockhabit.com` to any distribution or service.

## Repo pieces

| Path | Role |
| --- | --- |
| [`Dockerfile`](../../Dockerfile) | Multi-stage build → Node serves `.output/server/index.mjs` |
| [`infra/aws-soft-preview/`](../../infra/aws-soft-preview/) | Soft Terraform (ECR, App Runner, optional CF) |
| [`.github/workflows/aws-soft-preview.yml`](../../.github/workflows/aws-soft-preview.yml) | Manual Soft deploy only |

## How Oral applies Soft preview (when AWS creds ready)

```bash
cd infra/aws-soft-preview
cp terraform.tfvars.example terraform.tfvars   # edit project_name / region only
terraform init

# Phase A — Soft registry only (App Runner needs an image before healthy Soft URL)
terraform apply -target=aws_ecr_repository.soft -target=aws_ecr_lifecycle_policy.soft

# Build/push Soft image (Dockerfile at repo root), then Phase B:
terraform plan                                 # review: no Route53, no lockhabit.com
terraform apply                                # Soft URLs only
```

Then build/push image (or run the Soft workflow):

```bash
# example — replace ACCOUNT/REGION/REPO from terraform output
docker build \
  --build-arg VITE_SUPABASE_PROJECT_ID=... \
  --build-arg VITE_SUPABASE_URL=... \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... \
  --build-arg VITE_STRIPE_MODE=test \
  --build-arg VITE_PAYMENTS_CLIENT_TOKEN=... \
  -t lockhabit-soft:local .
docker tag lockhabit-soft:local "$ECR_REPO:soft"
aws ecr get-login-password | docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker push "$ECR_REPO:soft"
```

Open Soft URL from Terraform outputs. Keep Railway production untouched.

## Soft acceptance for this step

- [x] Docs inventory + gaps + Soft HOLD + cost note
- [x] Soft IaC with zero DNS resources
- [ ] Live Soft preview URL (blocked on AWS credentials — Oral)
- [ ] Soft TEST checkout smoke (after Soft URL exists)
