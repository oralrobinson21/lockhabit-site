# Soft HOLD — DNS / MX / Railway

**Status: HOLD until Oral explicit GO.**

## Forbidden until GO

1. **DNS cutover** — Do not change Porkbun records for:
   - `lockhabit.com` apex `A`
   - `www.lockhabit.com` `CNAME` → Railway
   - any new `ALIAS` / `CNAME` / `A` / `AAAA` aimed at CloudFront, App Runner, or S3
2. **Email / MX** — Do not change:
   - `lockhabit.com` MX (currently SES feedback endpoint)
   - DMARC / SPF / DKIM
   - Zoho or any mailbox provider settings
3. **Railway production** — Do not pause, delete, rename, or retarget the live
   `lockhabit` production service that serves `https://lockhabit.com`.
4. **Stripe webhook cutover** — Do not point live Stripe webhooks away from the
   Railway production URL until Soft preview is verified and Oral GO is given.

## Allowed Soft work (this PR)

- Documentation and gap analysis
- Soft-safe Terraform that emits only AWS-managed Soft URLs
  (`*.awsapprunner.com` / `*.cloudfront.net`)
- Dockerfile for SSR container builds
- Manual / `workflow_dispatch` deploy wiring that never touches DNS

## Exit criteria for a future GO cutover (out of scope here)

Oral must explicitly approve a separate cutover runbook that:

1. Verifies Soft preview checkout + Stripe webhook + Resend on the Soft URL
2. Adds custom domain + ACM **without removing Railway until dual-run is green**
3. Swaps DNS with a rollback plan
4. Only then reduces / removes Railway spend
