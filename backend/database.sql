-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text,
  category text,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  address text,
  updated_at timestamp with time zone
);

-- Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status text default 'pending', -- pending, paid, shipped, delivered, cancelled
  total_amount decimal(10, 2) not null,
  shipping_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id uuid references public.products not null,
  quantity integer not null,
  price_at_purchase decimal(10, 2) not null
);

-- RLS Policies (Security)
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products: Everyone can read, only admins can insert/update (simplified for now: public read)
create policy "Products are viewable by everyone" on public.products for select using (true);

-- Profiles: Users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Orders: Users can view their own orders
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order Items: Users can view their own order items
create policy "Users can view own order items" on public.order_items for select using (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);
