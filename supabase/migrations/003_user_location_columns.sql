-- ============================================
-- Migration 003: Structured location on users
-- Aligns with the items table pattern:
--   location text  →  city text + latitude + longitude
-- ============================================

-- Rename existing free-text column to city
alter table public.users
  rename column location to city;

-- Add coordinate columns (nullable — user may not have set a location yet)
alter table public.users
  add column latitude  double precision,
  add column longitude double precision;

-- Index city for future "find users near X" queries
create index idx_users_city     on public.users(city);
create index idx_users_location on public.users(latitude, longitude);
