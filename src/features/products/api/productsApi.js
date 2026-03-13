import { supabase } from '../../../services/supabase/client';
import {
  mergeProductsWithCategories,
  normalizeCategory,
  PRODUCT_DB_SELECT,
} from '../model';

const CATEGORIES_SELECT = 'id, name, slug';

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
    .select(PRODUCT_DB_SELECT)
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
    .select(PRODUCT_DB_SELECT)
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
