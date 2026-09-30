# Cost note — what Railway this Soft path eventually replaces

## What LockHabit pays Railway for today

LockHabit production is a **continuous Node SSR web service** on Railway:

- Build (`npm run build` via Railpack)
- Runtime (`npm start` → Nitro node-server)
- Custom domain TLS for `lockhabit.com` / `www`
- Health checks + restart policy

That runtime is the bill Soft AWS is meant to shrink or remove **after** Soft
dual-run and Oral GO. Soft preview itself is an **extra** temporary cost while
Railway stays live (by design).

## Soft AWS cost shape (preview)

| Soft resource | Typical Soft preview role | Rough order of magnitude* |
| --- | --- | --- |
| ECR | Image storage | Cents–low dollars / mo |
| App Runner Soft | SSR compute | Often lower than always-on PaaS at low traffic; scales with requests/CPU |
| CloudFront Soft (optional) | Edge Soft URL / caching | Low until traffic |
| Data transfer / logs | Variable | Watch during Soft dual-run |

\*AWS pricing changes; treat as directional. Oral should confirm in AWS Cost Explorer
after Soft apply.

## What Soft AWS does **not** replace

| Spend | Stays |
| --- | --- |
| Supabase | Database / auth |
| Stripe fees | Payments |
| Resend | Order email |
| Domain (Porkbun) | DNS / registration |
| Lovable / Cursor / Vercel preview noise | Dev tooling |

## Soft dual-run rule

Until Oral GO:

1. Keep Railway production billed and healthy.
2. Soft App Runner is a **parallel** preview — expected temporary dual spend.
3. Only after Soft checkout/webhook green + DNS GO does Railway website hosting
   get paused/removed to realize savings.

## Savings trigger (future GO)

Railway website hosting for LockHabit can be reduced when:

- Soft (then custom-domain) AWS SSR is serving production traffic, and
- Stripe live webhook + Resend paths are verified on AWS, and
- Oral explicitly approves Railway teardown Soft HOLD lift.
