import { supabase } from '../../../services/supabase/client';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

const PRODUCT_IMAGES_PUBLIC_PREFIX = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

function mapStorageErrorMessage(error, action = 'upload') {
  const message = String(error?.message || '').trim();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('bucket not found')) {
    return `Bucket "${PRODUCT_IMAGES_BUCKET}" не найден в Supabase Storage. Создай его в Storage или выполни SQL из файла supabase/setup/04_product_images_storage.sql.`;
  }

  if (
    normalizedMessage.includes('row level security')
    || normalizedMessage.includes('not allowed')
    || normalizedMessage.includes('unauthorized')
  ) {
    return `Нет доступа к bucket "${PRODUCT_IMAGES_BUCKET}". Проверь policies для storage.objects и роли anon/authenticated в Supabase.`;
  }

  if (message) {
    return message;
  }

  return action === 'delete'
    ? 'Не удалось удалить изображение из Supabase Storage.'
    : 'Не удалось загрузить изображение в Supabase Storage.';
}

function normalizeStorageSegment(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getFileExtension(file) {
  const fileName = String(file?.name || '');
  const extension = fileName.includes('.')
    ? fileName.split('.').pop()
    : '';

  return normalizeStorageSegment(extension) || 'jpg';
}

function createImagePath(file, slug) {
  const baseName = normalizeStorageSegment(slug)
    || normalizeStorageSegment(String(file?.name || '').replace(/\.[^.]+$/, ''))
    || 'product-image';
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const extension = getFileExtension(file);

  return `products/${baseName}-${Date.now()}-${randomSuffix}.${extension}`;
}

function getManagedImagePath(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const imagePath = decodeURIComponent(parsedUrl.pathname);
    const prefixIndex = imagePath.indexOf(PRODUCT_IMAGES_PUBLIC_PREFIX);

    if (prefixIndex === -1) {
      return null;
    }

    return imagePath.slice(prefixIndex + PRODUCT_IMAGES_PUBLIC_PREFIX.length);
  } catch {
    return null;
  }
}

export async function uploadProductImage(file, options = {}) {
  const imagePath = createImagePath(file, options.slug);
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(imagePath, file, {
      cacheControl: '3600',
      contentType: file?.type || undefined,
      upsert: false,
    });

  if (error) {
    throw new Error(mapStorageErrorMessage(error, 'upload'));
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(imagePath);

  return {
    imagePath,
    imageUrl: data.publicUrl,
  };
}

export async function deleteManagedProductImage(imageUrl) {
  const imagePath = getManagedImagePath(imageUrl);

  if (!imagePath) {
    return false;
  }

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([imagePath]);

  if (error) {
    throw new Error(mapStorageErrorMessage(error, 'delete'));
  }

  return true;
}
