# AWS platform foundation (Oral checklist)

> **HARD HOLD** — Do **not** touch Zoho apex MX on `halenor.com`, do **not** live-cutover
> DNS for Halenor or LockHabit, do **not** delete/pause Railway production, do **not**
> create root access keys, and do **not** put secrets in git or chat.
>
> Soft-safe work only until Oral explicit **GO**. Apply Terraform only after SSO
> credentials are ready (this PR does **not** apply against real AWS).

**Account:** Oral21 `021067821343` · **Region:** `us-east-1` only  
**Goal:** One AWS footprint for Halenor (SES-first email) + LockHabit hosting + later
websites + phone/SMS — without a big rebuild.

## Start here (read in order)

| # | Doc | What you do |
| --- | --- | --- |
| 0 | [00-HARD-HOLDS.md](./00-HARD-HOLDS.md) | Confirm Soft HOLDs before any AWS click |
| 1 | [01-what-exists.md](./01-what-exists.md) | Inventory: SES email-test, Identity Center, Railway |
| 2 | [02-target-shape.md](./02-target-shape.md) | Target shape: one account, tags, Site N + Phone |
| 3 | [03-naming-and-tags.md](./03-naming-and-tags.md) | Naming + tags (`app`, `env`) — copy for every site |
| 4 | [04-preview-host.md](./04-preview-host.md) | Soft preview host (no custom domain) apply steps |
| 5 | [05-add-a-new-site.md](./05-add-a-new-site.md) | **Add a new site in 5 steps** (little AI later) |
| 6 | [06-phone-later.md](./06-phone-later.md) | Phone/SMS later without redesign |
| 7 | [07-owner-only.md](./07-owner-only.md) | OWNER_ONLY steps (SSO admin, R53, SES prod) |
| 8 | [08-cost-note.md](./08-cost-note.md) | Cost vs Railway dual-run |

## Soft IaC in this repo

| Path | Role |
| --- | --- |
| [`infra/aws-soft-preview/`](../../infra/aws-soft-preview/) | **SSR preview** — ECR + App Runner + optional CloudFront Soft URL |
| [`infra/aws-soft-static-preview/`](../../infra/aws-soft-static-preview/) | **Static preview** — S3 + CloudFront Soft URL (marketing shells) |
| [`docs/aws-hosting/`](../aws-hosting/README.md) | LockHabit-specific hosting inventory (SSR reasons, Stripe, etc.) |

Both Soft stacks emit **AWS-managed Soft URLs only** (`*.awsapprunner.com` /
`*.cloudfront.net`). No Route 53, no custom domains, no Railway teardown.

## Soft vs OWNER_ONLY (one-line)

| Soft-safe (you / Soft SSO) | OWNER_ONLY (AdministratorAccess / Support) |
| --- | --- |
| Review + apply Soft preview Terraform when creds exist | Assign SSO admin / expand HalenorEmailDeploy |
| Push Soft Docker image to ECR | Create Route 53 hosted zones / live DNS |
| Smoke Soft URLs with TEST secrets | SES production access re-request |
| Keep Railway + Zoho MX untouched | Any live cutover GO |

## Acceptance for this PR

- [x] Platform docs pack Oral can follow like a checklist
- [x] Soft preview IaC extended with naming + `app` / `env` tags
- [x] Static Soft preview pattern for Site N (static)
- [x] “Add a new site in 5 steps” runbook
- [x] OWNER_ONLY list + cost note vs Railway dual-run
- [ ] Live Soft preview URL — **blocked** until Oral SSO apply (no AWS creds in agent)
- [ ] DNS / MX / Railway cutover — **HOLD**
