import { supabase } from '../../../services/supabase/client';
import {
  mergeProductsWithCategories,
  normalizeCategory,
  PRODUCT_DB_SELECT,
  serializeProductForWrite,
} from '../model';

const CATEGORIES_SELECT = 'id, name, slug';
const PUBLIC_PRODUCTS_FILTER = 'is_active.eq.true,is_active.is.null';

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

async function mergeProductsWithResolvedCategories(products) {
  const normalizedProducts = products ?? [];
  const categoryIds = [
    ...new Set(normalizedProducts.map((product) => product.category_id).filter(Boolean)),
  ];
  const categories = await getCategoriesByIds(categoryIds);

  return mergeProductsWithCategories(normalizedProducts, categories);
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
    .or(PUBLIC_PRODUCTS_FILTER)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return mergeProductsWithResolvedCategories(data);
}

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DB_SELECT)
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
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
    throw new Error(error.message);
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
    .select(PRODUCT_DB_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [createdProduct] = await mergeProductsWithResolvedCategories([data]);

  return createdProduct;
}

export async function updateProduct(productId, product) {
  const payload = serializeProductForWrite(product);
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', productId)
    .select(PRODUCT_DB_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [updatedProduct] = await mergeProductsWithResolvedCategories([data]);

  return updatedProduct;
}

export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw new Error(error.message);
  }
}
