# Existing AWS Soft assets

## LockHabit (`lockhabit-site`)

| Asset | Found? | Notes |
| --- | --- | --- |
| Soft-merged S3 + CloudFront docs/IaC in this repo | **No** | First Soft hosting package is this PR |
| Soft AWS preview URL for LockHabit | **No** | No `*.cloudfront.net` / App Runner Soft URL in repo or live DNS |
| AWS credentials in this Cloud Agent environment | **No** | `aws` CLI absent; no `~/.aws` |
| Soft Terraform / CDK already applied | **No** | |

Accessible Oral GitHub repos from this agent: `lockhabit-site`, `booker-site`,
`lockhabit-blog`. None contained AWS hosting IaC.

## Halenor Soft-merged website hosting

Task allowed reuse of Soft-merged Halenor AWS website hosting if shared.

| Check | Result |
| --- | --- |
| Halenor repo under Oral GitHub | **Not visible** to this agent |
| Soft-merged Halenor S3/CloudFront docs in mailbox search | **No match** in recent Oral Outlook search |
| Reusable shared module path | **Unavailable** — proceed with LockHabit-local Soft IaC |

If Oral later points at a Halenor Soft hosting PR/module, treat this package as
the LockHabit adapter and Soft-import patterns rather than rewriting history.

## AWS signals already on the domain (not website hosting)

- MX → `sendfeedback-smtp.us-east-1.amazonses.com` (SES feedback). This is
  **email**, not site hosting. Soft HOLD: leave alone.
- No CloudFront / ACM / Route 53 Soft website stack observed on `lockhabit.com`.

## Conclusion

LockHabit AWS website hosting does **not** Soft-exist yet. This PR is the Soft
bootstrap (docs + Soft preview IaC), not a follow-up on an existing Soft stack.
