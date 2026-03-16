import { useEffect, useMemo, useState } from 'react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiSaveLine,
  RiSearchLine,
} from 'react-icons/ri';
import {
  createProduct,
  deleteProduct,
  deleteManagedProductImage,
  getAdminProducts,
  getCategories,
  PRODUCT_IMAGES_BUCKET,
  uploadProductImage,
  updateProduct,
} from '../../features/products/api';
import { formatPrice } from '../../features/products/lib/productUtils';
import {
  createEmptyProduct,
  getEditableProductValues,
  PRODUCT_FIELDS,
  validateProductModel,
} from '../../features/products/model';
import { Button, EmptyState, ErrorState, Loader } from '../../shared/ui';
import './AdminPage.css';
import './AdminProductsPage.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'hidden', label: 'Скрытые' },
];

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
const PRODUCT_SLUG_PATTERN = /^[A-Za-z0-9-]+$/;
const PRODUCT_SLUG_ERROR = 'Только латиница, цифры и дефис.';

function sortProductsById(products) {
  return [...products].sort((firstProduct, secondProduct) =>
    String(firstProduct.id).localeCompare(String(secondProduct.id), 'ru', {
      numeric: true,
    }));
}

function createProductDraft(product = {}) {
  const editableValues = getEditableProductValues(createEmptyProduct(product));

  return {
    ...editableValues,
    price: editableValues.price ?? '',
    oldPrice: editableValues.oldPrice ?? '',
    stock: editableValues.stock ?? 0,
    categoryId: editableValues.categoryId ?? '',
    sizesText: editableValues.sizes.join(', '),
  };
}

function buildProductPayload(draft) {
  return createEmptyProduct({
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    price: draft.price,
    oldPrice: draft.oldPrice,
    imageUrl: draft.imageUrl,
    sizes: draft.sizesText,
    categoryId: draft.categoryId || null,
    stock: draft.stock,
    isActive: draft.isActive,
  });
}

