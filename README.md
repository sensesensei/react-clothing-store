# Parfum

Интернет-магазин на React с витриной, корзиной, оформлением заказа и admin-панелью для товаров и заказов.

## Stack

- React 19
- React Router 7
- Supabase
- CSS modules-free styling with feature-based structure

## Scripts

В каталоге проекта доступны команды:

- `npm start` — запуск dev-сервера
- `npm run build` — production build
- `npm test` — тесты

Если PowerShell блокирует `npm.ps1`, запускай команды через `cmd /c`, например:

```powershell
cmd /c npm run build
```

## Env

Для работы с Supabase нужны переменные в `.env.local`:

```env
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

## Supabase Setup

Актуальный setup лежит в `supabase/README.md`.

Основной порядок запуска SQL:

1. `supabase/setup/01_catalog_schema.sql`
2. `supabase/setup/02_orders_schema.sql`
3. `supabase/setup/03_public_policies.sql`
4. `supabase/setup/04_product_images_storage.sql`
5. `supabase/setup/05_auth_roles.sql`
6. `supabase/setup/06_admin_policies.sql`
7. `supabase/setup/07_admin_storage_policies.sql`

## Current State

Сейчас в проекте уже есть:

- публичная витрина товаров
- каталог и карточка товара
- корзина
- checkout с сохранением заказов в Supabase
- admin-панель категорий
- admin-панель товаров
- admin-панель заказов
- вход администратора через Supabase Auth
- защита `/admin` и admin-only policies для редактирования данных

Текущий крупный этап: auth, роли и защита `/admin`.
