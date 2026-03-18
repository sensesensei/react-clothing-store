# Supabase Setup

Здесь лежит актуальный setup для проекта `Parfum`.

Основная папка для новых запусков:
- `supabase/setup/01_catalog_schema.sql`
- `supabase/setup/02_orders_schema.sql`
- `supabase/setup/03_public_policies.sql`
- `supabase/setup/04_product_images_storage.sql`
- `supabase/setup/05_auth_roles.sql`
- `supabase/setup/06_admin_policies.sql`
- `supabase/setup/07_admin_storage_policies.sql`
- `supabase/setup/08_guest_checkout_rpc.sql`

Запускай их в этом порядке через `Supabase -> SQL Editor`.

Что делает каждый файл:
- `01_catalog_schema.sql` создает и выравнивает `categories` и `products`.
- `02_orders_schema.sql` создает и выравнивает `orders` и `order_items`.
- `03_public_policies.sql` включает временные public policies для базового этапа без auth.
- `04_product_images_storage.sql` создает bucket `product-images` и policies для Storage.
- `05_auth_roles.sql` создает `profiles`, helper `is_admin()` и sync профиля с `auth.users`.
- `06_admin_policies.sql` заменяет временные public policies на admin-aware правила.
- `07_admin_storage_policies.sql` оставляет публичное чтение картинок, но upload/delete делает admin-only.
- `08_guest_checkout_rpc.sql` добавляет RPC для оформления заказа гостем без публичного доступа на чтение `orders`.

Важно:
- Скрипты написаны как повторно запускаемые, чтобы не бояться повторного `Run`.
- Если проект разворачивается с нуля под текущий этап, запускай все файлы `01`-`07` по порядку.
- После `05_auth_roles.sql` создай пользователя в `Supabase Auth -> Users`, затем назначь ему роль:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

- `03_public_policies.sql` и `04_product_images_storage.sql` нужны как промежуточная база; файлы `06` и `07` затем перезаписывают policies под admin auth.
- После `06_admin_policies.sql` запусти `08_guest_checkout_rpc.sql`, если checkout должен работать для гостей без логина.

Legacy-файлы в корне `supabase/` пока оставлены для совместимости, но для новых установок ориентируйся на `supabase/setup/`.
