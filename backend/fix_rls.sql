-- Drop existing policies
drop policy if exists "Users can view own data" on public.users;
drop policy if exists "Users can update own data" on public.users;

-- Allow public signups (inserts from backend)
create policy "Allow public signup" on public.users for insert with check (true);

-- Users can view their own data (but we'll handle this in backend with JWT)
create policy "Users can view own data" on public.users for select using (true);

-- Users can update their own data (backend will verify JWT)
create policy "Users can update own data" on public.users for update using (true);
