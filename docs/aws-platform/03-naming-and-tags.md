# Naming and tags

Use the same convention for Soft preview **and** future prod so Cost Explorer and
SSO audits stay readable.

## Required tags (every Soft / prod resource)

| Tag | Values | Purpose |
| --- | --- | --- |
| `app` | `lockhabit` \| `halenor` \| `<site-slug>` | Product boundary |
| `env` | `preview` \| `prod` \| `test` | Environment (Soft preview = `preview`) |
| `ManagedBy` | `terraform` \| `cdk` \| `manual` | Provenance |
| `SoftSafe` | `true` while Soft HOLD applies | Soft marker |
| `SoftHoldDns` | `true` until Oral DNS GO | Blocks accidental DNS work |

Optional but recommended:

| Tag | Example | Purpose |
| --- | --- | --- |
| `Purpose` | `ssr-preview` / `static-preview` / `email-test` | Human skim |
| `Owner` | `oral` | Contact |

## Resource naming

```
{app}-{env}-{kind}
```

Examples:

| Kind | Soft preview name |
| --- | --- |
| ECR / App Runner SSR | `lockhabit-preview-web` |
| Static bucket / CF comment | `halenor-preview-static` |
| IAM role | `lockhabit-preview-web-apprunner-ecr` |
| Email Soft (existing) | Keep Halenor names (`halenor-email-*-test`) — do not rename live |

**Rules**

- Lowercase, hyphens only, ≤ 32 chars preferred (App Runner service name limits).
- Soft stacks use `env=preview` in tags and `-preview-` in names.
- Never put secrets or account numbers in names.
- Soft HOLD: names must **not** imply ownership of `lockhabit.com` / `halenor.com`
  custom domains.

## Terraform wiring (this repo)

SSR Soft stack variables:

```hcl
app  = "lockhabit"
env  = "preview"
# derived name_prefix = "{app}-{env}-web" unless overridden
```

Static Soft stack:

```hcl
app = "halenor"   # or booker, etc.
env = "preview"
# derived name_prefix = "{app}-{env}-static"
```

Default tags are applied by the AWS provider `default_tags` block plus per-resource
Soft tags. Do not Soft-apply without `app` + `env` set.

## Cost Explorer filter recipe

1. Tag filter `app = lockhabit` (or `halenor`)
2. Tag filter `env = preview` for Soft dual-run spend
3. Compare monthly Soft preview vs Railway invoice (see [08-cost-note.md](./08-cost-note.md))
