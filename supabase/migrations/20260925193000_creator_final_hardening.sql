-- Final non-Stripe creator hardening.
create unique index if not exists creator_one_open_payout_idx
  on public.creator_payout_requests (creator_id)
  where status in ('requested','approved');

drop policy if exists creator_profiles_self_select on public.creator_profiles;
create policy creator_profiles_self_select on public.creator_profiles
  for select to authenticated using ((select auth.uid()) = auth_user_id);
drop policy if exists creator_clicks_self_select on public.creator_referral_clicks;
create policy creator_clicks_self_select on public.creator_referral_clicks
  for select to authenticated using (creator_id in (select id from public.creator_profiles where auth_user_id = (select auth.uid())));
drop policy if exists creator_attributions_self_select on public.creator_attributions;
create policy creator_attributions_self_select on public.creator_attributions
  for select to authenticated using (creator_id in (select id from public.creator_profiles where auth_user_id = (select auth.uid())));
drop policy if exists creator_ledger_self_select on public.creator_commission_ledger;
create policy creator_ledger_self_select on public.creator_commission_ledger
  for select to authenticated using (creator_id in (select id from public.creator_profiles where auth_user_id = (select auth.uid())));
drop policy if exists creator_payouts_self_select on public.creator_payout_requests;
create policy creator_payouts_self_select on public.creator_payout_requests
  for select to authenticated using (creator_id in (select id from public.creator_profiles where auth_user_id = (select auth.uid())));

revoke all on function public.capture_creator_referral(text,text,text,text) from public,anon,authenticated;
grant execute on function public.capture_creator_referral(text,text,text,text) to service_role;

create or replace function public.request_creator_payout(p_amount_cents integer)
returns uuid language plpgsql security definer set search_path=''
as $$
declare cid uuid; available integer; rid uuid;
begin
 if p_amount_cents < 2000 then raise exception 'Minimum payout is $20'; end if;
 select id into cid from public.creator_profiles where auth_user_id=(select auth.uid()) and status='active' for update;
 if cid is null then raise exception 'Creator account is not active'; end if;
 select coalesce(sum(amount_cents),0)::integer into available from public.creator_commission_ledger where creator_id=cid and status='available';
 if p_amount_cents > available then raise exception 'Requested amount exceeds available balance'; end if;
 insert into public.creator_payout_requests(creator_id,amount_cents,status) values(cid,p_amount_cents,'requested') returning id into rid;
 return rid;
exception when unique_violation then
 raise exception 'A payout request is already pending';
end;
$$;
revoke all on function public.request_creator_payout(integer) from public,anon;
grant execute on function public.request_creator_payout(integer) to authenticated;