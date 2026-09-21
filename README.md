# LockHabit Soap & Body Care

The official LockHabit storefront for botanical soaps and body care. This TanStack Start application includes the product catalog, product detail routes, cart, Stripe checkout entry, Supabase order persistence, responsive storefront styling, and repository-owned media assets.

## Local development

Use Node.js 22 and copy `.env.example` to a local `.env` with the required environment-specific values.

```sh
npm install
npm run dev
```

## Verification

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Payments and order confirmations

Checkout uses Stripe Checkout in `STRIPE_MODE=test` by default. Configure the matching
test publishable key, a server-only Stripe restricted/secret key, and the test webhook
signing secret from `.env.example`. The webhook endpoint is:

```text
POST /api/stripe/webhook
```

Subscribe that endpoint to `checkout.session.completed`,
`checkout.session.async_payment_succeeded`, and
`checkout.session.async_payment_failed`. Successful payment is recorded only by the
signed webhook; the checkout return page is informational and never creates an order or
sends email.

Order persistence requires the Supabase server secret/service-role variable and the
included migration. Custom LockHabit confirmations use Resend and require
`RESEND_API_KEY`, `LOCKHABIT_ORDER_FROM_EMAIL`, and `LOCKHABIT_SUPPORT_EMAIL`. Stripe's
own customer receipt setting remains separate and should be enabled in the Stripe
Dashboard for the appropriate mode.

Never commit populated environment files or expose any server-only variable through a
`VITE_` name.
