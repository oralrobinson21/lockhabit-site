-- Public referral capture without exposing creator tables to anonymous callers.
create or replace function public.capture_creator_referral(
  p_slug text,
  p_landing_path text default '/',
  p_referrer_host text default null,
  p_user_agent_hash text default null
)
returns table(attribution_token uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare cid uuid; tok uuid; exp timestamptz;
begin
  select id into cid from public.creator_profiles
  where referral_slug = lower(trim(p_slug)) and status='active'
  limit 1;
  if cid is null then return; end if;
  insert into public.creator_referral_clicks(creator_id,landing_path,referrer_host,user_agent_hash)
  values(cid,left(coalesce(p_landing_path,'/'),500),left(p_referrer_host,255),left(p_user_agent_hash,128))
  returning creator_referral_clicks.attribution_token, creator_referral_clicks.expires_at into tok,exp;
  return query select tok,exp;
end;
$$;
revoke all on function public.capture_creator_referral(text,text,text,text) from public;
grant execute on function public.capture_creator_referral(text,text,text,text) to anon,authenticated;
