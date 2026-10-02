-- Profiles: plan and usage, writable only by the server.
-- user_metadata is editable by the user, so plan/usage must not live there.
-- Run in Supabase dashboard > SQL Editor (or `supabase db push`).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'basic' check (plan in ('basic', 'studio')),
  usage_minutes numeric not null default 0 check (usage_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Users may read their own profile. There are no insert/update/delete
-- policies, so only the service role (your backend, webhooks) can change it.
alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

-- Every new account gets a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill accounts that already exist.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
