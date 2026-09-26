-- Comments remain disabled until the Journal is approved for launch.
-- Server-only moderation prevents drafts, unreviewed text, or contact details
-- from leaking through the Data API.
create table if not exists public.journal_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.journal_posts(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null check (length(author_name) between 1 and 80),
  body text not null check (length(body) between 10 and 3000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  constraint journal_comments_moderated_consistent check (
    (status = 'pending' and moderated_at is null) or
    (status <> 'pending' and moderated_at is not null)
  )
);

create index if not exists journal_comments_post_public_idx
  on public.journal_comments (post_id, created_at desc) where status = 'approved';
create index if not exists journal_comments_moderation_idx
  on public.journal_comments (created_at desc) where status = 'pending';
create index if not exists journal_comments_user_recent_idx
  on public.journal_comments (author_user_id, post_id, created_at desc);

alter table public.journal_comments enable row level security;
revoke all on public.journal_comments from public, anon, authenticated;
grant all on public.journal_comments to service_role;
