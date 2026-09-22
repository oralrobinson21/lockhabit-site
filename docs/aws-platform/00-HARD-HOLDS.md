# HARD HOLDs — Soft constraints

**Status: HOLD until Oral explicit GO.** Soft-safe docs + IaC only.

## Never do (until GO)

| # | HOLD | Why |
| --- | --- | --- |
| 1 | **Zoho apex MX on `halenor.com`** | Live Halenor mail. Inbound Soft email stays on `email-test.halenor.com` only. |
| 2 | **Live DNS cutover** | No Porkbun / Route 53 swaps for `lockhabit.com`, `www`, Halenor apex/www, or new production aliases to CloudFront / App Runner / S3. |
| 3 | **Railway delete / pause** | LockHabit (and Halenor Railway apps) stay production. Soft AWS is dual-run only. |
| 4 | **Root access keys** | Use Identity Center SSO / least-privilege roles. Never create or share root keys. |
| 5 | **Secrets in git or chat** | No Stripe / Supabase / Resend / Twilio / AWS keys in commits, PRs, or agent chat. Use App Runner env / Secrets Manager / GitHub Actions secrets. |

## Also Soft-blocked until separate GO

- Attach custom domains / ACM validation for production hostnames
- Point live Stripe webhooks away from Railway
- Create `support@lockhabit.com` inbound SES receive (today MX is SES **feedback**, not inbound)
- Pause Railway after Soft green (savings trigger — see [08-cost-note.md](./08-cost-note.md))

## Allowed Soft work now

- Read this pack and apply Soft preview Terraform after SSO
- Push Soft images to ECR; open Soft URLs only
- Copy **TEST** secrets into Soft App Runner (out-of-band)
- Document OWNER_ONLY asks for Oral morning list

## Exit criteria for a future GO (out of scope)

1. Soft preview green (SSR + checkout TEST + webhook on Soft URL)
2. Dual-run with custom domain **without** removing Railway
3. Explicit Oral DNS GO + rollback plan
4. Only then reduce Railway website hosting spend
