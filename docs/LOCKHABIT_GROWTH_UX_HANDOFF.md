# LOCKHABIT Growth UX Handoff — 2026-09-25

This branch is the coded UX handoff for the growth/conversion/creator/Journal work discussed in the September 2026 build plan.

## Hard rules

- Production remains Railway on `lockhabit.com` / `www.lockhabit.com`.
- Do not replace the current storefront, product photography, packaging, checkout, orders, or production Stripe configuration.
- Returns are **14 days** everywhere. Never 15.
- Check-In offer: reusable **10%** customer discount.
- Dismissed Check-In state: ticket immediately left of the cart/bag, badge **1**.
- Applied Check-In state: calm applied/check state, not another urgent badge.
- Returning-customer reward: **5%** using a validated previous real order number as the credential.
- 10% Check-In and 5% returning-customer reward may stack intentionally.
- Creator/affiliate commission: **10% of paid merchandise after customer discounts**, excluding shipping and tax.
- Creator commission is Pending during the **14-day return/refund hold**, then becomes Available.
- Refunded/reversed merchandise must reverse or adjust commission.
- Self-purchases/self-referrals are allowed by the owner’s business rule; do not add a hard block.
- Creator cash-out UI uses a **$20 minimum**.
- Journal stays hidden/noindexed until real content is approved for launch.
- No fake medical claims, fake reviews, fake scarcity, or invented certifications.

## A01 — Check-In 10% postcard

Component: `src/components/checkin-offer.tsx`

Approved composition:
- warm aged postcard/paper
- actual LockHabit logo
- coral `CHECK IN FOR`
- dark green `10% OFF`
- yellow underline/swoosh
- left tropical/coastal travel collage
- right postage/ticket stack
- travel postmark / sunburst details
- real CTA: `Tap to Add to Bag →`
- `Maybe later`
- `Applied automatically at checkout.`
- bottom line: `14-day returns on unopened, unused items.`

Production behavior for Cursor:
1. Trigger after ~25 seconds of engaged browsing.
2. Blur/dim page behind the postcard.
3. Close via X, backdrop, or Escape.
4. Persist pending/applied state appropriately.
5. CTA applies the reusable 10% discount state; it must not add a fake product line.
6. Reopen via the header ticket.
7. Track GA4: offer shown/opened/dismissed/reopened/applied.
8. Respect reduced-motion and focus trapping.
9. Keep mobile rich rather than collapsing to a generic modal.

## A02 — Header ticket

`SiteHeader` now accepts an optional `promoSlot` so Cursor can wire the actual ticket beside the bag without redesigning the header.

Pending:
- ticket/coupon icon
- badge `1`
- opens A01

Applied:
- calm check/applied state
- no urgent badge

## A03 — Cart conversion + trust

Design reference: `/handoff` → A03.

Required live behavior:
- bundle pricing first
- reusable Check-In 10% next
- validated 5% previous-order reward next when present
- server-authoritative calculations
- free-shipping progress
- explicit discount rows
- secure checkout CTA

Trust copy:
- Secure checkout powered by Stripe
- 14-day returns on unopened, unused items
- Tracking emailed when your order ships
- Free shipping on $75+
- Returns Policy link with return-shipping details

## A04 — Post-purchase 5% reward

Design reference: `/handoff` → A04.

Required behavior:
- order success: `You’re checked in.`
- show real order number
- `Take 5% off your next order`
- same order number used as reward credential
- copy action
- validate server-side against an eligible paid order
- receipt/email should mirror the reward
- GA4 reward redemption tracking

## A05 — Creator / affiliate experience

Routes:
- `/creator/login`
- `/creator/set-password`
- `/creator/forgot-password`
- `/creator`
- `/creator/invite-preview` (handoff-only email preview)

Dashboard includes:
- clicks
- attributed paid orders
- merchandise revenue
- pending commission
- available commission
- paid commission
- unique referral link
- unique creator code
- approved disclosure guidance
- transactions
- payout request/history
- profile/security/payout/tax status

Production wiring:
- owner sends one onboarding invitation
- temporary credential is first-login only
- creator sets own password
- normal password sign-in afterward
- forgot-password/reset flow
- strong RLS: creator sees only own referral/commission data
- no customer card data or unnecessary PII
- 30-day referral window unless owner changes it
- Stripe successful-payment webhook is sale authority
- refund webhook adjusts commission
- minimum cash-out $20

## A06 — Owner creator admin + outreach

Route: `/owner/creator-program`

Creator states:
- Applicant
- Approved
- Active
- Paused

Owner sees:
- link/code/rate
- clicks/orders/revenue
- pending/available/paid
- agreement/disclosure/tax status
- payout queue
- outreach pipeline

Outreach:
- Prospect → Contacted → Responded → Interested → Approved → Active
- name/brand/platform/profile/contact/niche/follower count/notes/last contacted
- deliberate outreach only; do not build uncontrolled spam sending

## A07 — Journal

Customer routes:
- `/journal`
- `/journal/coming-soon`
- `/journal/article-template`

Owner route:
- `/owner/journal`

Journal design requirements:
- `KEEP THE VIBES GOING — The LockHabit Journal`
- current LockHabit header/footer and visual language
- search
- category filters
- featured article
- reusable article cards
- pagination / server-pagination-ready UX
- empty/no-results states
- one post looks complete; hundreds remain usable
- noindex until public launch

Categories in the handoff:
- Ingredients
- Rituals
- Research Notes
- Travel Brighter
- FAQs

Article structure:
- title/excerpt/author/published/reviewed/category/read time
- Short answer
- What the ingredient is
- Traditional use
- What research studied
- Supportive evidence
- Mixed/negative evidence
- Limitations
- Rinse-off vs leave-on distinction
- Safety notes
- References
- Related products
- Related articles

Research rule:
- prefer authoritative primary/secondary sources such as government resources, PubMed/NLM-discovered literature, universities, and peer-reviewed work
- source type is not endorsement
- include mixed/negative findings where relevant
- never publish sample/design-preview factual claims without article-specific sourcing

Owner Journal admin:
- Draft / In review / Scheduled / Published
- title/category/status/search
- simple editor handoff
- research/reference gate
- designed to scale through server search/pagination without a UX redesign

## Internal review route

`/handoff`

This route is noindex and exists only to review the coded UX states before Cursor/backend wiring.

## Cursor/backend implementation sequence

1. Preserve current storefront and tests.
2. Wire Check-In persistence + 25-second trigger.
3. Add server-authoritative discount calculation.
4. Wire cart/trust changes to current cart, not a replacement cart.
5. Implement previous-order reward validation and redemption.
6. Add success-page + receipt/email reward.
7. Create creator/affiliate schema + auth + RLS.
8. Add attribution persistence + Stripe metadata.
9. On successful paid webhook, create affiliate commission ledger entry idempotently.
10. On refund/reversal, adjust commission idempotently.
11. Implement payout request workflow and owner queue.
12. Implement creator invite/reset emails.
13. Add outreach persistence.
14. Add Journal article/category/reference schema and owner publishing flow.
15. Keep Journal hidden/noindexed until launch toggle.
16. Add GA4 events without creating duplicate purchase events.
17. Test desktop/mobile/security/accessibility.
18. Run existing pricing/cart/order/refund/shipping tests.
19. Deploy exact merge SHA to Railway only after gates pass.
20. Re-test the real Railway production site after deploy.

## Current branch safety

The handoff branch is intentionally not wired to live payment/auth/database behavior. Merge only after the real backend implementation and production verification are complete.
