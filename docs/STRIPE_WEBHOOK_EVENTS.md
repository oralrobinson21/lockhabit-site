# Stripe webhook events required by LockHabit finish-line code

Production already uses a live Stripe webhook. Do **not** create new live keys.
Only register any missing event types below on the existing live endpoint
`https://lockhabit.com/api/stripe/webhook` (and the matching TEST endpoint).

## Required event types

| Event | Why |
|-------|-----|
| `checkout.session.completed` | Existing — record paid orders / pending async payments |
| `checkout.session.async_payment_succeeded` | Existing — delayed payment success |
| `checkout.session.async_payment_failed` | Existing — release reserved 5% reward; no order |
| `checkout.session.expired` | **New** — release reserved 5% reward when Checkout expires |
| `charge.refunded` | **New** — proportional/full commission clawback |
| `refund.created` | **New** — refund adjustment when status is succeeded |
| `refund.updated` | **New** — refund adjustment when a refund becomes succeeded |

TEST and LIVE webhook secrets remain separate (`STRIPE_WEBHOOK_SECRET_TEST` /
`STRIPE_WEBHOOK_SECRET_LIVE`). Mode selection stays on `STRIPE_MODE`.
