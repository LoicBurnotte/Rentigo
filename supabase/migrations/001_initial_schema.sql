-- ============================================
-- Rentigo Database Schema
-- Peer-to-peer rental marketplace
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  location text,
  stripe_account_id text,
  created_at timestamptz default now() not null
);

-- Categories
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text not null
);

-- Items
create table public.items (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null,
  category_id uuid not null references public.categories(id),
  price_per_day numeric(10,2) not null check (price_per_day > 0),
  latitude double precision not null,
  longitude double precision not null,
  city text not null,
  images text[] default '{}',
  created_at timestamptz default now() not null
);

-- Booking status enum
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- Bookings
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.items(id) on delete cascade,
  renter_id uuid not null references public.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  total_price numeric(10,2) not null check (total_price > 0),
  stripe_payment_intent text,
  status booking_status default 'pending' not null,
  created_at timestamptz default now() not null,
  constraint valid_dates check (end_date > start_date)
);

-- Favorites
create table public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(user_id, item_id)
);

-- Conversations
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  renter_id uuid not null references public.users(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(renter_id, owner_id, item_id)
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_items_owner on public.items(owner_id);
create index idx_items_category on public.items(category_id);
create index idx_items_city on public.items(city);
create index idx_items_slug on public.items(slug);
create index idx_items_location on public.items(latitude, longitude);
create index idx_bookings_item on public.bookings(item_id);
create index idx_bookings_renter on public.bookings(renter_id);
create index idx_bookings_status on public.bookings(status);
create index idx_favorites_user on public.favorites(user_id);
create index idx_favorites_item on public.favorites(item_id);
create index idx_conversations_renter on public.conversations(renter_id);
create index idx_conversations_owner on public.conversations(owner_id);
create index idx_messages_conversation on public.messages(conversation_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Users: public read, own write
create policy "Users are publicly readable" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Categories: public read
create policy "Categories are publicly readable" on public.categories
  for select using (true);

-- Items: public read, owner write
create policy "Items are publicly readable" on public.items
  for select using (true);

create policy "Users can create items" on public.items
  for insert with check (auth.uid() = owner_id);

create policy "Owners can update their items" on public.items
  for update using (auth.uid() = owner_id);

create policy "Owners can delete their items" on public.items
  for delete using (auth.uid() = owner_id);

-- Bookings: involved users can read, renters can create
create policy "Users can view their bookings" on public.bookings
  for select using (
    auth.uid() = renter_id or
    auth.uid() in (select owner_id from public.items where id = item_id)
  );

create policy "Users can create bookings" on public.bookings
  for insert with check (auth.uid() = renter_id);

create policy "Involved users can update bookings" on public.bookings
  for update using (
    auth.uid() = renter_id or
    auth.uid() in (select owner_id from public.items where id = item_id)
  );

-- Favorites: own read/write
create policy "Users can view own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can add favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can remove favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Conversations: involved users
create policy "Users can view their conversations" on public.conversations
  for select using (auth.uid() = renter_id or auth.uid() = owner_id);

create policy "Users can create conversations" on public.conversations
  for insert with check (auth.uid() = renter_id);

-- Messages: conversation participants
create policy "Users can view messages in their conversations" on public.messages
  for select using (
    conversation_id in (
      select id from public.conversations
      where renter_id = auth.uid() or owner_id = auth.uid()
    )
  );

create policy "Users can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    conversation_id in (
      select id from public.conversations
      where renter_id = auth.uid() or owner_id = auth.uid()
    )
  );

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- ============================================
-- SEED DATA: Default Categories
-- ============================================

insert into public.categories (name, slug, icon) values
  ('Tools', 'tools', 'Wrench'),
  ('Cameras', 'cameras', 'Camera'),
  ('Outdoor Gear', 'outdoor-gear', 'Mountain'),
  ('Event Equipment', 'event-equipment', 'PartyPopper'),
  ('Electronics', 'electronics', 'Laptop'),
  ('Sports Equipment', 'sports-equipment', 'Dumbbell');

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'User')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- STORAGE
-- ============================================

-- Create storage bucket for item images
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true);

-- Allow authenticated users to upload
create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-images');

-- Allow public read
create policy "Public can read item images"
  on storage.objects for select
  to public
  using (bucket_id = 'item-images');

-- Allow owners to delete their images
create policy "Users can delete own images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);
