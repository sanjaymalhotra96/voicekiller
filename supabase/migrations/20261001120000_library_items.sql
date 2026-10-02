-- Library: every audio file a user generates.
-- Run in Supabase dashboard > SQL Editor (or `supabase db push`).

create table if not exists public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  -- Matches ToolId in src/features/tools/tools.ts.
  tool text not null check (tool in (
    'textToSpeech', 'voiceClone', 'voiceDesign', 'voiceChanger',
    'audioClean', 'speechEditor', 'speechToText'
  )),
  voice_name text,
  duration_seconds numeric not null default 0 check (duration_seconds >= 0),
  audio_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists library_items_user_created_idx
  on public.library_items (user_id, created_at desc);

-- Each user can only see and change their own files.
alter table public.library_items enable row level security;

create policy "library: read own" on public.library_items
  for select using (auth.uid() = user_id);
create policy "library: insert own" on public.library_items
  for insert with check (auth.uid() = user_id);
create policy "library: update own" on public.library_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "library: delete own" on public.library_items
  for delete using (auth.uid() = user_id);
