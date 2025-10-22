# # LockHabit

Hard-lock savings with 3% APR, optional emergency self-loans that build credit, and FDIC-backed custody via partner banks. Pre-launch waitlist.

## Tech
- Static site on Vercel
- `/api/waitlist` → Supabase (anonymous write with RLS policy)
- Security headers via `vercel.json`
- PWA basics with `manifest.webmanifest` and `sw.js`

## Develop
1. Edit `index.html` and assets.
2. Commit to `main` → Vercel auto-deploys.
3. Environment:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

## Legal
LockHabit is a financial technology company, not a bank. Banking services via regulated partners. FDIC pass-through when structured and available. Terms in `/terms.html`, privacy in `/privacy.html`.