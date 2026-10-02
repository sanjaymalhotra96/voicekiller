-- Account: profile photos and self-service account deletion.
-- Run in Supabase dashboard > SQL Editor (or `supabase db push`).

-- Public bucket for profile photos. Files live under "<user id>/...".
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars: upload own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars: update own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars: delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lets a signed-in user delete their own account (and, via cascade,
-- their library_items). Called from the app with supabase.rpc('delete_user').
create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
