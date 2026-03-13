import {
  normalizeProductCategory,
  normalizeProductModel,
  normalizeProductSizes,
} from './productSchema';

export function normalizeCategory(category) {
  return normalizeProductCategory(category);
}

export function normalizeSizes(sizes) {
  return normalizeProductSizes(sizes);
}

export function normalizeProduct(product, category) {
  return normalizeProductModel({
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    oldPrice: product.old_price,
    imageUrl: product.image_url,
    sizes: product.sizes,
    categoryId: product.category_id,
    category,
    stock: product.stock,
    isActive: product.is_active,
    createdAt: product.created_at,
  });
}

export function mergeProductsWithCategories(products, categories) {
  const categoriesMap = new Map(
    categories.map((category) => [category.id, normalizeCategory(category)]),
  );

  return products.map((product) =>
    normalizeProduct(product, categoriesMap.get(product.category_id) || null));
}
