-- LockHabit creator / affiliate program foundation.
-- Additive only: no storefront tables or checkout behavior are replaced.
-- Supabase Auth owns credentials; this schema stores creator business data and an append-only commission ledger.

create extension if not exists pgcrypto;

create table if not exists public.creator_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  username text unique,
  display_name text not null,
  referral_code text not null unique,
  referral_slug text not null unique,
  status text not null default 'applicant' check (status in ('applicant','approved','active','paused')),
  commission_bps integer not null default 1000 check (commission_bps between 0 and 10000),
  agreement_accepted_at timestamptz,
  disclosure_acknowledged_at timestamptz,
  tax_status text not null default 'not_required' check (tax_status in ('not_required','requested','complete','blocked')),
  payout_status text not null default 'not_ready' check (payout_status in ('not_ready','ready','blocked')),
  invited_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists creator_profiles_email_lower_idx
  on public.creator_profiles (lower(email));

create table if not exists public.creator_referral_clicks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete cascade,
  attribution_token uuid not null default gen_random_uuid() unique,
  landing_path text,
  referrer_host text,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists creator_referral_clicks_creator_created_idx
  on public.creator_referral_clicks (creator_id, created_at desc);

create table if not exists public.creator_attributions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete restrict,
  attribution_token uuid references public.creator_referral_clicks(attribution_token) on delete set null,
  checkout_session_id text unique,
  payment_intent_id text unique,
  order_number bigint,
  paid_merchandise_cents integer not null check (paid_merchandise_cents >= 0),
  currency text not null default 'usd',
  paid_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists creator_attributions_creator_paid_idx
  on public.creator_attributions (creator_id, paid_at desc);

create table if not exists public.creator_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete restrict,
  attribution_id uuid references public.creator_attributions(id) on delete restrict,
  entry_type text not null check (entry_type in ('commission','refund_adjustment','payout','manual_adjustment')),
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null check (status in ('pending','available','paid','reversed')),
  available_at timestamptz,
  stripe_event_id text,
  idempotency_key text not null unique,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists creator_commission_ledger_creator_created_idx
  on public.creator_commission_ledger (creator_id, created_at desc);

create table if not exists public.creator_payout_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_profiles(id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 2000),
  currency text not null default 'usd',
  status text not null default 'requested' check (status in ('requested','approved','paid','rejected','cancelled')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  paid_at timestamptz,
  owner_note text
);

create table if not exists public.creator_outreach (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.creator_profiles(id) on delete set null,
  name_or_brand text not null,
  platform text,
  profile_url text,
  contact text,
  niche text,
  follower_count bigint,
  notes text,
  stage text not null default 'prospect' check (stage in ('prospect','contacted','responded','interested','approved','active')),
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_profiles enable row level security;
alter table public.creator_referral_clicks enable row level security;
alter table public.creator_attributions enable row level security;
alter table public.creator_commission_ledger enable row level security;
alter table public.creator_payout_requests enable row level security;
alter table public.creator_outreach enable row level security;

revoke all on public.creator_profiles, public.creator_referral_clicks, public.creator_attributions,
  public.creator_commission_ledger, public.creator_payout_requests, public.creator_outreach
  from anon, authenticated;

grant select on public.creator_profiles, public.creator_referral_clicks, public.creator_attributions,
  public.creator_commission_ledger, public.creator_payout_requests to authenticated;
grant insert on public.creator_payout_requests to authenticated;
grant all on public.creator_profiles, public.creator_referral_clicks, public.creator_attributions,
  public.creator_commission_ledger, public.creator_payout_requests, public.creator_outreach to service_role;

drop policy if exists creator_profiles_self_select on public.creator_profiles;
create policy creator_profiles_self_select on public.creator_profiles
  for select to authenticated using (auth.uid() = auth_user_id);

drop policy if exists creator_clicks_self_select on public.creator_referral_clicks;
create policy creator_clicks_self_select on public.creator_referral_clicks
  for select to authenticated using (
    creator_id in (select id from public.creator_profiles where auth_user_id = auth.uid())
  );

drop policy if exists creator_attributions_self_select on public.creator_attributions;
create policy creator_attributions_self_select on public.creator_attributions
  for select to authenticated using (
    creator_id in (select id from public.creator_profiles where auth_user_id = auth.uid())
  );

drop policy if exists creator_ledger_self_select on public.creator_commission_ledger;
create policy creator_ledger_self_select on public.creator_commission_ledger
  for select to authenticated using (
    creator_id in (select id from public.creator_profiles where auth_user_id = auth.uid())
  );

drop policy if exists creator_payouts_self_select on public.creator_payout_requests;
create policy creator_payouts_self_select on public.creator_payout_requests
  for select to authenticated using (
    creator_id in (select id from public.creator_profiles where auth_user_id = auth.uid())
  );

drop policy if exists creator_payouts_self_insert on public.creator_payout_requests;
create policy creator_payouts_self_insert on public.creator_payout_requests
  for insert to authenticated with check (
    creator_id in (select id from public.creator_profiles where auth_user_id = auth.uid())
    and amount_cents >= 2000
  );

-- Creator outreach is owner/service-role only. No authenticated policy is intentional.

create or replace function public.promote_creator_commissions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.creator_commission_ledger
  set status = 'available'
  where entry_type = 'commission'
    and status = 'pending'
    and available_at <= now();
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.promote_creator_commissions() from public, anon, authenticated;
grant execute on function public.promote_creator_commissions() to service_role;
