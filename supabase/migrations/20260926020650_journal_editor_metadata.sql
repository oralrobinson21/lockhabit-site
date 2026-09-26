alter table public.journal_posts
  add column if not exists author text not null default 'LOCKHABIT Editorial',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reading_time_minutes integer,
  add column if not exists related_product_slugs text[] not null default '{}',
  add column if not exists seo_title text,
  add column if not exists seo_description text;
