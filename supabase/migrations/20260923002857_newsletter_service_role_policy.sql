drop policy if exists "Store service manages newsletter subscribers"
on public.newsletter_subscribers;

create policy "Store service manages newsletter subscribers"
on public.newsletter_subscribers
for all
to service_role
using (true)
with check (true);
