-- ============================================
-- Migration 004: Add "Other" catch-all category
-- ============================================

insert into public.categories (name, slug, icon)
values ('Other', 'other', 'Tag')
on conflict (slug) do nothing;
