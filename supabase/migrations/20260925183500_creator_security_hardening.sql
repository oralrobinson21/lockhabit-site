-- Harden creator access and add indexes after production wiring.
drop policy if exists creator_payouts_self_insert on public.creator_payout_requests;
revoke insert on public.creator_payout_requests from authenticated;
create index if not exists creator_attributions_token_idx on public.creator_attributions(attribution_token);
create index if not exists creator_ledger_attribution_idx on public.creator_commission_ledger(attribution_id);
create index if not exists creator_outreach_creator_idx on public.creator_outreach(creator_id);
create index if not exists creator_payout_creator_idx on public.creator_payout_requests(creator_id);
