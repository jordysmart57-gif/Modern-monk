create table if not exists disciplines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  completed boolean default false,
  completed_date date default current_date,
  created_at timestamp with time zone default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  entry_date date default current_date,
  created_at timestamp with time zone default now()
);

create table if not exists rule_of_life_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  disciplines text[] not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists practice_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  discipline text not null check (discipline in ('Prayer', 'Silence', 'Solitude', 'Fasting', 'Scripture', 'Sabbath', 'Journaling')),
  entry_date date default current_date,
  notes text not null,
  created_at timestamp with time zone default now()
);

alter table disciplines enable row level security;
alter table journal_entries enable row level security;
alter table rule_of_life_preferences enable row level security;
alter table practice_entries enable row level security;

create index if not exists disciplines_user_date_idx
on disciplines (user_id, completed_date);

create unique index if not exists disciplines_user_date_name_unique_idx
on disciplines (user_id, completed_date, name);

create unique index if not exists journal_entries_user_date_unique_idx
on journal_entries (user_id, entry_date);

create index if not exists practice_entries_user_created_idx
on practice_entries (user_id, created_at desc);

drop policy if exists "Users can read their own disciplines" on disciplines;
create policy "Users can read their own disciplines"
on disciplines for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own disciplines" on disciplines;
create policy "Users can insert their own disciplines"
on disciplines for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own disciplines" on disciplines;
create policy "Users can update their own disciplines"
on disciplines for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own journal entries" on journal_entries;
create policy "Users can read their own journal entries"
on journal_entries for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own journal entries" on journal_entries;
create policy "Users can insert their own journal entries"
on journal_entries for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own journal entries" on journal_entries;
create policy "Users can update their own journal entries"
on journal_entries for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own rule of life" on rule_of_life_preferences;
create policy "Users can read their own rule of life"
on rule_of_life_preferences for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own rule of life" on rule_of_life_preferences;
create policy "Users can insert their own rule of life"
on rule_of_life_preferences for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own rule of life" on rule_of_life_preferences;
create policy "Users can update their own rule of life"
on rule_of_life_preferences for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own practice entries" on practice_entries;
create policy "Users can read their own practice entries"
on practice_entries for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own practice entries" on practice_entries;
create policy "Users can insert their own practice entries"
on practice_entries for insert
to authenticated
with check (auth.uid() = user_id);
