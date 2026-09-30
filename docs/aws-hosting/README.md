# LockHabit AWS hosting (Soft-safe)

> **SOFT HOLD — DNS CUTOVER**
> Do **not** change Porkbun DNS for `lockhabit.com` / `www`, do **not** touch MX/SES,
> and do **not** delete or pause the Railway production service until Oral gives an
> explicit **GO**. This package is docs + Soft preview IaC only.

**Platform umbrella (Halenor + LockHabit + Site N + phone later):**  
start at [`docs/aws-platform/`](../aws-platform/README.md).

## Why this folder still exists

LockHabit-specific hosting inventory (SSR vs static, Stripe, Railway DNS facts).
The multi-app Soft foundation, OWNER_ONLY list, and “add Site N in 5 steps”
live under **aws-platform**.

## Read order (LockHabit Soft detail)

| Doc | Purpose |
| --- | --- |
| [00-SOFT-HOLD.md](./00-SOFT-HOLD.md) | Hard Soft constraints (DNS / MX / Railway) |
| [01-inventory.md](./01-inventory.md) | Current Railway + app surface |
| [02-aws-assets.md](./02-aws-assets.md) | What AWS Soft assets already exist |
| [03-gap-list.md](./03-gap-list.md) | Gaps before a future GO cutover |
| [04-soft-path.md](./04-soft-path.md) | Chosen Soft architecture + how to apply |
| [05-cost-note.md](./05-cost-note.md) | What Railway usage this eventually replaces |

## Soft preview IaC

| Stack | Path |
| --- | --- |
| SSR Soft (LockHabit) | [`infra/aws-soft-preview/`](../../infra/aws-soft-preview/) |
| Static Soft (Site N) | [`infra/aws-soft-static-preview/`](../../infra/aws-soft-static-preview/) |

- Creates Soft URL hosts only (App Runner / CloudFront Soft).
- **No** Route 53 records, **no** ACM custom-domain certs, **no** alias to `lockhabit.com`.
- Tags: `app=lockhabit`, `env=preview` (see platform naming doc).
- Apply is manual / `workflow_dispatch` only after AWS credentials exist.

## Status (2026-09-22)

| Item | Status |
| --- | --- |
| Platform docs pack | [`docs/aws-platform/`](../aws-platform/README.md) |
| LockHabit AWS Soft hosting already live? | **No** |
| Soft-safe PR contents | Docs + Dockerfile + Terraform Soft preview (+ static Soft) |
| Live Soft preview URL | **Blocked** until Oral Soft-applies after SSO |
| DNS / Railway cutover | **HOLD** until Oral GO |
