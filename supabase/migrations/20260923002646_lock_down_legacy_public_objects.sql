-- Lock down legacy/publicly exposed objects that are not used by the current LOCKHABIT app.
revoke all privileges on table public.highscores from anon, authenticated;
revoke all privileges on table public.waitlist from anon, authenticated;
revoke all privileges on table public.waitlist_stats from anon, authenticated;

-- Defense in depth for the server-only newsletter store.
revoke all privileges on table public.newsletter_subscribers from anon, authenticated;
