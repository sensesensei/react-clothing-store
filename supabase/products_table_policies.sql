-- Temporary RLS policies for the current project stage.
-- The storefront and admin panel are still working from the public client,
-- so products/categories access is intentionally open for now.
-- After admin auth is added, tighten INSERT/UPDATE/DELETE to admins only.

alter table public.products enable row level security;
alter table public.categories enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public can view products'
  ) then
    create policy "Public can view products"
      on public.products
      for select
      to public
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public can insert products'
  ) then
    create policy "Public can insert products"
      on public.products
      for insert
      to public
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public can update products'
  ) then
    create policy "Public can update products"
      on public.products
      for update
      to public
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public can delete products'
  ) then
    create policy "Public can delete products"
      on public.products
      for delete
      to public
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Public can view categories'
  ) then
    create policy "Public can view categories"
      on public.categories
      for select
      to public
      using (true);
  end if;
end $$;
