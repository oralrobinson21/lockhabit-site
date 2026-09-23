-- Keep the Stripe account mode that created each order so historical test
-- purchases never get looked up against the live account (or vice versa).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_livemode boolean;

COMMENT ON COLUMN public.orders.stripe_livemode IS
  'True for live-mode Stripe payments, false for test-mode payments. Null only for legacy rows awaiting backfill.';
