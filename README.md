# LockHabit Soap & Body Care

The official LockHabit tropical soap storefront, including the Sunny Splash design, catalog, cart, Stripe Checkout, Supabase order persistence, and Resend order confirmations.

## Development

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/43c49e20-277d-4b8e-a5d8-fc5fa094e43c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

Requires Node.js and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Payments

Checkout runs in Stripe TEST mode by default. Copy `.env.example` to a local
environment file and configure the server-only Stripe, Supabase, and Resend
variables before exercising checkout. Never expose or commit populated `.env`
files. Stripe webhook requests must target `/api/stripe/webhook` and include a
valid signature from the configured TEST webhook secret.
