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


-- Conversations table (for mobile app chat history)
create table conversations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  mode text default 'clarify',
  messages jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table conversations enable row level security;

-- Policies
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete
  using (auth.uid() = user_id);


-- Saved Notes table (for mobile app saved documents)
create table saved_notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  task_name text not null,
  detected_type text not null,
  summary text,
  document_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table saved_notes enable row level security;

-- Policies
create policy "Users can view own saved_notes"
  on saved_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved_notes"
  on saved_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saved_notes"
  on saved_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own saved_notes"
  on saved_notes for delete
  using (auth.uid() = user_id);

-- Saved SOPs table (for mobile app SOPs with scheduling)
create table saved_sops (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  summary text,
  total_duration int default 0,
  steps jsonb default '[]'::jsonb,
  status text default 'scheduled',
  start_time timestamp with time zone,
  current_step_index int default 0,
  reminders jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table saved_sops enable row level security;

-- Policies
create policy "Users can view own saved_sops"
  on saved_sops for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved_sops"
  on saved_sops for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saved_sops"
  on saved_sops for update
  using (auth.uid() = user_id);

create policy "Users can delete own saved_sops"
  on saved_sops for delete
  using (auth.uid() = user_id);
