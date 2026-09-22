# Target shape — one AWS footprint

Design so Oral can Soft-host LockHabit **now** and Soft-add websites + phone later
**without redesign**.

## Principles

1. **One account, one region** — Oral21 `021067821343`, `us-east-1` only.
2. **Tag everything** — `app`, `env`, `ManagedBy`, Soft HOLD tags (see [03-naming-and-tags.md](./03-naming-and-tags.md)).
3. **Soft URLs first** — Every new site Soft-starts on `*.awsapprunner.com` or
   `*.cloudfront.net`. Custom domain is a later OWNER / GO step.
4. **Compute matches the app** — SSR → App Runner; static marketing → S3 + CloudFront.
5. **Email stays SES-first** — Halenor `infra/aws-email` owns mail; Soft website stacks
   never touch MX.
6. **Phone is additive** — Twilio Soft is fine; AWS SNS/Pinpoint is optional later,
   same tags / account / Soft HOLD pattern.

## Logical layout (not multi-account)

```
Oral21 (021067821343) / us-east-1
├── Identity Center (SSO) …………………… Soft + OWNER roles
├── Email (Halenor SES-first)
│   └── email-test Soft (LIVE) · apex Zoho HOLD
├── Sites
│   ├── lockhabit  env=preview  → App Runner Soft (+ optional CF Soft)
│   ├── lockhabit  env=prod     → (future GO — custom domain)
│   ├── halenor    env=preview  → CF Soft / App Runner Soft (from Soft IaC)
│   └── site-N     env=preview  → copy Soft module, change `app` tag
└── Phone (later)
    ├── Twilio Soft (preferred near-term)
    └── optional SNS / Pinpoint Soft (same tags)
```

Environments are **tags + name prefixes**, not separate AWS accounts. That keeps
SSO and cost simple for Oral.

## Pattern: Site N without redesign

| Site type | Soft stack to copy | Soft URL | Later GO |
| --- | --- | --- | --- |
| SSR (TanStack / Nitro / Node) | `infra/aws-soft-preview` | App Runner (+ optional CF Soft) | ACM + DNS alias |
| Static (HTML/marketing) | `infra/aws-soft-static-preview` | CloudFront Soft → S3 OAC | ACM + DNS alias |
| Already Soft-merged Halenor web | Prefer Halenor #632 Soft module when ACL allows | Soft CF only until GO | Same HOLD |

Runbook: [05-add-a-new-site.md](./05-add-a-new-site.md).

## Pattern: Phone later without redesign

- Keep Twilio Soft as the voice/SMS product path (already Soft-documented in Halenor).
- Soft-add AWS SNS (alerts / transactional SMS) or Pinpoint only if product needs it.
- Tag `app=halenor` (or product) + `env=preview|prod`; never Soft-bind production
  numbers until Soft cert / LIVE gate.
- Detail: [06-phone-later.md](./06-phone-later.md).

## What we deliberately do **not** build now

| Avoid | Why |
| --- | --- |
| New AWS Organizations / multi-account maze | Overkill for Oral solo Soft ops |
| Soft DNS / Route 53 hosted zones for prod hostnames | HOLD until GO |
| Replacing Railway this PR | Dual-run first |
| Rewriting Halenor SES CDK here | Email lives in `halenor` `infra/aws-email` |
| Forcing all sites onto App Runner or all onto S3 | Wrong fit breaks Stripe / SSR |

## Soft success definition

Oral can Soft-apply LockHabit preview, Soft-smoke TEST checkout, Soft-add Site N in
five checklist steps, and Soft-add phone later — all without touching Zoho MX,
live DNS, or Railway.
