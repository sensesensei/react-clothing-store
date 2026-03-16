# Supabase Setup

Здесь лежит актуальный setup для проекта `Parfum`.

Основная папка для новых запусков:
- `supabase/setup/01_catalog_schema.sql`
- `supabase/setup/02_orders_schema.sql`
- `supabase/setup/03_public_policies.sql`
- `supabase/setup/04_product_images_storage.sql`

Запускай их в этом порядке через `Supabase -> SQL Editor`.

Что делает каждый файл:
- `01_catalog_schema.sql` создает и выравнивает `categories` и `products`.
- `02_orders_schema.sql` создает и выравнивает `orders` и `order_items`.
- `03_public_policies.sql` включает временные public policies для текущего этапа без auth.
- `04_product_images_storage.sql` создает bucket `product-images` и policies для Storage.

Важно:
- Скрипты написаны как повторно запускаемые, чтобы не бояться повторного `Run`.
- Пока админка работает без auth, policies намеренно открытые.
- Когда дойдем до ролей и защиты `/admin`, `03_public_policies.sql` нужно будет заменить на admin-only policies.

Legacy-файлы в корне `supabase/` пока оставлены для совместимости, но для новых установок ориентируйся на `supabase/setup/`.
