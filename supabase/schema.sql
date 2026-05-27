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

alter table disciplines enable row level security;
alter table journal_entries enable row level security;

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
