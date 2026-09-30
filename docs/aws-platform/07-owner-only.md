# OWNER_ONLY checklist

Steps that Soft SSO (**HalenorEmailDeploy** and similar) may fail without
**AdministratorAccess** / AWS Support. Soft agents document and stop here —
Oral completes these in the console / SSO admin portal.

**Never create root access keys to bypass permission walls.**

## How to use

1. Complete Soft-safe work first ([04-preview-host.md](./04-preview-host.md)).
2. When an apply / API returns `AccessDenied` or needs Support, use this list.
3. Leave Soft preview on Soft URLs until the matching OWNER item is done **and** Oral GO.

---

## OWNER_ONLY — Oral admin / Support

| # | Item | Why Soft-blocked | Soft workaround until done |
| --- | --- | --- | --- |
| 1 | **SSO admin assign** — attach Soft hosting permissions (and optionally `AWSCloudShellFullAccess` + `secretsmanager:GetSecretValue` on the two email HMAC secret ARNs) to `HalenorEmailDeploy` **or** create a dedicated Soft hosting permission set | Soft role may lack admin / Support | Soft email used env HMAC overnight; defer Soft hosting apply until role is ready |
| 2 | **Route 53 hosted zone (later)** for production hostnames | Soft HOLD on live DNS + often admin | Soft URLs only (`*.awsapprunner.com` / `*.cloudfront.net`) |
| 3 | **SES production access re-request** (already **DENIED** once — Support case `178998112300044`) | Support case; sandbox limits real recipients | SES simulator + verify individual identities (click SES verify for `oralrobinson21@outlook.com` if still PENDING) |
| 4 | **GitHub OIDC IAM role** for Soft ECR push (if creating a new trust policy needs IAM admin) | IAM `CreateRole` | Manual CloudShell / local docker push after SSO |
| 5 | **ACM + custom domain attach** (Oral DNS GO only) | Soft HOLD + DNS validation | Never in this PR |

## Soft-safe Oral morning items (not always admin, but OWNER action)

| # | Item | Notes |
| --- | --- | --- |
| A | Click SES identity verification email if still PENDING | Unblocks sandbox send to that address |
| B | Confirm Zoho apex MX on `halenor.com` unchanged | HARD HOLD |
| C | Keep Railway LockHabit production healthy during Soft dual-run | HARD HOLD |
| D | Do **not** Soft-create `support@lockhabit.com` inbound receive yet | `lockhabit.com` MX is SES feedback, not inbound |

## Escalation one-liner for Oral

> Soft SSO cannot complete \<item #\>. Needs AdministratorAccess / Support.
> Soft preview stays on Soft URLs; no DNS / MX / Railway changes.

Identity Center store (for admin console navigation): **`d-90667ea72c`**.
