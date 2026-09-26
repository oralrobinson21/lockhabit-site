-- LockHabit finish-line: returning-customer reward lifecycle + commission hold hardening.
-- Additive / backward-compatible only.

-- Reserve before Stripe session create. Concurrent callers: only one wins (partial unique index).
create or replace function public.reserve_returning_customer_reward(p_order_number bigint)
returns table(ok boolean, redemption_id uuid, source_order_id uuid, reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_redemption_id uuid;
begin
  select o.id into v_order_id
  from public.orders o
  where o.order_number = p_order_number
    and o.payment_status = 'paid'
  limit 1;

  if v_order_id is null then
    return query select false, null::uuid, null::uuid, 'not_found';
    return;
  end if;

  begin
    insert into public.customer_reward_redemptions (
      source_order_id,
      source_order_number,
      status
    ) values (
      v_order_id,
      p_order_number,
      'reserved'
    )
    returning id into v_redemption_id;
  exception
    when unique_violation then
      return query select false, null::uuid, v_order_id, 'already_used';
      return;
  end;

  return query select true, v_redemption_id, v_order_id, 'reserved'::text;
end;
$$;

revoke all on function public.reserve_returning_customer_reward(bigint) from public, anon, authenticated;
grant execute on function public.reserve_returning_customer_reward(bigint) to service_role;

create or replace function public.bind_returning_customer_reward(
  p_redemption_id uuid,
  p_checkout_session_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.customer_reward_redemptions
  set redeemed_checkout_session_id = p_checkout_session_id
  where id = p_redemption_id
    and status = 'reserved'
    and redeemed_checkout_session_id is null;
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.bind_returning_customer_reward(uuid, text) from public, anon, authenticated;
grant execute on function public.bind_returning_customer_reward(uuid, text) to service_role;

create or replace function public.release_returning_customer_reward_by_id(p_redemption_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.customer_reward_redemptions
  set status = 'released'
  where id = p_redemption_id
    and status = 'reserved';
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.release_returning_customer_reward_by_id(uuid) from public, anon, authenticated;
grant execute on function public.release_returning_customer_reward_by_id(uuid) to service_role;

create or replace function public.redeem_returning_customer_reward(p_checkout_session_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.customer_reward_redemptions
  set status = 'redeemed',
      redeemed_at = coalesce(redeemed_at, now())
  where redeemed_checkout_session_id = p_checkout_session_id
    and status = 'reserved';
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.redeem_returning_customer_reward(text) from public, anon, authenticated;
grant execute on function public.redeem_returning_customer_reward(text) to service_role;

create or replace function public.release_returning_customer_reward(p_checkout_session_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.customer_reward_redemptions
  set status = 'released'
  where redeemed_checkout_session_id = p_checkout_session_id
    and status = 'reserved';
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

revoke all on function public.release_returning_customer_reward(text) from public, anon, authenticated;
grant execute on function public.release_returning_customer_reward(text) to service_role;

-- Ensure each paid order can mint exactly one next-order reward credential row (source = that order).
-- Eligibility rows are created with status='released' placeholder? No — rewards are granted by
-- inserting nothing until the next checkout reserves against the prior order. The prior order
-- itself is the credential; validate_returning_customer_reward already checks paid + no active redemption.

-- Harden commission promotion: never release rows whose attribution net is fully clawed back.
create or replace function public.promote_creator_commissions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.creator_commission_ledger c
  set status = 'available'
  where c.entry_type = 'commission'
    and c.status = 'pending'
    and c.available_at is not null
    and c.available_at <= now()
    and coalesce((
      select sum(l.amount_cents)
      from public.creator_commission_ledger l
      where l.attribution_id = c.attribution_id
        and l.entry_type in ('commission', 'refund_adjustment')
        and l.status in ('pending', 'available', 'paid', 'reversed')
    ), 0) > 0;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.promote_creator_commissions() from public, anon, authenticated;
grant execute on function public.promote_creator_commissions() to service_role;

-- Newsletter explicit consent + one-click unsubscribe support (additive columns).
alter table public.newsletter_subscribers
  add column if not exists consent_at timestamptz,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_token uuid default gen_random_uuid();

update public.newsletter_subscribers
set consent_at = coalesce(consent_at, created_at),
    unsubscribe_token = coalesce(unsubscribe_token, gen_random_uuid())
where consent_at is null or unsubscribe_token is null;

create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token)
  where unsubscribe_token is not null;

-- Reader profiles for optional Journal accounts (separate from creator/owner).
create table if not exists public.reader_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reader_profiles_email_lower_idx
  on public.reader_profiles (lower(email));

alter table public.reader_profiles enable row level security;
revoke all on public.reader_profiles from anon, authenticated;
grant select, update on public.reader_profiles to authenticated;
grant all on public.reader_profiles to service_role;

drop policy if exists reader_profiles_self_select on public.reader_profiles;
create policy reader_profiles_self_select on public.reader_profiles
  for select to authenticated using (auth.uid() = auth_user_id);

drop policy if exists reader_profiles_self_update on public.reader_profiles;
create policy reader_profiles_self_update on public.reader_profiles
  for update to authenticated using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);
