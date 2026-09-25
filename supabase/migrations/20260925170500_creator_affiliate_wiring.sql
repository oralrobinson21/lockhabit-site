-- Wire creator authentication and safe server-side affiliate operations.
alter table public.creator_profiles
  add column if not exists reset_requested_at timestamptz;

create or replace function public.creator_profile_for_current_user()
returns table (
  id uuid, email text, username text, display_name text, referral_code text,
  referral_slug text, status text, commission_bps integer, tax_status text,
  payout_status text, agreement_accepted_at timestamptz, disclosure_acknowledged_at timestamptz
)
language sql stable security invoker
set search_path = ''
as $$
  select p.id,p.email,p.username,p.display_name,p.referral_code,p.referral_slug,p.status,
         p.commission_bps,p.tax_status,p.payout_status,p.agreement_accepted_at,p.disclosure_acknowledged_at
  from public.creator_profiles p
  where p.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.creator_dashboard_summary()
returns table (
  clicks bigint, paid_orders bigint, merchandise_cents bigint,
  pending_cents bigint, available_cents bigint, paid_cents bigint
)
language sql stable security invoker
set search_path = ''
as $$
  with me as (
    select id from public.creator_profiles where auth_user_id = auth.uid() limit 1
  )
  select
    (select count(*) from public.creator_referral_clicks c, me where c.creator_id=me.id),
    (select count(*) from public.creator_attributions a, me where a.creator_id=me.id),
    coalesce((select sum(a.paid_merchandise_cents) from public.creator_attributions a, me where a.creator_id=me.id),0),
    coalesce((select sum(l.amount_cents) from public.creator_commission_ledger l, me where l.creator_id=me.id and l.status='pending'),0),
    coalesce((select sum(l.amount_cents) from public.creator_commission_ledger l, me where l.creator_id=me.id and l.status='available'),0),
    coalesce((select -sum(l.amount_cents) from public.creator_commission_ledger l, me where l.creator_id=me.id and l.entry_type='payout' and l.status='paid'),0)
$$;

create or replace function public.request_creator_payout(p_amount_cents integer)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare cid uuid; available integer; rid uuid;
begin
  if p_amount_cents < 2000 then raise exception 'Minimum payout is $20'; end if;
  select id into cid from public.creator_profiles where auth_user_id=auth.uid() and status='active';
  if cid is null then raise exception 'Creator account is not active'; end if;
  select coalesce(sum(amount_cents),0)::integer into available
    from public.creator_commission_ledger where creator_id=cid and status='available';
  if p_amount_cents > available then raise exception 'Requested amount exceeds available balance'; end if;
  if exists(select 1 from public.creator_payout_requests where creator_id=cid and status in ('requested','approved')) then
    raise exception 'A payout request is already pending';
  end if;
  insert into public.creator_payout_requests(creator_id,amount_cents,status)
    values(cid,p_amount_cents,'requested') returning id into rid;
  return rid;
end;
$$;

revoke all on function public.creator_profile_for_current_user() from public,anon;
revoke all on function public.creator_dashboard_summary() from public,anon;
revoke all on function public.request_creator_payout(integer) from public,anon;
grant execute on function public.creator_profile_for_current_user() to authenticated;
grant execute on function public.creator_dashboard_summary() to authenticated;
grant execute on function public.request_creator_payout(integer) to authenticated;
