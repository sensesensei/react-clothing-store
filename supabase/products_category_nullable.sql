-- The current admin UI allows saving products without a category.
-- This migration aligns the database schema with that behavior.

alter table public.products
  alter column category_id drop not null;
