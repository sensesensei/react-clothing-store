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

function mergeProductsWithCategories(products, categories) {
  const categoriesMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  return products.map((product) => ({
    ...product,
    categories: categoriesMap.get(product.category_id) || null,
  }));
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

  return data ?? [];
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
