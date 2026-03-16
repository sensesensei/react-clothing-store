-- Temporary public policies for the current project stage.
-- Storefront checkout and admin pages are still using the public client.
-- Replace these with authenticated admin-only policies when auth is ready.

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

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

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Public can view orders'
  ) then
    create policy "Public can view orders"
      on public.orders
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
      and tablename = 'orders'
      and policyname = 'Public can insert orders'
  ) then
    create policy "Public can insert orders"
      on public.orders
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
      and tablename = 'orders'
      and policyname = 'Public can update orders'
  ) then
    create policy "Public can update orders"
      on public.orders
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
      and tablename = 'orders'
      and policyname = 'Public can delete orders'
  ) then
    create policy "Public can delete orders"
      on public.orders
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
      and tablename = 'order_items'
      and policyname = 'Public can view order items'
  ) then
    create policy "Public can view order items"
      on public.order_items
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
      and tablename = 'order_items'
      and policyname = 'Public can insert order items'
  ) then
    create policy "Public can insert order items"
      on public.order_items
      for insert
      to public
      with check (true);
  end if;
end $$;
