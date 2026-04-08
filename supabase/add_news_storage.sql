-- Create the storage bucket for news images
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket
-- Allow public access to read images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'news-images' );

-- Allow authenticated admins to upload images
create policy "Admin Upload Access"
on storage.objects for insert
with check (
  bucket_id = 'news-images' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Allow authenticated admins to delete images
create policy "Admin Delete Access"
on storage.objects for delete
using (
  bucket_id = 'news-images' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
