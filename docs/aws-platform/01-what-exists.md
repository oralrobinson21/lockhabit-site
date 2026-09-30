# What already exists

Snapshot **2026-09-22**. AWS CLI was **not** available in the Cloud Agent that wrote
this pack; facts below come from Oral overnight status mail, CloudWatch/SNS alarms,
live LockHabit DNS/HTTP, and Soft IaC already in this repo. Re-verify in console
when Soft-applying.

## Account footprint

| Item | Value |
| --- | --- |
| Account | Oral21 **`021067821343`** |
| Region | **`us-east-1` only** (do not multi-region Soft stacks) |
| Identity Center | Identity store **`d-90667ea72c`** |
| Soft deploy role (email) | SSO permission set / role **`HalenorEmailDeploy`** (may lack admin / Support) |

## Halenor — SES email-test (LIVE Soft)

| Piece | Status |
| --- | --- |
| SES email-test stack | **Live** in us-east-1 |
| Inbound MX | **`email-test.halenor.com` only** |
| Apex MX `halenor.com` | **Zoho — DO NOT TOUCH** |
| DKIM | SUCCESS for `email-test.halenor.com` and `halenor.com` (identity); apex MX still Zoho |
| Outbound smoke | Amazon SES simulator OK (sandbox) |
| Inbound smoke | Outlook → `inbound-smoke@email-test.halenor.com` → S3 → Lambda → Halenor app → DB |
| Named resources (alarms) | Lambda `halenor-email-events-test`; DLQ `halenor-email-inbound-dlq-test`; SNS `halenor-email-alarms-test` |
| IaC home (canonical) | Private repo `halenor` → `infra/aws-email` (not accessible from this agent; treat as source of truth for email) |
| SES production | **DENIED** once (Support case `178998112300044`) — remains sandbox until OWNER_ONLY re-request |

## Identity Center / SSO

| Piece | Status |
| --- | --- |
| Identity Center | In use (password reset events seen) |
| HalenorEmailDeploy | Exists; Soft email work used Soft-safe env HMAC when Secrets Manager GetSecretValue was missing |
| Optional Soft attach (OWNER morning list) | `AWSCloudShellFullAccess` + `secretsmanager:GetSecretValue` on HMAC ARNs |
| AdministratorAccess / Support | May be missing on Soft SSO — see [07-owner-only.md](./07-owner-only.md) |

## LockHabit — Railway production (LIVE)

| Piece | Status |
| --- | --- |
| Site | `https://lockhabit.com` / `www` → Railway (`server: railway-hikari`) |
| DNS | Porkbun; www CNAME → `*.up.railway.app` |
| MX | `sendfeedback-smtp.us-east-1.amazonses.com` (SES **feedback** — not inbound receive) |
| App | TanStack Start SSR + Stripe + Supabase + Resend (needs Node — not pure S3) |
| Soft AWS hosting | Soft IaC in this repo ([`infra/aws-soft-preview`](../../infra/aws-soft-preview/)); **not applied** yet |
| Soft preview URL | **None** until Oral `terraform apply` |

Detail: [docs/aws-hosting/01-inventory.md](../aws-hosting/01-inventory.md).

## Halenor Soft website hosting (merged Soft IaC, not deployed)

From Oral mailbox / PR titles (private `halenor` repo not cloneable here):

| Piece | Status |
| --- | --- |
| PR **#632** | Soft-safe CloudFront + S3 OAC + App Runner website path — **merged, nothing deployed** |
| PR **#653** | Independent #632 CI-green handoff — Soft code on main, still undeployed |
| Soft rule | CloudFront Soft preview only; no live custom domain |

**Reuse rule:** Prefer patterns from Halenor #632 when that repo is available. This
repo’s Soft Terraform is the **LockHabit / shared Soft adapter** so Oral can Soft-host
now without waiting on Halenor ACL. Do not duplicate a second Soft design.

## Phone / SMS Soft (Halenor — Soft docs only)

| Piece | Status |
| --- | --- |
| Twilio Soft infra | Soft PRs (#630 / #650 era) — TEST Soft, LIVE cutover gated |
| AWS SNS / Pinpoint | **Not required** now — optional later (see [06-phone-later.md](./06-phone-later.md)) |

## Soft AWS in *this* repo (PR contents)

| Asset | Status |
| --- | --- |
| `docs/aws-platform/` | This pack |
| `docs/aws-hosting/` | LockHabit Soft hosting detail |
| `infra/aws-soft-preview/` | SSR Soft preview Terraform |
| `infra/aws-soft-static-preview/` | Static Soft preview Terraform |
| `Dockerfile` + Soft GHA workflow | Manual Soft image push |

## Bottom line

Oral already has **one account** with **live SES email-test** and **Identity Center**.
Website Soft hosting and phone Soft are **docs/IaC Soft**, not live cutover.
LockHabit remains on **Railway** until Soft dual-run + Oral GO.
