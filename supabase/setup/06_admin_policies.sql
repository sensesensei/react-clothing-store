-- Replace temporary public table policies with admin-aware access rules.
-- Public storefront remains readable, but admin mutations require role = admin.

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view products" on public.products;
drop policy if exists "Public can insert products" on public.products;
drop policy if exists "Public can update products" on public.products;
drop policy if exists "Public can delete products" on public.products;
drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Admins can view all products" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Public can view active products"
  on public.products
  for select
  to public
  using (coalesce(is_active, true) = true);

create policy "Admins can view all products"
  on public.products
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Public can view categories" on public.categories;
drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;

create policy "Public can view categories"
  on public.categories
  for select
  to public
  using (true);

create policy "Admins can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete categories"
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Public can view orders" on public.orders;
drop policy if exists "Public can insert orders" on public.orders;
drop policy if exists "Public can update orders" on public.orders;
drop policy if exists "Public can delete orders" on public.orders;
drop policy if exists "Admins can view orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Public can insert orders"
  on public.orders
  for insert
  to public
  with check (status = 'new');

create policy "Admins can view orders"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update orders"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete orders"
  on public.orders
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "Public can view order items" on public.order_items;
drop policy if exists "Public can insert order items" on public.order_items;
drop policy if exists "Admins can view order items" on public.order_items;
drop policy if exists "Admins can delete order items" on public.order_items;

create policy "Public can insert order items"
  on public.order_items
  for insert
  to public
  with check (true);

create policy "Admins can view order items"
  on public.order_items
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can delete order items"
  on public.order_items
  for delete
  to authenticated
  using (public.is_admin());
