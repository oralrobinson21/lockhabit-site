# LockHabit checkout and affiliate Stripe handoff

Production is `oralrobinson21/lockhabit-site` on Railway, not the Lovable preview. Preserve the existing storefront, product photography, pricing, cart, checkout UX, owner order flow, and current Stripe configuration. This document describes what remains **after** the non-Stripe foundation; it is not a claim that these payments are working.

## Current contracts

- `src/lib/payments.functions.ts` creates one-time Stripe Checkout Sessions from server-resolved product and bundle lookup keys. It currently does **not** consume the saved Check-In claim, prior order reward, or creator referral token/code.
- `src/lib/stripe-webhook.server.ts` records paid orders and sends receipts, but does **not** create customer rewards or affiliate attributions/commission entries. Refund adjustments are not connected to the creator ledger.
- `src/lib/checkin.functions.ts` writes `checkin_offer_claims` keyed by a shopper session UUID. `src/lib/checkin-storage.ts` mirrors the visual state; never use that browser copy as discount authority.
- `public.validate_returning_customer_reward(bigint)` validates a prior paid order number against the `customer_reward_redemptions` table. Reserving, redemption, and recovery after failed/cancelled checkout still need an atomic lifecycle.
- `public.capture_creator_referral` stores a 30-day first-party token for active creators. `/r/$slug` persists it in browser storage. `creator_attributions`, `creator_commission_ledger`, and `creator_payout_requests` exist. No creator profile was present at the September 26 production audit, so no creator sale has been proven end-to-end.
- `src/lib/creator.functions.ts` and `src/lib/owner-growth.functions.ts` now display sales/ledger source records and support manual payout lifecycle once verified payment records exist. The public link intentionally does not pay for clicks.

## Implementation contract for Cursor

1. Keep current price lookup and cart item validation. After bundle pricing, validate the server-stored Check-In UUID and prior paid order number. Apply the reusable 10% and then the single-use 5% sequentially with integer-cent rounding; $35 -> $29.93, $89 -> $76.10, $169 -> $144.50. Never trust a client-supplied subtotal or discount flag.
2. Resolve creator token against an unexpired click and active creator on the server. Add an explicit creator code field that overrides the cookie only after server validation; last valid referral within 30 days otherwise wins. Self-referrals are permitted. Bind the creator identity to the Checkout Session and paid order in server-controlled metadata, not an editable browser field.
3. At Checkout creation, mark a 5% redemption reserved atomically; release on failure/expiration/cancellation, redeem only after actual paid confirmation. An origin paid order grants one next-order redemption; do not double spend concurrent sessions. `customer_reward_redemptions` already has a partial uniqueness index for reserved/redeemed states.
4. On the verified paid webhook, create the reward for the *new* order, persist exactly one creator attribution and commission for eligible paid merchandise after discounts, excluding shipping and tax. Use Stripe event/session idempotency keys and write the order/ledger consistently across retries. Only real paid events can award commission. Reflect the real order number and 5% reward on success and receipt.
5. On full/partial refunds, reverse or proportionally reduce commissions with append-only ledger entries and idempotency. Hold commissions pending through the 14-day return window after confirmed delivery where available; conservatively fall back if no delivery date exists. The scheduled promotion function must not release refunded or compliance-ineligible money.
6. Preserve existing GA4 `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` deduplication. Send `welcome_offer_*`, `return_reward_applied`, `affiliate_checkout`, and `affiliate_purchase` once with safe non-PII identifiers/values. Test-mode traffic must be distinguishable.
7. Test paid/unpaid/failed/expired/replayed checkout, duplicate webhooks, partial/full refunds, concurrent reward claims, 10+5 rounding, self-referral, paused creator, malformed/expired token, zero/negative amounts, cross-account RLS, threshold, release hold, and live/test mode separation. Verify on the real Railway SHA using safe Stripe test transactions; never create an unintended live charge.

## Outside Stripe

- The Journal is intentionally Coming Soon and noindexed. Editorial drafts stay in review until the owner chooses a layout and approves publication. `LOCKHABIT_JOURNAL_COMMENTS_ENABLED` defaults off; the comments table and owner moderation path are preparatory, not a live comment feature.
- Owner must add actual creator applicant(s), approve, send secure invitations, and receive their agreement before an end-to-end affiliate purchase can be verified. Never invent accounts or send invites to guessed addresses.
- Supabase security advisors still flag project-level leaked-password protection and MFA options. Review their availability and effect before changing production Auth settings. RLS-with-no-policy flags on server-only tables are intentional. Creator table GraphQL discoverability is limited by per-owner RLS, but may warrant a private-schema move later.

Definition of done: tests, typecheck, lint, production build, migrations/RLS, exact merge SHA, successful Railway deployment, and real desktop/mobile checkout and dashboard verification. A successful build or empty dashboard alone does not qualify.
