-- Storage setup for admin product image uploads.
-- Current admin panel works from the public client, so these policies are intentionally open.
-- After admin auth is added, tighten INSERT/UPDATE/DELETE policies to authenticated admins only.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view product images'
  ) then
    create policy "Public can view product images"
      on storage.objects
      for select
      to public
      using (bucket_id = 'product-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can upload product images'
  ) then
    create policy "Public can upload product images"
      on storage.objects
      for insert
      to public
      with check (bucket_id = 'product-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can update product images'
  ) then
    create policy "Public can update product images"
      on storage.objects
      for update
      to public
      using (bucket_id = 'product-images')
      with check (bucket_id = 'product-images');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can delete product images'
  ) then
    create policy "Public can delete product images"
      on storage.objects
      for delete
      to public
      using (bucket_id = 'product-images');
  end if;
end $$;
