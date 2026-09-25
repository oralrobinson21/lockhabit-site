create unique index if not exists creator_one_open_payout_idx on public.creator_payout_requests(creator_id) where status in ('requested','approved');

create or replace function public.request_creator_payout(p_amount_cents integer)
returns uuid language plpgsql security definer set search_path=''
as $$
declare cid uuid; available integer; rid uuid;
begin
 if p_amount_cents < 2000 then raise exception 'Minimum payout is $20'; end if;
 select id into cid from public.creator_profiles where auth_user_id=auth.uid() and status='active' for update;
 if cid is null then raise exception 'Creator account is not active'; end if;
 select coalesce(sum(amount_cents),0)::integer into available from public.creator_commission_ledger where creator_id=cid and status='available';
 if p_amount_cents > available then raise exception 'Requested amount exceeds available balance'; end if;
 if exists(select 1 from public.creator_payout_requests where creator_id=cid and status in ('requested','approved')) then raise exception 'A payout request is already pending'; end if;
 insert into public.creator_payout_requests(creator_id,amount_cents,status) values(cid,p_amount_cents,'requested') returning id into rid;
 return rid;
end $$;

revoke all on function public.capture_creator_referral(text,text,text,text) from public,anon,authenticated;
grant execute on function public.capture_creator_referral(text,text,text,text) to service_role;
