# Add a new site in 5 steps

**Goal:** Soft-add Site N on Oral21 / us-east-1 with little AI — copy Soft pattern,
change `app` + name, Soft-apply, Soft-smoke. No DNS, no Railway changes.

## Before you start

- Soft preview for LockHabit already understood ([04-preview-host.md](./04-preview-host.md))
- Decide **SSR** vs **static** (needs Node at request time?)
- Pick `app` slug: lowercase, short (`booker`, `halenor`, `lockhabit-blog`, …)
- Soft HOLD still applies ([00-HARD-HOLDS.md](./00-HARD-HOLDS.md))

---

### Step 1 — Copy Soft stack

**SSR**

```bash
cp -R infra/aws-soft-preview infra/aws-soft-preview-<app>
# or reuse one root module with a second tfvars / workspace named {app}-preview
```

**Static**

```bash
cp -R infra/aws-soft-static-preview infra/aws-soft-static-preview-<app>
```

Prefer **Terraform workspace** or separate `*.tfvars` over forking modules once you
are comfortable — same Soft module, different `app`.

### Step 2 — Set naming + tags

In `terraform.tfvars`:

```hcl
app  = "<site-slug>"   # e.g. booker
env  = "preview"
# name_prefix defaults to "{app}-{env}-web" or "{app}-{env}-static"
```

Confirm tags will be `app=<slug>`, `env=preview`, `SoftSafe=true`, `SoftHoldDns=true`
([03-naming-and-tags.md](./03-naming-and-tags.md)).

### Step 3 — Soft-apply (no custom domain)

```bash
terraform init
terraform plan    # must show ZERO Route53 / ACM custom-domain / apex records
terraform apply
```

Save Soft URL outputs. If SSR: Phase A ECR → docker push → Phase B App Runner.

### Step 4 — Soft-deploy content

| Type | Soft deploy |
| --- | --- |
| SSR | Build Soft image with **TEST** build-args; push to Soft ECR; App Runner picks tag |
| Static | `aws s3 sync` build output to Soft bucket; invalidate Soft CF if needed |

Put secrets in App Runner / Secrets Manager / CI — **never** git.

### Step 5 — Soft-smoke + stop

- [ ] Soft URL loads
- [ ] App-specific Soft TEST path works (forms, checkout, etc.)
- [ ] Production / Railway / Zoho MX untouched
- [ ] Tag filter in Cost Explorer shows `app=<slug>`, `env=preview`

**Do not** Soft-attach a custom domain in this runbook. That is OWNER + Oral GO.

---

## Cheat sheet

| Question | Answer |
| --- | --- |
| Where do Soft stacks live? | `infra/aws-soft-preview*` / `infra/aws-soft-static-preview*` |
| What always changes per site? | `app` (+ optional `name_prefix`) |
| What never changes Soft? | Region `us-east-1`, Soft HOLD on DNS/MX/Railway |
| Phone numbers? | Not part of Site N — see [06-phone-later.md](./06-phone-later.md) |
| Halenor Soft website already Soft-merged? | Prefer Halenor #632 Soft module when repo ACL allows; else Soft-static / Soft-SSR here |

## Optional later (not these 5 steps)

- ACM + DNS dual-run
- Prod `env=prod` Soft-clone with Soft HOLD lifted by Oral GO
- Shared GitHub OIDC Soft deploy role per `app`
