-- A reusable Check-In offer claim is recorded on the server. Pricing remains
-- unchanged until checkout wiring can validate this claim server-side.
create table if not exists public.checkin_offer_claims (
  session_token uuid primary key,
  claimed_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.checkin_offer_claims enable row level security;
revoke all on public.checkin_offer_claims from anon, authenticated;
grant select, insert, update on public.checkin_offer_claims to service_role;
