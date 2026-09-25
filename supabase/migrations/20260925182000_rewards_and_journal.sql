create table if not exists public.customer_reward_redemptions (
 id uuid primary key default gen_random_uuid(),
 source_order_id uuid not null references public.orders(id) on delete restrict,
 source_order_number bigint not null,
 redeemed_checkout_session_id text unique,
 status text not null default 'reserved' check (status in ('reserved','redeemed','released')),
 created_at timestamptz not null default now(),
 redeemed_at timestamptz
);
create unique index if not exists customer_reward_one_redeemed_per_order on public.customer_reward_redemptions(source_order_id) where status in ('reserved','redeemed');
alter table public.customer_reward_redemptions enable row level security;
revoke all on public.customer_reward_redemptions from anon, authenticated;
grant all on public.customer_reward_redemptions to service_role;

create or replace function public.validate_returning_customer_reward(p_order_number bigint)
returns table(eligible boolean, source_order_id uuid)
language sql security definer set search_path=''
as $$
 select
   (o.id is not null and o.payment_status='paid' and not exists (
      select 1 from public.customer_reward_redemptions r where r.source_order_id=o.id and r.status in ('reserved','redeemed')
   )) as eligible,
   o.id
 from (select 1) seed
 left join public.orders o on o.order_number=p_order_number and o.payment_status='paid'
 limit 1
$$;
revoke all on function public.validate_returning_customer_reward(bigint) from public,anon,authenticated;
grant execute on function public.validate_returning_customer_reward(bigint) to service_role;

create table if not exists public.journal_posts (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
 title text not null,
 excerpt text not null default '',
 category text not null,
 status text not null default 'draft' check(status in ('draft','in_review','scheduled','published','archived')),
 body jsonb not null default '[]'::jsonb,
 hero_image_url text,
 hero_image_alt text,
 reference_items jsonb not null default '[]'::jsonb,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.journal_posts enable row level security;
revoke all on public.journal_posts from anon,authenticated;
grant all on public.journal_posts to service_role;
