# Gap list — Soft preview → future GO

## Soft preview gaps (next Soft steps after this PR)

| # | Gap | Owner | Soft-safe? |
| --- | --- | --- | --- |
| 1 | AWS account + IAM role / OIDC for GitHub Actions Soft deploy | Oral | Yes |
| 2 | `terraform apply` of `infra/aws-soft-preview` | Oral / Cursor with creds | Yes |
| 3 | Push Soft Docker image to ECR + deploy App Runner Soft URL | Oral / Cursor with creds | Yes |
| 4 | Copy **TEST** Stripe / Supabase / Resend secrets into Soft App Runner | Oral | Yes (test only) |
| 5 | Stripe **TEST** webhook endpoint pointed at Soft URL `/api/stripe/webhook` | Oral | Yes (test endpoint only) |
| 6 | Smoke Soft preview: home, product, bag, checkout TEST, webhook, receipt | Cursor | Yes |
| 7 | Optional CloudFront Soft URL in front of App Runner | Oral GO for apply | Yes |

## Production cutover gaps (blocked — Soft HOLD)

| # | Gap | Blocked by |
| --- | --- | --- |
| A | ACM cert for `lockhabit.com` + `www` | Oral DNS GO (validation) |
| B | CloudFront / App Runner custom domain aliases | Oral DNS GO |
| C | Porkbun record swap with dual-run + rollback | Oral DNS GO |
| D | Live Stripe webhook swap to AWS | Soft preview green + Oral GO |
| E | Pause/remove Railway production | Soft HOLD + Oral GO |
| F | Confirm MX / SES / Resend unchanged after cutover | Soft HOLD |

## Architecture gaps (product)

| # | Gap | Why it matters |
| --- | --- | --- |
| G1 | Pure S3 + CloudFront static export | **Cannot** run TanStack Start server fns / webhook — Soft marketing-only only |
| G2 | Build-time `VITE_*` Stripe keys | Soft preview image must rebuild when TEST/LIVE mode changes |
| G3 | Large media assets | Soft container/ECR size; later Soft CDN via S3+CF optional |
| G4 | Lovable Cloudflare nitro preset vs Railway/AWS node-server | Keep Soft AWS on `node-server`; do not fight Lovable preset |

## Explicit non-goals of this PR

- No live Soft preview URL (no AWS creds in agent)
- No DNS / MX / Railway deletion
- No Halenor module import (repo not accessible)
- No production cost cut yet — Soft dual-run comes first
