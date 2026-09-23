-- Remove legacy objects from the original LockHabit prototype.
-- The current storefront uses orders, Stripe webhook delivery state,
-- and newsletter_subscribers; those production tables are intentionally preserved.

drop materialized view if exists public.waitlist_stats;
drop table if exists public.highscores;
drop table if exists public.waitlist;
