-- ============================================
-- Migration 002: Avatars storage bucket
-- + update new-user trigger to set default avatar
-- ============================================

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Allow authenticated users to upload their own avatar
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update (upsert) their own avatar
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read of all avatars
create policy "Public can read avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Allow users to delete their own avatar
create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- Update trigger to set DiceBear default avatar
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  user_name text;
  avatar text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'name', 'User');
  avatar := 'https://api.dicebear.com/9.x/initials/svg?seed=' ||
            encode(convert_to(user_name, 'UTF8'), 'escape') ||
            '&backgroundColor=059669&fontColor=ffffff';

  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    user_name,
    avatar
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
