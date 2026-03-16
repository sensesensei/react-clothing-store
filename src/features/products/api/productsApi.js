import { supabase } from '../../../services/supabase/client';
import {
  mergeProductsWithCategories,
  normalizeCategory,
  PRODUCT_DB_SELECT,
  serializeProductForWrite,
} from '../model';

const CATEGORIES_SELECT = 'id, name, slug';
const PUBLIC_PRODUCTS_FILTER = 'is_active.eq.true,is_active.is.null';

function mapProductsApiErrorMessage(error, action = 'load') {
  const message = String(error?.message || '').trim();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('row-level security')) {
    if (action === 'create' || action === 'update' || action === 'delete' || action === 'admin-load') {
      return 'Управление товарами доступно только администратору. Выполни вход и проверь SQL из файла supabase/setup/06_admin_policies.sql.';
    }

    return 'Доступ к таблице products ограничен RLS. Проверь SQL из файла supabase/setup/06_admin_policies.sql.';
  }

  if (normalizedMessage.includes('null value in column "category_id"')) {
    return 'В базе category_id помечен как обязательный, а форма поддерживает товар без категории. Выполни SQL из файла supabase/setup/01_catalog_schema.sql или выбери категорию вручную.';
  }

  if (message) {
    return message;
  }

  switch (action) {
    case 'create':
      return 'Не удалось создать товар.';
    case 'update':
      return 'Не удалось сохранить товар.';
    case 'delete':
      return 'Не удалось удалить товар.';
    default:
      return 'Не удалось загрузить товары.';
  }
}

async function getCategoriesByIds(categoryIds) {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORIES_SELECT)
    .in('id', categoryIds);

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error));
  }

  return data ?? [];
}

async function mergeProductsWithResolvedCategories(products) {
  const normalizedProducts = products ?? [];
  const categoryIds = [
    ...new Set(normalizedProducts.map((product) => product.category_id).filter(Boolean)),
  ];
  const categories = await getCategoriesByIds(categoryIds);

  return mergeProductsWithCategories(normalizedProducts, categories);
}

async function getProductRowById(productId) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DB_SELECT)
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error));
  }

  return data ?? null;
}

async function getResolvedProductById(productId, actionLabel) {
  const productRow = await getProductRowById(productId);

  if (!productRow) {
    throw new Error(
      `Товар ${actionLabel}, но Supabase не вернул запись #${productId}. Проверь доступ SELECT/UPDATE для таблицы products.`,
    );
  }

  const [product] = await mergeProductsWithResolvedCategories([productRow]);

  return product;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORIES_SELECT)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error));
  }

  return (data ?? []).map(normalizeCategory);
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DB_SELECT)
    .or(PUBLIC_PRODUCTS_FILTER)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error));
  }

  return mergeProductsWithResolvedCategories(data);
}

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DB_SELECT)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error, 'admin-load'));
  }

  return mergeProductsWithResolvedCategories(data);
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DB_SELECT)
    .eq('slug', slug)
    .or(PUBLIC_PRODUCTS_FILTER)
    .maybeSingle();

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  const [product] = await mergeProductsWithResolvedCategories([data]);

  return product;
}

export async function createProduct(product) {
  const payload = serializeProductForWrite(product);
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error, 'create'));
  }

  if (!data?.id) {
    throw new Error(
      'Товар создан, но Supabase не вернул id новой записи. Проверь доступ SELECT для таблицы products.',
    );
  }

  return getResolvedProductById(data.id, 'создан');
}

export async function updateProduct(productId, product) {
  const payload = serializeProductForWrite(product);
  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', productId);

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error, 'update'));
  }

  return getResolvedProductById(productId, 'сохранен');
}

export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw new Error(mapProductsApiErrorMessage(error, 'delete'));
  }
}
