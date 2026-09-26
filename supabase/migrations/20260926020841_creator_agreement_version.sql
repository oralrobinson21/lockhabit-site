alter table public.creator_profiles
  add column if not exists agreement_version text;
