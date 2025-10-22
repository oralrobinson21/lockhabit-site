# LockHabit
A behavioral savings vault: **hard lock** funds, earn APR while you wait, emergency self-loan that can build credit. Custody via partner banks (FDIC when structured properly). Flat unlock fees: $3 / $2 / $1 by term.

## Live
- https://YOUR-DOMAIN/

## Stack
- Vercel (static + serverless API)
- Supabase (Postgres)
- Resend (email)

## Env (set in Vercel → Settings → Environment Variables)
- `SUPABASE_URL`  
- `SUPABASE_SERVICE_KEY`  
- `RESEND_API_KEY`  
- `APP_ORIGIN` (optional, e.g., https://YOUR-DOMAIN)

## API
- `POST /api/waitlist` → `{ email, name, term }`

## Legal
LockHabit is not a bank. Banking services by partner banks. When structured for pass-through coverage, FDIC insurance applies up to legal limits per depositor, per bank. Hard lock; early withdrawal not permitted except for approved emergencies; otherwise 5% fee for break attempts. APR is prorated; rates/fees subject to change.
