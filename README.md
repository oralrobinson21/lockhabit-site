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
npm run lint
npx tsc --noEmit
npm run build
```

Checkout requires the Stripe/Lovable connector variables, and order persistence requires the Supabase server variables documented in `.env.example`. Never commit populated environment files.