function slugifyValue(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function formatCreatedAt(value) {
  if (!value) {
    return 'Дата не указана';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return dateFormatter.format(date);
}

function validateProductImageFile(file) {
  if (!file) {
    return 'Выбери файл изображения.';
  }

  if (!String(file.type || '').startsWith('image/')) {
    return 'Можно загружать только изображения.';
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return 'Размер файла не должен превышать 5 МБ.';
  }

  return '';
}

function getSlugValidationError(value) {
  if (!value || PRODUCT_SLUG_PATTERN.test(value)) {
    return '';
  }

  return PRODUCT_SLUG_ERROR;
}

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [draft, setDraft] = useState(() => createProductDraft());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadMessage, setImageUploadMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAdminProductsPage() {
      try {
        setLoading(true);
        setError('');

        const [productsData, categoriesData] = await Promise.all([
          getAdminProducts(),
          getCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        const sortedProducts = sortProductsById(productsData);
        const firstProduct = sortedProducts[0] || null;

        setProducts(sortedProducts);
        setCategories(categoriesData);
        setSelectedProductId(firstProduct?.id ?? null);
        setDraft(firstProduct ? createProductDraft(firstProduct) : createProductDraft());
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Не удалось загрузить товары.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAdminProductsPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (statusFilter === 'active' && !product.isActive) {
        return false;
      }

      if (statusFilter === 'hidden' && product.isActive) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const categoryName = product.category?.name?.toLowerCase() || '';

      return [
        product.title?.toLowerCase() || '',
        product.slug?.toLowerCase() || '',
        categoryName,
      ].some((value) => value.includes(normalizedSearchQuery));
    });
  }, [products, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length;

    return {
      total: products.length,
      active: activeProducts,
      hidden: products.length - activeProducts,
    };
  }, [products]);

  function resetFeedback() {
    setSubmitError('');
    setSubmitMessage('');
  }

  function resetImageUploadFeedback() {
    setImageUploadError('');
    setImageUploadMessage('');
  }

  async function discardTransientDraftImage(nextImageUrl = '') {
    const currentDraftImageUrl = draft.imageUrl;
    const persistedImageUrl = selectedProduct?.imageUrl || '';

    if (
      !currentDraftImageUrl
      || currentDraftImageUrl === persistedImageUrl
      || currentDraftImageUrl === nextImageUrl
    ) {
      return;
    }

    try {
      await deleteManagedProductImage(currentDraftImageUrl);
    } catch {
      // Ignore storage cleanup failures for transient uploads.
    }
  }

  async function openCreateForm() {
    await discardTransientDraftImage();
    setSelectedProductId(null);
    setDraft(createProductDraft());
    setFormErrors({});
    resetFeedback();
    resetImageUploadFeedback();
  }

  async function openEditForm(product) {
    await discardTransientDraftImage(product.imageUrl || '');
    setSelectedProductId(product.id);
    setDraft(createProductDraft(product));
    setFormErrors({});
    resetFeedback();
    resetImageUploadFeedback();
  }

  function updateDraftField(fieldName, fieldValue) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: fieldValue,
    }));

    setFormErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }

  function handleFieldChange(event) {
    const { checked, name, type, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    updateDraftField(name, nextValue);

    if (name === 'slug') {
      const slugError = getSlugValidationError(nextValue);

      setFormErrors((currentErrors) => {
        if (!slugError) {
          if (!currentErrors.slug) {
            return currentErrors;
          }

          const nextErrors = { ...currentErrors };
          delete nextErrors.slug;
          return nextErrors;
        }

        return {
          ...currentErrors,
          slug: slugError,
        };
      });
    }
  }

  async function handleImageUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files?.[0];
    fileInput.value = '';

    if (!file) {
      return;
    }

    const validationError = validateProductImageFile(file);

    if (validationError) {
      setImageUploadError(validationError);
      setImageUploadMessage('');
      return;
    }

    const slugError = getSlugValidationError(draft.slug);

    if (!draft.slug || slugError) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        slug: slugError || PRODUCT_SLUG_ERROR,
      }));
      setImageUploadError('Перед загрузкой фото укажи корректный slug товара.');
      setImageUploadMessage('');
      return;
    }

    const previousDraftImageUrl = draft.imageUrl;
    const persistedImageUrl = selectedProduct?.imageUrl || '';

    try {
      setIsUploadingImage(true);
      setImageUploadError('');
      setImageUploadMessage('');

      const uploadedImage = await uploadProductImage(file, {
        slug: slugifyValue(draft.slug),
      });

      if (
        previousDraftImageUrl
        && previousDraftImageUrl !== persistedImageUrl
        && previousDraftImageUrl !== uploadedImage.imageUrl
      ) {
        try {
          await deleteManagedProductImage(previousDraftImageUrl);
        } catch {
          // Ignore cleanup failures for unsaved temporary uploads.
        }
      }

      updateDraftField('imageUrl', uploadedImage.imageUrl);
      setImageUploadMessage(`Фото загружено в bucket "${PRODUCT_IMAGES_BUCKET}".`);
      setSubmitError('');
    } catch (err) {
      setImageUploadError(err.message || 'Не удалось загрузить изображение.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleRefresh() {
    try {
      setLoading(true);
      setError('');
      resetFeedback();
      resetImageUploadFeedback();

      const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(),
        getCategories(),
      ]);
      const sortedProducts = sortProductsById(productsData);
      const nextSelectedProduct = sortedProducts.find(
        (product) => product.id === selectedProductId,
      ) || sortedProducts[0] || null;

      await discardTransientDraftImage(nextSelectedProduct?.imageUrl || '');

      setProducts(sortedProducts);
      setCategories(categoriesData);
      setSelectedProductId(nextSelectedProduct?.id ?? null);
      setDraft(
        nextSelectedProduct
          ? createProductDraft(nextSelectedProduct)
          : createProductDraft(),
      );
    } catch (err) {
      setError(err.message || 'Не удалось обновить список товаров.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const productPayload = buildProductPayload(draft);
    const validationErrors = validateProductModel(productPayload);
    const slugError = getSlugValidationError(productPayload.slug);

    if (slugError) {
      validationErrors.slug = slugError;
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitError('Проверь форму товара.');
      setSubmitMessage('');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitMessage('');

      const previousPersistedImageUrl = selectedProduct?.imageUrl || '';
      const savedProduct = selectedProduct
        ? await updateProduct(selectedProduct.id, productPayload)
        : await createProduct(productPayload);
      let nextSubmitMessage = selectedProduct ? 'Товар обновлён.' : 'Товар создан.';

      const nextProducts = selectedProduct
        ? products.map((product) =>
          product.id === savedProduct.id ? savedProduct : product)
        : [...products, savedProduct];

      const sortedProducts = sortProductsById(nextProducts);

      setProducts(sortedProducts);
      setSelectedProductId(savedProduct.id);
      setDraft(createProductDraft(savedProduct));
      setFormErrors({});
      resetImageUploadFeedback();

      if (
        previousPersistedImageUrl
        && previousPersistedImageUrl !== savedProduct.imageUrl
      ) {
        try {
          await deleteManagedProductImage(previousPersistedImageUrl);
        } catch {
          nextSubmitMessage = `${nextSubmitMessage} Старый файл в Storage удалить не удалось.`;
        }
      }

      setSubmitMessage(nextSubmitMessage);
    } catch (err) {
      setSubmitError(err.message || 'Не удалось сохранить товар.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedProduct) {
      return;
    }

    const confirmed = window.confirm(
      `Удалить товар "${selectedProduct.title}"? Это действие нельзя отменить.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setSubmitError('');
      setSubmitMessage('');

      const imageUrlsToDelete = [
        ...new Set([selectedProduct.imageUrl, draft.imageUrl].filter(Boolean)),
      ];

      await deleteProduct(selectedProduct.id);
      let nextSubmitMessage = 'Товар удалён.';

      for (const imageUrl of imageUrlsToDelete) {
        try {
          await deleteManagedProductImage(imageUrl);
        } catch {
          nextSubmitMessage = 'Товар удалён, но файл изображения в Storage удалить не удалось.';
          break;
        }
      }

      const nextProducts = products.filter(
        (product) => product.id !== selectedProduct.id,
      );
      const nextSelectedProduct = nextProducts[0] || null;

      setProducts(nextProducts);
      setSelectedProductId(nextSelectedProduct?.id ?? null);
      setDraft(
        nextSelectedProduct
          ? createProductDraft(nextSelectedProduct)
          : createProductDraft(),
      );
      setFormErrors({});
      resetImageUploadFeedback();
      setSubmitMessage(nextSubmitMessage);
    } catch (err) {
      setSubmitError(err.message || 'Не удалось удалить товар.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <Loader label="Загрузка раздела товаров..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <section className="admin-page">
      <div className="admin-page__hero">
        <div>
          <p className="admin-page__eyebrow">Products</p>
          <h2 className="admin-page__title">Управление товарами</h2>
          <p className="admin-page__description">
            Раздел уже рабочий: здесь можно смотреть список товаров, фильтровать
            их, создавать новые позиции, редактировать текущие и удалять лишние.
          </p>
        </div>

        <div className="admin-page__actions">
          <Button type="button" variant="primary" size="md" onClick={openCreateForm}>
            <RiAddLine size={16} aria-hidden="true" />
            <span>Новый товар</span>
          </Button>

          <button
            type="button"
            className="admin-products-action-button"
            onClick={handleRefresh}
          >
            <RiRefreshLine size={16} aria-hidden="true" />
            <span>Обновить</span>
          </button>

          <Button to="/admin" variant="primary" size="md">
            На dashboard
          </Button>
        </div>
      </div>

      <div className="admin-products-stats">
        <article className="admin-card admin-products-stat">
          <p className="admin-card__eyebrow">Всего</p>
          <p className="admin-card__value">{metrics.total}</p>
        </article>

        <article className="admin-card admin-products-stat">
          <p className="admin-card__eyebrow">Активных</p>
          <p className="admin-card__value">{metrics.active}</p>
        </article>

        <article className="admin-card admin-products-stat">
          <p className="admin-card__eyebrow">Скрытых</p>
          <p className="admin-card__value">{metrics.hidden}</p>
        </article>
      </div>

      <div className="admin-products-layout">
        <section className="admin-card admin-products-panel">
          <div className="admin-products-panel__head">
            <div>
              <p className="admin-card__eyebrow">Каталог в админке</p>
              <h3 className="admin-card__title">Список товаров</h3>
            </div>
            <p className="admin-products-panel__counter">
              Найдено: {filteredProducts.length}
            </p>
          </div>

          <label className="admin-products-search">
            <RiSearchLine size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по названию, slug или категории"
            />
          </label>

          <div className="admin-products-filters">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`admin-products-filter${statusFilter === filter.value ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="admin-products-list">
            {filteredProducts.length === 0 ? (
              <EmptyState
                compact
                title="Товары не найдены"
                message="Измени поиск, фильтр или создай новую позицию."
              />
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={`admin-products-item${selectedProductId === product.id ? ' is-active' : ''}`}
                  onClick={() => openEditForm(product)}
                >
                  <div className="admin-products-item__head">
                    <div>
                      <p className="admin-products-item__title">{product.title}</p>
                      <p className="admin-products-item__slug">/{product.slug}</p>
                    </div>
                    <span
                      className={`admin-status-badge${product.isActive ? ' is-active' : ' is-hidden'}`}
                    >
                      {product.isActive ? 'Активен' : 'Скрыт'}
                    </span>
                  </div>

                  <div className="admin-products-item__meta">
                    <span>{product.category?.name || 'Без категории'}</span>
                    <span>{formatPrice(product.price) || 'Без цены'}</span>
                    <span>Остаток: {product.stock}</span>
                  </div>

                  <div className="admin-products-item__footer">
                    <span>ID: {product.id}</span>
                    <span>{formatCreatedAt(product.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="admin-card admin-products-editor">
          <div className="admin-products-editor__head">
            <div>
              <p className="admin-card__eyebrow">
                {selectedProduct ? 'Редактирование' : 'Создание'}
              </p>
              <h3 className="admin-card__title">
                {selectedProduct ? selectedProduct.title : 'Новый товар'}
              </h3>
            </div>

            {selectedProduct ? (
              <span className="admin-products-editor__id">ID: {selectedProduct.id}</span>
            ) : (
              <span className="admin-products-editor__id">Новая запись</span>
            )}
          </div>

          <form className="admin-product-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-product-form__grid">
              <label className="admin-product-field">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.title.label} *
                </span>
                <input
                  type="text"
                  name="title"
                  value={draft.title}
                  onChange={handleFieldChange}
                  className={`admin-product-input${formErrors.title ? ' is-invalid' : ''}`}
                />
                {formErrors.title ? (
                  <span className="admin-product-field__error">{formErrors.title}</span>
                ) : null}
              </label>

              <label className="admin-product-field">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.categoryId.label}
                </span>
                <select
                  name="categoryId"
                  value={draft.categoryId}
                  onChange={handleFieldChange}
                  className="admin-product-input"
                >
                  <option value="">Без категории</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-product-field admin-product-field--span-2">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.slug.label} *
                </span>
                <input
                  type="text"
                  name="slug"
                  value={draft.slug}
                  onChange={handleFieldChange}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  className={`admin-product-input${formErrors.slug ? ' is-invalid' : ''}`}
                />
                <span className="admin-product-field__hint">
                  Только латиница, цифры и дефис.
                </span>
                {formErrors.slug ? (
                  <span className="admin-product-field__error">{formErrors.slug}</span>
                ) : null}
              </label>

              <label className="admin-product-field">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.price.label} *
                </span>
                <input
                  type="number"
                  name="price"
                  value={draft.price}
                  onChange={handleFieldChange}
                  min="0"
                  step="1"
                  className={`admin-product-input${formErrors.price ? ' is-invalid' : ''}`}
                />
                {formErrors.price ? (
                  <span className="admin-product-field__error">{formErrors.price}</span>
                ) : null}
              </label>

              <label className="admin-product-field">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.oldPrice.label}
                </span>
                <input
                  type="number"
                  name="oldPrice"
                  value={draft.oldPrice}
                  onChange={handleFieldChange}
                  min="0"
                  step="1"
                  className={`admin-product-input${formErrors.oldPrice ? ' is-invalid' : ''}`}
                />
                {formErrors.oldPrice ? (
                  <span className="admin-product-field__error">{formErrors.oldPrice}</span>
                ) : null}
              </label>

              <label className="admin-product-field">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.stock.label}
                </span>
                <input
                  type="number"
                  name="stock"
                  value={draft.stock}
                  onChange={handleFieldChange}
                  min="0"
                  step="1"
                  className={`admin-product-input${formErrors.stock ? ' is-invalid' : ''}`}
                />
                {formErrors.stock ? (
                  <span className="admin-product-field__error">{formErrors.stock}</span>
                ) : null}
              </label>

              <div className="admin-product-field">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.isActive.label}
                </span>
                <label className="admin-product-toggle">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={draft.isActive}
                    onChange={handleFieldChange}
                  />
                  <span>
                    {draft.isActive
                      ? 'Да, показываем на витрине'
                      : 'Нет, скрыт с витрины'}
                  </span>
                </label>
              </div>

              <label className="admin-product-field admin-product-field--span-2">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.imageUrl.label} *
                </span>
                <input
                  type="text"
                  name="imageUrl"
                  value={draft.imageUrl}
                  onChange={handleFieldChange}
                  className={`admin-product-input${formErrors.imageUrl ? ' is-invalid' : ''}`}
                  placeholder="https://..."
                />
                {formErrors.imageUrl ? (
                  <span className="admin-product-field__error">{formErrors.imageUrl}</span>
                ) : null}
                <div className="admin-product-upload">
                  <label className="admin-product-upload__control">
                    <span className="admin-product-upload__button">
                      {isUploadingImage ? 'Загружаем...' : 'Загрузить фото'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                  <span className="admin-product-field__hint">
                    Загрузка идет в Supabase Storage bucket{' '}
                    <strong>{PRODUCT_IMAGES_BUCKET}</strong>. Форматы: изображения,
                    до 5 МБ.
                  </span>
                </div>
                {imageUploadError ? (
                  <span className="admin-product-field__error">{imageUploadError}</span>
                ) : null}
                {imageUploadMessage ? (
                  <span className="admin-product-upload__message">{imageUploadMessage}</span>
                ) : null}
              </label>

              <label className="admin-product-field admin-product-field--span-2">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.sizes.label}
                </span>
                <input
                  type="text"
                  name="sizesText"
                  value={draft.sizesText}
                  onChange={handleFieldChange}
                  className="admin-product-input"
                  placeholder="50 ml, 100 ml, travel"
                />
                <span className="admin-product-field__hint">
                  Размеры указываются через запятую.
                </span>
              </label>

              <label className="admin-product-field admin-product-field--span-2">
                <span className="admin-product-field__label">
                  {PRODUCT_FIELDS.description.label}
                </span>
                <textarea
                  name="description"
                  value={draft.description}
                  onChange={handleFieldChange}
                  className="admin-product-input admin-product-textarea"
                  rows={6}
                />
              </label>
            </div>

            {draft.imageUrl ? (
              <div className="admin-product-preview">
                <div className="admin-product-preview__media">
                  <img src={draft.imageUrl} alt={draft.title || 'Предпросмотр товара'} />
                </div>
                <div className="admin-product-preview__content">
                  <p className="admin-card__eyebrow">Предпросмотр</p>
                  <p className="admin-product-preview__title">
                    {draft.title || 'Название товара'}
                  </p>
                  <p className="admin-product-preview__text">
                    {draft.slug ? `/${draft.slug}` : 'Slug появится здесь'}
                  </p>
                  <p className="admin-product-preview__text">
                    {draft.price ? formatPrice(draft.price) : 'Цена не указана'}
                  </p>
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div className="admin-products-feedback is-error" role="alert">
                {submitError}
              </div>
            ) : null}

            {submitMessage ? (
              <div className="admin-products-feedback is-success">
                {submitMessage}
              </div>
            ) : null}

            <div className="admin-product-form__actions">
              <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                <RiSaveLine size={16} aria-hidden="true" />
                <span>
                  {isSubmitting
                    ? 'Сохраняем...'
                    : selectedProduct
                      ? 'Сохранить товар'
                      : 'Создать товар'}
                </span>
              </Button>

              <button
                type="button"
                className="admin-products-action-button"
                onClick={openCreateForm}
              >
                <RiAddLine size={16} aria-hidden="true" />
                <span>Очистить форму</span>
              </button>

              {selectedProduct ? (
                <button
                  type="button"
                  className="admin-products-action-button is-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <RiDeleteBinLine size={16} aria-hidden="true" />
                  <span>{isDeleting ? 'Удаляем...' : 'Удалить товар'}</span>
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default AdminProductsPage;

