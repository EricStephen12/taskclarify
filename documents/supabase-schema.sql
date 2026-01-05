-- Users table (auto-created by Supabase Auth)

-- Profiles table for subscription management
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  is_pro boolean default false,
  subscription_id text,
  subscription_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Notes table (stores full formatted documents)
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  raw_input text not null,
  task_name text not null,
  detected_type text not null,
  document_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notes enable row level security;

-- Policies
create policy "Users can view own notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own notes"
  on notes for delete
  using (auth.uid() = user_id);

-- Usage tracking table
create table usage_tracking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month date not null,
  count int default 0,
  unique(user_id, month)
);

alter table usage_tracking enable row level security;

create policy "Users can view own usage"
  on usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on usage_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on usage_tracking for update
  using (auth.uid() = user_id);