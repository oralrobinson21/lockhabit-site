# LockHabit discount and attribution stacking

Server-authoritative rules. The browser never sets prices, discounts, or attribution.

## Merchandise base

1. Resolve cart items against the catalog and Stripe price lookup keys.
2. Apply **bundle pricing** first (3 bars → $89, 6 bars → $169; body care stays separate).
3. That post-bundle merchandise total (integer cents) is the stacking base.
4. Shipping and tax are never discounted by Check-In or the 5% reward.
5. Free-shipping eligibility uses merchandise **after** LockHabit discounts.

## Check-In 10% (reusable)

- Applied only when the server finds a row in `checkin_offer_claims` for the shopper session UUID.
- Browser localStorage is a visual mirror only — never discount authority.
- Formula: `Math.round(merchandiseCents * 0.9)`.

## Prior-order 5% reward (single-use)

- Shopper enters a prior paid order number (`LH-######` or bare digits).
- Server validates via `validate_returning_customer_reward` / reserve RPC.
- Reserved atomically at Checkout Session create; released on expire/fail/cancel; redeemed only on paid webhook.
- Partial unique index ensures only one reserved/redeemed row per source order — concurrent checkouts: only one wins.
- Applied **after** Check-In when both are present: `Math.round(afterCheckInCents * 0.95)`.
- Contract examples: `$35 → $29.93`, `$89 → $76.10`, `$169 → $144.50`.

## Creator codes (attribution only)

- Creator referral links and typed creator codes do **not** change the price.
- Precedence at Checkout create (server):
  1. Valid typed **creator code** for an `active` creator **overrides** link/cookie attribution.
  2. Else last unexpired referral click token (30-day window) for an `active` creator.
  3. Else no attribution.
- Self-referrals are allowed.
- Attribution and commission are written only on **confirmed paid** Stripe webhook events — never on a client claim.

## Stripe promotion codes

- When LockHabit Check-In and/or the 5% reward apply, Stripe `allow_promotion_codes` is **disabled** so stacking stays deterministic.
- When neither LockHabit discount applies, Stripe promotion codes remain available (existing behavior).

## Commission base (10%)

- `paid_merchandise_cents` = paid merchandise after customer discounts, **excluding shipping and tax**.
- Commission = `floor(paid_merchandise_cents * commission_bps / 10000)` (default 1000 bps = 10%).
- Status starts `pending` with `available_at` = paid_at + 14 days (conservative hold when no confirmed delivery).
- Full/partial refunds append `refund_adjustment` ledger rows and reduce or reverse pending/available commission.
