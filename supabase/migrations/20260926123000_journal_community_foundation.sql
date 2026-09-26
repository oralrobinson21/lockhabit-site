-- LOCKHABIT Journal community/membership foundation.
-- Additive only. Comments and paid support remain disabled by default.
-- This migration intentionally does not change storefront checkout behavior.

alter table public.journal_posts
  add column if not exists editorial_lane text
    check (editorial_lane is null or editorial_lane in ('right_now','help_me','entertain_me')),
  add column if not exists franchise text,
  add column if not exists author_slug text,
  add column if not exists comments_allowed boolean not null default false,
  add column if not exists audio_enabled boolean not null default true,
  add column if not exists featured_rank integer,
  add column if not exists trending_score numeric not null default 0,
  add column if not exists fact_checked_at timestamptz;

create table if not exists public.journal_platform_settings (
  id text primary key default 'default' check (id = 'default'),
  comments_enabled boolean not null default false,
  supporter_enabled boolean not null default false,
  digest_sending_enabled boolean not null default false,
  reactions_enabled boolean not null default true,
  author_follows_enabled boolean not null default true,
  account_signup_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.journal_platform_settings (id)
values ('default')
on conflict (id) do nothing;

create table if not exists public.journal_members (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  lifetime_discount_percent smallint not null default 10
    check (lifetime_discount_percent between 0 and 100),
  newsletter_frequency text not null default 'daily_digest'
    check (newsletter_frequency in ('daily_digest','important_only','weekly','off')),
  newsletter_categories text[] not null default '{}',
  read_speed numeric(3,1) not null default 1.0
    check (read_speed in (1.0,1.5,2.0)),
  comments_opt_in boolean not null default true,
  supporter_tier text not null default 'free'
    check (supporter_tier in ('free','supporter_3','supporter_5')),
  supporter_status text not null default 'none'
    check (supporter_status in ('none','active','past_due','canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  discount_granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists journal_members_email_lower_unique
  on public.journal_members (lower(email));

alter table public.newsletter_subscribers
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists frequency text not null default 'daily_digest'
    check (frequency in ('daily_digest','important_only','weekly','off')),
  add column if not exists categories text[] not null default '{}',
  add column if not exists active boolean not null default true,
  add column if not exists last_digest_sent_at timestamptz;

create table if not exists public.journal_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.journal_posts(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references public.journal_comments(id) on delete cascade,
  display_name_snapshot text not null,
  body text not null check (char_length(body) between 1 and 4000),
  status text not null default 'pending'
    check (status in ('pending','approved','hidden','spam')),
  moderation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_comments_post_status_created_idx
  on public.journal_comments (post_id,status,created_at desc);
create index if not exists journal_comments_user_created_idx
  on public.journal_comments (auth_user_id,created_at desc);

create table if not exists public.journal_reactions (
  post_id uuid not null references public.journal_posts(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like','helpful','made_me_laugh')),
  created_at timestamptz not null default now(),
  primary key (post_id,auth_user_id,reaction)
);

create table if not exists public.journal_bookmarks (
  post_id uuid not null references public.journal_posts(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id,auth_user_id)
);

create table if not exists public.journal_author_follows (
  author_slug text not null,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (author_slug,auth_user_id)
);

create table if not exists public.journal_share_events (
  id bigint generated by default as identity primary key,
  post_id uuid not null references public.journal_posts(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  channel text not null default 'native' check (channel in ('native','copy_link','email','text','other')),
  created_at timestamptz not null default now()
);

create index if not exists journal_share_post_created_idx
  on public.journal_share_events (post_id,created_at desc);

create table if not exists public.journal_supporter_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  stripe_event_id text unique,
  stripe_checkout_session_id text,
  stripe_subscription_id text,
  amount_cents integer,
  tier text check (tier is null or tier in ('supporter_3','supporter_5')),
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists journal_support_subscription_idx
  on public.journal_supporter_events (stripe_subscription_id);

-- All community writes go through validated server functions.
-- This avoids exposing moderation/supporter state directly to browser clients.
alter table public.journal_platform_settings enable row level security;
alter table public.journal_members enable row level security;
alter table public.journal_comments enable row level security;
alter table public.journal_reactions enable row level security;
alter table public.journal_bookmarks enable row level security;
alter table public.journal_author_follows enable row level security;
alter table public.journal_share_events enable row level security;
alter table public.journal_supporter_events enable row level security;

revoke all on public.journal_platform_settings from anon,authenticated;
revoke all on public.journal_members from anon,authenticated;
revoke all on public.journal_comments from anon,authenticated;
revoke all on public.journal_reactions from anon,authenticated;
revoke all on public.journal_bookmarks from anon,authenticated;
revoke all on public.journal_author_follows from anon,authenticated;
revoke all on public.journal_share_events from anon,authenticated;
revoke all on public.journal_supporter_events from anon,authenticated;

grant all on public.journal_platform_settings to service_role;
grant all on public.journal_members to service_role;
grant all on public.journal_comments to service_role;
grant all on public.journal_reactions to service_role;
grant all on public.journal_bookmarks to service_role;
grant all on public.journal_author_follows to service_role;
grant all on public.journal_share_events to service_role;
grant all on public.journal_supporter_events to service_role;
grant usage,select on sequence public.journal_share_events_id_seq to service_role;
