# LockHabit Finish-Line Report — 2026-09-26

## Direct answer

**Is it live and is it 100% verified?**  
**No — not 100%.** Code is merged to `main` as PR [#34](https://github.com/oralrobinson21/lockhabit-site/pull/34) (merge commit `d6a129f9f2fe98624556c918e159a2b5fde87223`). Automated CI is green. Supabase additive migrations for rewards/newsletter/readers are applied on the LockHabit project. **Railway production (`lockhabit.com` / `www.lockhabit.com`) had not yet begun serving this merge SHA when this report was written** (`GET /api/version` still 404; homepage asset fingerprint still `assets/index-Cgfmd-iI.js`). Stripe TEST end-to-end charges were **not** exercised in this environment because Stripe secret/webhook TEST credentials are not available to the agent. No live charge was placed.

---

## Baseline (before changes)

| Item | Value |
|------|--------|
| GitHub `main` at handoff | `2a1242c1e4b9da2a6b02a790385cff9235e815a2` (PR #33) |
| Railway served SHA | **Unknown** — no `/api/version` existed; both hosts returned HTTP 200 HTML shell |
| Observed Railway bundle | `assets/index-Cgfmd-iI.js` |
| Railway MCP | Unavailable (auth error in this environment) |

---

## What changed (PR links)

### Merged
- **[PR #34](https://github.com/oralrobinson21/lockhabit-site/pull/34)** — Finish LockHabit Stripe stacking, attribution ledger, and Journal accounts  
  - Merge SHA: `d6a129f9f2fe98624556c918e159a2b5fde87223`  
  - CI: LockHabit QA validate **SUCCESS**

### Key deliverables in that PR
- `GET /api/version` — non-secret `{ sha, shortSha, builtAt, stripeMode }` (reads `RAILWAY_GIT_COMMIT_SHA` etc.)
- Server-authoritative Check-In **10%** + single-use prior-order **5%** stacking (`src/lib/checkout-discounts.ts`, wired in `payments.functions.ts`)
- Documented stacking rules: `docs/LOCKHABIT_DISCOUNT_STACKING.md`
- Creator code **overrides** link token for attribution only; self-referral allowed
- Paid-webhook attribution + **10% merchandise commission** (after discounts, excl. shipping/tax), 14-day pending hold, refund clawbacks
- Reward reserve → bind → redeem / release lifecycle (SQL RPCs + webhook hooks)
- Cart UI: real discount rows, prior-order 5% field, creator code field, trust copy (no storefront redesign)
- Success page + receipt text: next-order 5% credential (`LH-######`); postcard receipt template **not restyled**
- GA4: `return_reward_applied`, `affiliate_checkout`, `affiliate_purchase`
- Reader `/join`, `/account`; shared `/sign-in` routes reader/creator/owner separately
- Newsletter explicit consent + `/unsubscribe`
- Journal comment UI (still gated by `LOCKHABIT_JOURNAL_COMMENTS_ENABLED`, default off)
- Webhook event addendum: `docs/STRIPE_WEBHOOK_EVENTS.md`

### Follow-up in this report commit
- `docs/redeploy-ping.txt` bump to encourage Railway rebuild once GitHub→Railway is connected
- This report file

---

## Test-mode results (controlled cases)

| Case | Result | Evidence |
|------|--------|----------|
| 10% then 5% rounding ($35→$29.93, $89→$76.10, $169→$144.50) | **PASS** | `src/lib/checkout-discounts.test.ts` |
| Check-In alone / reward alone / zero-negative guards | **PASS** | same |
| Commission 10% of post-discount merchandise | **PASS** | `commissionCents` unit tests |
| 14-day hold from paid_at | **PASS** | unit test |
| Creator code overrides token; paused/expired ignored | **PASS** | `src/lib/creator-attribution.server.test.ts` |
| Paid webhook replay → one order, one email | **PASS** | `stripe-webhook.server.test.ts` |
| Async fail / unpaid → no order | **PASS** | same |
| Expired checkout → release path, no order | **PASS** | new expired webhook test |
| Full pricing/cart/shipping/GA4/email suite | **PASS** | `npm test` — 72/72 |
| Typecheck / lint / production build | **PASS** | `tsc --noEmit`, eslint (warnings only in UI kit), `npm run build` |
| Stripe TEST Checkout Session create (real API) | **NOT RUN** | No `STRIPE_*_KEY_TEST` / webhook secret in agent env |
| Concurrent single-use 5% race (two sessions) | **NOT RUN** (DB unique index + reserve RPC implemented; live race not driven) | Needs TEST Stripe + DB |
| Full/partial refund commission clawback (live Stripe events) | **NOT RUN** | Logic implemented; needs TEST refunds |
| Cross-account reward / creator RLS live probe | **NOT RUN** | Needs authenticated TEST accounts |
| Real Stripe TEST paid → attribution ledger row | **NOT RUN** | No creator profiles in DB (0 rows); needs owner-approved creator + TEST pay |

---

## Live deployment SHA status

| Host | HTTP | `/api/version` | Served SHA |
|------|------|----------------|------------|
| `https://lockhabit.com` | 200 (site) | **404** at report time | Pre-finish-line build (`index-Cgfmd-iI.js`) |
| `https://www.lockhabit.com` | 200 (site) | **404** at report time | Same |

Merge SHA on GitHub `main`: **`d6a129f9f2fe98624556c918e159a2b5fde87223`**.  
GitHub “Production” deployment status for that SHA is a **Vercel** deployment (SSO-protected), not Railway. Railway MCP could not be authenticated here, so the agent could not trigger or inspect the Railway deploy.

---

## Mobile / desktop findings (pre-deploy production)

Screenshots: `/opt/cursor/artifacts/screenshots/`

| Artifact | Viewport | Result |
|----------|----------|--------|
| `01-homepage-desktop-1440.webp` | ~1440 | PASS |
| `02-homepage-mobile-375.webp` | ~375 | PASS |
| `03-product-coconut-beach-desktop-1280.webp` | ~1280 | PASS |
| `04-product-coconut-beach-mobile-390.webp` | ~390 | PASS |
| `05-cart-drawer-mobile-390.webp` | ~390 | PASS |
| `06-cart-drawer-desktop-1440.webp` | ~1440 | PASS |
| `07-journal-desktop-1440.webp` | ~1440 | PASS (Coming Soon) |
| `08-journal-mobile-375.webp` | ~375 | PASS (Coming Soon) |
| `09-sign-in-desktop-1280.webp` | ~1280 | PASS |
| `10-faq-desktop-1280.webp` | ~1280 | PASS |
| `11-returns-desktop-1280.webp` | ~1280 | PASS |
| `12-contact-desktop-1280.webp` | ~1280 | PASS |

Defects found on that pass: **none** (overlap/clipping/broken images/inaccessible controls).  
**Note:** Those screenshots are against the **pre-PR #34** Railway build. Post-deploy visual re-check of cart discount rows, `/join`, `/account`, `/unsubscribe`, and `/api/version` is still required after Railway serves `d6a129f`.

---

## Flows personally exercised end-to-end

- Homepage, product page, cart open/add (no payment) — desktop + mobile (computer-use QA)
- Journal Coming Soon — desktop + mobile
- Sign-in, FAQ, returns, contact — desktop spot check
- Local: full automated test suite, eslint, tsc, production build
- Supabase: applied additive migration `finish_line_rewards_newsletter_readers` on LockHabit project `uomcsaaqjfpytllhuosd`
- Confirmed both apex and www return 200

**Not exercised:** Stripe TEST or LIVE checkout payment, webhook delivery to Railway, creator invite/email, reader email verification inbox, owner commission payout cash movement, live refund.

---

## What remains unverified

1. Railway serving merge SHA `d6a129f` on both hosts (`/api/version` must return that SHA).
2. Stripe TEST acceptance matrix against real Checkout + webhooks (failed/cancelled/duplicate/refund/expired/concurrent 5%/cross-account).
3. Live Stripe webhook dashboard actually listing `checkout.session.expired`, `charge.refunded`, `refund.created`, `refund.updated` on the existing endpoint (documented in `docs/STRIPE_WEBHOOK_EVENTS.md` — do not create new keys).
4. End-to-end creator attribution with a real active creator profile (DB currently has **0** creator profiles).
5. Post-deploy cart/Check-In discount UI and Journal comment flag behavior on Railway.
6. Any authorized live paid transaction verification (intentionally not done; never place a live charge).

---

## Owner-only actions needed

1. **Trigger / confirm Railway deploy** of `main` @ `d6a129f` (Lovable publish or Railway dashboard). Re-auth Railway MCP in Cursor if agents should manage this later.
2. Confirm Stripe **TEST** and **LIVE** webhooks include the new event types in `docs/STRIPE_WEBHOOK_EVENTS.md` (no new keys).
3. Provide or run Stripe **TEST** mode verification with TEST secrets (agent env has none), or temporarily point a non-production Railway service at TEST keys.
4. When ready for affiliate proof: approve a real creator, send invitation only to an address you control, complete one TEST paid order.
5. Optional: set `LOCKHABIT_JOURNAL_COMMENTS_ENABLED=true` on Railway only when comments should go live.
6. Optional: Supabase Auth leaked-password / MFA advisor review (called out in finish-line doc; not changed here).

---

## Stacking rules (shipped)

See `docs/LOCKHABIT_DISCOUNT_STACKING.md`:

1. Bundle pricing first  
2. Check-In 10% (`Math.round(cents * 0.9)`) if server claim exists  
3. Then single-use 5% (`Math.round(after * 0.95)`) if reserved prior order  
4. Creator code/token: **attribution only**, code overrides link  
5. When LockHabit discounts apply, Stripe promotion codes are disabled for deterministic stacking  

Commission base: paid merchandise after discounts, excluding shipping and tax; 10% (1000 bps); pending 14 days from paid_at.
