-- Users table (traditional auth, not Supabase Auth)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Users can view their own data
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
