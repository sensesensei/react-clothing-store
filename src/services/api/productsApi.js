import { supabase } from '../supabase/client';

const PRODUCTS_SELECT = `
  id,
  title,
  slug,
  description,
  price,
  old_price,
  image_url,
  sizes,
  category_id,
  stock,
  is_active,
  created_at
`;

const CATEGORIES_SELECT = 'id, name, slug';

function normalizeCategory(category) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}

function normalizeSizes(sizes) {
  if (Array.isArray(sizes)) {
    return sizes
      .map((size) => String(size).trim())
      .filter(Boolean);
  }

  if (typeof sizes === 'string') {
    return sizes
      .split(',')
      .map((size) => size.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProduct(product, category) {
  const normalizedCategory = normalizeCategory(category);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    oldPrice: product.old_price,
    imageUrl: product.image_url,
    sizes: normalizeSizes(product.sizes),
    categoryId: product.category_id,
    category: normalizedCategory,
    stock: product.stock,
    isActive: Boolean(product.is_active),
    createdAt: product.created_at,
  };
}

function mergeProductsWithCategories(products, categories) {
  const categoriesMap = new Map(
    categories.map((category) => [category.id, normalizeCategory(category)]),
  );

  return products.map((product) =>
    normalizeProduct(product, categoriesMap.get(product.category_id) || null));
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
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORIES_SELECT)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeCategory);
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const products = data ?? [];
  const categoryIds = [...new Set(products.map((product) => product.category_id).filter(Boolean))];
  const categories = await getCategoriesByIds(categoryIds);

  return mergeProductsWithCategories(products, categories);
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const categories = data.category_id
    ? await getCategoriesByIds([data.category_id])
    : [];

  return mergeProductsWithCategories([data], categories)[0];
}
