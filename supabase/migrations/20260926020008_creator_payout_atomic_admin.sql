-- Owner-only manual payout lifecycle. Service role invokes this after verifying the owner session.
-- Keep all balance movements and state changes in one transaction.
create or replace function public.owner_transition_creator_payout(
  p_request_id uuid, p_action text, p_note text default null
) returns text language plpgsql security definer set search_path = '' as $$
declare p public.creator_payout_requests%rowtype; c public.creator_profiles%rowtype;
begin
  if p_action not in ('approve', 'reject', 'paid') then raise exception 'Invalid payout action'; end if;
  select * into p from public.creator_payout_requests where id = p_request_id for update;
  if not found then raise exception 'Payout request not found'; end if;
  select * into c from public.creator_profiles where id = p.creator_id for update;
  if p_action = 'approve' then
    if p.status <> 'requested' then raise exception 'Payout is not requested'; end if;
    if c.status <> 'active' or c.tax_status not in ('complete','not_required')
      or c.payout_status <> 'ready' or c.agreement_accepted_at is null
      or c.disclosure_acknowledged_at is null then
      raise exception 'Creator payout compliance is incomplete';
    end if;
    update public.creator_payout_requests set status='approved', reviewed_at=now(), owner_note=p_note where id=p.id;
  elsif p_action = 'reject' then
    if p.status not in ('requested','approved') then raise exception 'Payout cannot be rejected'; end if;
    update public.creator_payout_requests set status='rejected', reviewed_at=now(), owner_note=p_note where id=p.id;
  else
    if p.status <> 'approved' then raise exception 'Approve the payout first'; end if;
    if nullif(trim(p_note),'') is null then raise exception 'Record the external payment method and reference'; end if;
    insert into public.creator_commission_ledger(creator_id,entry_type,amount_cents,currency,status,idempotency_key,note)
      values(p.creator_id,'payout',-p.amount_cents,p.currency,'paid','manual-payout:' || p.id::text,p_note);
    update public.creator_payout_requests set status='paid', paid_at=now(), owner_note=p_note where id=p.id;
  end if;
  return p_action;
end $$;
revoke all on function public.owner_transition_creator_payout(uuid,text,text) from public,anon,authenticated;
grant execute on function public.owner_transition_creator_payout(uuid,text,text) to service_role;

create or replace function public.request_creator_payout(p_amount_cents integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare cid uuid; available bigint; rid uuid;
begin
  if p_amount_cents < 2000 then raise exception 'Minimum payout is $20'; end if;
  select id into cid from public.creator_profiles where auth_user_id=(select auth.uid()) and status='active' for update;
  if cid is null then raise exception 'Creator account is not active'; end if;
  select coalesce(sum(amount_cents),0) into available from public.creator_commission_ledger
    where creator_id=cid and (status='available' or (entry_type='payout' and status='paid'));
  if p_amount_cents > available then raise exception 'Requested amount exceeds available balance'; end if;
  insert into public.creator_payout_requests(creator_id,amount_cents,status) values(cid,p_amount_cents,'requested') returning id into rid;
  return rid;
exception when unique_violation then raise exception 'A payout request is already pending';
end $$;
revoke all on function public.request_creator_payout(integer) from public,anon;
grant execute on function public.request_creator_payout(integer) to authenticated;

create or replace function public.creator_dashboard_summary()
returns table(clicks bigint,paid_orders bigint,merchandise_cents bigint,pending_cents bigint,available_cents bigint,paid_cents bigint)
language sql stable security invoker set search_path='' as $$
  with me as (select id from public.creator_profiles where auth_user_id=(select auth.uid()) limit 1)
  select
    (select count(*) from public.creator_referral_clicks c, me where c.creator_id=me.id),
    (select count(*) from public.creator_attributions a, me where a.creator_id=me.id),
    coalesce((select sum(a.paid_merchandise_cents) from public.creator_attributions a, me where a.creator_id=me.id),0),
    coalesce((select sum(l.amount_cents) from public.creator_commission_ledger l, me where l.creator_id=me.id and l.status='pending'),0),
    coalesce((select sum(l.amount_cents) from public.creator_commission_ledger l, me where l.creator_id=me.id and (l.status='available' or (l.entry_type='payout' and l.status='paid'))),0)
      - coalesce((select sum(p.amount_cents) from public.creator_payout_requests p, me where p.creator_id=me.id and p.status in ('requested','approved')),0),
    coalesce((select -sum(l.amount_cents) from public.creator_commission_ledger l, me where l.creator_id=me.id and l.entry_type='payout' and l.status='paid'),0)
$$;
revoke all on function public.creator_dashboard_summary() from public,anon;
grant execute on function public.creator_dashboard_summary() to authenticated;

-- Release held commissions once their recorded availability time has passed.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'lockhabit-release-creator-commissions',
  '15 4 * * *',
  'select public.promote_creator_commissions()'
);
