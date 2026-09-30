# LockHabit AWS hosting (Soft-safe)

> **SOFT HOLD — DNS CUTOVER**
> Do **not** change Porkbun DNS for `lockhabit.com` / `www`, do **not** touch MX/SES,
> and do **not** delete or pause the Railway production service until Oral gives an
> explicit **GO**. This package is docs + Soft preview IaC only.

## Why this exists

Oral wants to reduce Railway spend by moving LockHabit website hosting to AWS.
This folder is the Soft-safe next step: inventory, gap list, cost note, and
reviewable Terraform for a **Soft preview** that does not own the live domain.

## Read order

| Doc | Purpose |
| --- | --- |
| [00-SOFT-HOLD.md](./00-SOFT-HOLD.md) | Hard Soft constraints (DNS / MX / Railway) |
| [01-inventory.md](./01-inventory.md) | Current Railway + app surface |
| [02-aws-assets.md](./02-aws-assets.md) | What AWS Soft assets already exist |
| [03-gap-list.md](./03-gap-list.md) | Gaps before a future GO cutover |
| [04-soft-path.md](./04-soft-path.md) | Chosen Soft architecture + how to apply |
| [05-cost-note.md](./05-cost-note.md) | What Railway usage this eventually replaces |

## Soft preview IaC

Terraform lives in [`infra/aws-soft-preview/`](../../infra/aws-soft-preview/).

- Creates ECR + App Runner Soft SSR preview (+ optional CloudFront Soft URL).
- **No** Route 53 records, **no** ACM custom-domain certs, **no** alias to `lockhabit.com`.
- Apply is manual / `workflow_dispatch` only after AWS credentials exist.

## Status (2026-09-22)

| Item | Status |
| --- | --- |
| LockHabit AWS Soft hosting already live? | **No** (none found in this repo / accessible Oral GitHub) |
| Halenor Soft-merged website hosting reusable here? | **Not accessible** from this agent |
| Soft-safe PR contents | Docs + Dockerfile + Terraform Soft preview |
| Live Soft preview URL | **Blocked** until Oral supplies AWS account credentials / apply GO |
| DNS / Railway cutover | **HOLD** until Oral GO |
