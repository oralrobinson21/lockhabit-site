# Cost note — Soft AWS vs Railway dual-run

## Today (Railway stays)

LockHabit production is a **continuous Node SSR** service on Railway (build +
runtime + custom-domain TLS + health checks). That bill continues until Oral
explicit GO after Soft dual-run is green.

Halenor Soft email-test and Soft alarms add a **small** AWS baseline (Lambda, S3,
SNS, CloudWatch) already live — separate from website Soft preview.

## Soft dual-run (expected temporary)

| Spend | Soft dual-run meaning |
| --- | --- |
| Railway LockHabit | **Keep** — production traffic |
| AWS Soft preview (ECR + App Runner ± CloudFront) | **Extra** Soft cost while validating |
| AWS SES email-test | Already live Soft baseline |
| Supabase / Stripe / Resend / Porkbun | Unchanged |

Soft preview is **not** a savings step by itself. It is parallel spend by design
([00-HARD-HOLDS.md](./00-HARD-HOLDS.md)).

## Soft AWS preview — directional cost shape

| Soft resource | Soft role | Rough order* |
| --- | --- | --- |
| ECR | Soft images | Cents–low $/mo |
| App Runner Soft | SSR Soft compute | Scales with requests/CPU; often competitive at low traffic |
| CloudFront Soft | Soft URL / edge | Low until traffic |
| S3 Soft (static sites) | Soft objects | Cents–low $/mo |
| Logs / transfer | Variable | Watch in Cost Explorer |

\*Pricing changes — confirm in Cost Explorer after Soft apply. Filter by tags
`app` + `env=preview` ([03-naming-and-tags.md](./03-naming-and-tags.md)).

## What Soft AWS does **not** replace

Supabase, Stripe fees, Resend, domain registration, Lovable/Cursor, Twilio Soft
(when Soft-added).

## Savings trigger (future Oral GO only)

Railway website hosting for LockHabit can shrink when **all** are true:

1. Soft (then custom-domain) AWS SSR serves production traffic
2. Stripe live webhook + Resend paths verified on AWS
3. Oral lifts Soft HOLD and approves Railway teardown / pause

Until then: **dual-run is correct**, not a failure.

## Oral Cost Explorer recipe

1. Cost Explorer → filter tag `env = preview` → Soft dual-run AWS slice
2. Filter tag `app = lockhabit` vs `app = halenor` → product split
3. Compare Soft preview month to Railway LockHabit invoice before any teardown GO
