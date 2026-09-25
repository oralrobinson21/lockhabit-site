# Inventory — current LockHabit hosting

Snapshot **2026-09-22**. Railway MCP unavailable; facts from live DNS/HTTP,
repo config, and Oral mailbox deploy alerts.

## Production traffic

| Check | Result |
| --- | --- |
| `https://lockhabit.com` | HTTP 200, `server: railway-hikari` |
| `https://www.lockhabit.com` | HTTP 200, `server: railway-hikari` |
| Apex DNS | `lockhabit.com` `A` → `69.46.46.15` |
| WWW DNS | `www.lockhabit.com` `CNAME` → `a38julom.up.railway.app.` |
| NS | Porkbun (`curitiba` / `fortaleza` / `maceio` / `salvador`) |
| MX | `10 sendfeedback-smtp.us-east-1.amazonses.com.` (**do not change**) |
| DMARC | `v=DMARC1; p=none;` |

Railway public hostname: `a38julom.up.railway.app` (direct hit = Railway fallback 404;
custom domain is the live entry).

## Railway project (from deploy alert email)

- Project / service: `lockhabit` / `lockhabit`
- Environment: `production`
- Config: [`railway.json`](../../railway.json)

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

`npm start` → `node .output/server/index.mjs` (Nitro **node-server**).

## App surface (why pure S3 is not enough)

LockHabit is TanStack Start SSR, not a static site.

| Surface | Location | Node at request time? |
| --- | --- | --- |
| SSR pages | `src/routes/*` | Yes |
| Stripe Checkout server fn | `src/lib/payments.functions.ts` | Yes |
| Checkout status server fn | same | Yes |
| Stripe webhook | `/api/stripe/webhook` | Yes |
| Owner email proof | `/api/email-test`, `/api/email-ink` | Yes |
| Orders | Supabase server keys | Yes (server) |
| Order email | Resend | Yes |
| Browser env | `VITE_*` | Build-time |

Vite ([`vite.config.ts`](../../vite.config.ts)): outside Lovable uses
`nitro: { preset: "node-server" }`. Soft AWS stays on **node-server**.

## Env vars for Soft compute

From [`.env.example`](../../.env.example) (names only):

- `SUPABASE_*`, `VITE_SUPABASE_*`
- `STRIPE_MODE`, `STRIPE_*_TEST` / `*_LIVE`, `VITE_STRIPE_MODE`, `VITE_PAYMENTS_CLIENT_TOKEN*`
- `RESEND_API_KEY`, `LOCKHABIT_ORDER_FROM_EMAIL`, `LOCKHABIT_SUPPORT_EMAIL`
- Optional proofing: `LOCKHABIT_EMAIL_TEST_*`, `LOCKHABIT_EMAIL_ASSET_BASE`, `LOCKHABIT_SITE_URL`, `LOCKHABIT_EMAIL_INK_SECRET`

## Adjacent platforms

| Platform | Soft note |
| --- | --- |
| Railway | **Production — keep** |
| Vercel | Preview/build noise; not Soft AWS path |
| Lovable | Editor sync |
| Supabase / Resend / SES MX | Soft HOLD on MX |

## Railway spend being replaced later

Continuous Node SSR + health checks + custom-domain TLS for `lockhabit.com` /
`www`. See [05-cost-note.md](./05-cost-note.md).
