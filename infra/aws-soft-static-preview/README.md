# Soft-safe static site preview (S3 + CloudFront OAC)

> **SOFT HOLD:** Never create Route 53 records or attach custom domains.
> Soft `*.cloudfront.net` only until Oral GO.
>
> Platform checklist: [`docs/aws-platform/`](../../docs/aws-platform/README.md)
>
> **Not for LockHabit SSR** — LockHabit needs App Runner
> ([`../aws-soft-preview`](../aws-soft-preview/)). Use this Soft stack for
> marketing / static Site N shells.

## Naming + tags

| Input | Soft default | Effect |
| --- | --- | --- |
| `app` | `halenor` | Tag `app` + name segment |
| `env` | `preview` | Tag `env` |
| `name_prefix` | `{app}-{env}-static` | Bucket comment / OAC / CF comment |

Default tags: `app`, `env`, `SoftSafe`, `SoftHoldDns`, `ManagedBy=terraform`, `Purpose=static-preview`.

## Creates

- Private Soft S3 bucket (account-suffixed name)
- CloudFront Soft distribution with OAC (default cert only)
- Soft URL outputs

## Does not create

- Route 53 / ACM custom domains
- App Runner / ECR
- Railway teardown / MX changes

## Usage

```bash
cp terraform.tfvars.example terraform.tfvars
# set app = "<site-slug>"
terraform init
terraform plan    # confirm: no Route53 / no custom domains
terraform apply

aws s3 sync ./dist "s3://$(terraform output -raw bucket_name)/" --delete
# optional: aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths "/*"
```

Open `cloudfront_soft_url`. Soft HOLD remains until Oral DNS GO.

**Do not apply from Cloud Agents unless AWS credentials are already present.**
