import { useEffect, useMemo, useState } from 'react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiSaveLine,
  RiSearchLine,
} from 'react-icons/ri';
import {
  createCategory,
  deleteCategory,
  getAdminProducts,
  getCategories,
  updateCategory,
} from '../../features/products/api';
import {
  CATEGORY_FIELDS,
  createEmptyCategory,
  getEditableCategoryValues,
  validateCategoryModel,
} from '../../features/products/model';
import { Button, EmptyState, ErrorState, Loader } from '../../shared/ui';
import './AdminPage.css';
import './AdminCategoriesPage.css';

const CATEGORY_SLUG_PATTERN = /^[A-Za-z0-9-]+$/;
const CATEGORY_SLUG_HINT = 'Только латиница, цифры и дефис.';

function sortCategories(categories) {
  return [...categories].sort((firstCategory, secondCategory) =>
    firstCategory.name.localeCompare(secondCategory.name, 'ru', { sensitivity: 'base' }));
}

function createCategoryDraft(category = {}) {
  return getEditableCategoryValues(createEmptyCategory(category));
}

function buildCategoryPayload(draft) {
  return createEmptyCategory({
    name: draft.name,
    slug: draft.slug,
  });
}

function getSlugValidationError(value) {
  if (!value || CATEGORY_SLUG_PATTERN.test(value)) {
    return '';
  }

  return CATEGORY_SLUG_HINT;
}

function getLinkedProductsCount(products, categoryId) {
  if (!categoryId) {
    return 0;
  }

  return products.filter((product) => product.categoryId === categoryId).length;
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [draft, setDraft] = useState(() => createCategoryDraft());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCategoriesPage() {
      try {
        setLoading(true);
        setError('');

        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getAdminProducts(),
        ]);

        if (!isMounted) {
          return;
        }

        const sortedCategories = sortCategories(categoriesData);
        const firstCategory = sortedCategories[0] || null;

        setCategories(sortedCategories);
        setProducts(productsData);
        setSelectedCategoryId(firstCategory?.id ?? null);
        setDraft(firstCategory ? createCategoryDraft(firstCategory) : createCategoryDraft());
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Не удалось загрузить категории.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategoriesPage();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        category.name?.toLowerCase() || '',
        category.slug?.toLowerCase() || '',
      ].some((value) => value.includes(normalizedQuery));
    });
  }, [categories, searchQuery]);

  const metrics = useMemo(() => {
    const categoriesWithProducts = categories.filter(
      (category) => getLinkedProductsCount(products, category.id) > 0,
    ).length;

    return {
      total: categories.length,
      linked: categoriesWithProducts,
      empty: categories.length - categoriesWithProducts,
    };
  }, [categories, products]);

  function resetFeedback() {
    setSubmitError('');
    setSubmitMessage('');
  }

  function openCreateForm() {
    setSelectedCategoryId(null);
    setDraft(createCategoryDraft());
    setFormErrors({});
    resetFeedback();
  }

  function openEditForm(category) {
    setSelectedCategoryId(category.id);
    setDraft(createCategoryDraft(category));
    setFormErrors({});
    resetFeedback();
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
    const { name, value } = event.target;

    updateDraftField(name, value);

    if (name === 'slug') {
      const slugError = getSlugValidationError(value);

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

  async function handleRefresh() {
    try {
      setLoading(true);
      setError('');
      resetFeedback();

      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getAdminProducts(),
      ]);
      const sortedCategories = sortCategories(categoriesData);
      const nextSelectedCategory = sortedCategories.find(
        (category) => category.id === selectedCategoryId,
      ) || sortedCategories[0] || null;

      setCategories(sortedCategories);
      setProducts(productsData);
      setSelectedCategoryId(nextSelectedCategory?.id ?? null);
      setDraft(
        nextSelectedCategory
          ? createCategoryDraft(nextSelectedCategory)
          : createCategoryDraft(),
      );
      setFormErrors({});
    } catch (err) {
      setError(err.message || 'Не удалось обновить список категорий.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const categoryPayload = buildCategoryPayload(draft);
    const validationErrors = validateCategoryModel(categoryPayload);
    const slugError = getSlugValidationError(categoryPayload.slug);

    if (slugError) {
      validationErrors.slug = slugError;
    }

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitError('Проверь форму категории.');
      setSubmitMessage('');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitMessage('');

      const savedCategory = selectedCategory
        ? await updateCategory(selectedCategory.id, categoryPayload)
        : await createCategory(categoryPayload);
      const nextSubmitMessage = selectedCategory
        ? 'Категория обновлена.'
        : 'Категория создана.';

      const nextCategories = selectedCategory
        ? categories.map((category) =>
          category.id === savedCategory.id ? savedCategory : category)
        : [...categories, savedCategory];
      const sortedCategories = sortCategories(nextCategories);

      setCategories(sortedCategories);
      setSelectedCategoryId(savedCategory.id);
      setDraft(createCategoryDraft(savedCategory));
      setFormErrors({});
      setSubmitMessage(nextSubmitMessage);
    } catch (err) {
      setSubmitError(err.message || 'Не удалось сохранить категорию.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedCategory) {
      return;
    }

    const linkedProductsCount = getLinkedProductsCount(products, selectedCategory.id);
    const confirmationMessage = linkedProductsCount > 0
      ? `Удалить категорию "${selectedCategory.name}"? У ${linkedProductsCount} товаров категория станет пустой.`
      : `Удалить категорию "${selectedCategory.name}"? Это действие нельзя отменить.`;
    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setSubmitError('');
      setSubmitMessage('');

      await deleteCategory(selectedCategory.id);

      const nextCategories = categories.filter((category) => category.id !== selectedCategory.id);
      const nextSelectedCategory = nextCategories[0] || null;

      setCategories(nextCategories);
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.categoryId === selectedCategory.id
            ? { ...product, categoryId: null, category: null }
            : product));
      setSelectedCategoryId(nextSelectedCategory?.id ?? null);
      setDraft(
        nextSelectedCategory
          ? createCategoryDraft(nextSelectedCategory)
          : createCategoryDraft(),
      );
      setFormErrors({});
      setSubmitMessage(
        linkedProductsCount > 0
          ? 'Категория удалена. У привязанных товаров категория очищена.'
          : 'Категория удалена.',
      );
    } catch (err) {
      setSubmitError(err.message || 'Не удалось удалить категорию.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <Loader label="Загрузка раздела категорий..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <section className="admin-page">
      <div className="admin-page__hero">
        <div>
          <p className="admin-page__eyebrow">Categories</p>
          <h2 className="admin-page__title">Управление категориями</h2>
          <p className="admin-page__description">
            Здесь можно поддерживать структуру каталога: создавать категории,
            обновлять slug и удалять лишние разделы без ручных правок в базе.
          </p>
        </div>

        <div className="admin-page__actions">
          <Button type="button" variant="primary" size="md" onClick={openCreateForm}>
            <RiAddLine size={16} aria-hidden="true" />
            <span>Новая категория</span>
          </Button>

          <button
            type="button"
            className="admin-categories-action-button"
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

      <div className="admin-categories-stats">
        <article className="admin-card admin-categories-stat">
          <p className="admin-card__eyebrow">Всего</p>
          <p className="admin-card__value">{metrics.total}</p>
        </article>

        <article className="admin-card admin-categories-stat">
          <p className="admin-card__eyebrow">С товарами</p>
          <p className="admin-card__value">{metrics.linked}</p>
        </article>

        <article className="admin-card admin-categories-stat">
          <p className="admin-card__eyebrow">Пустых</p>
          <p className="admin-card__value">{metrics.empty}</p>
        </article>
      </div>

      <div className="admin-categories-layout">
        <section className="admin-card admin-categories-panel">
          <div className="admin-categories-panel__head">
            <div>
              <p className="admin-card__eyebrow">Структура каталога</p>
              <h3 className="admin-card__title">Список категорий</h3>
            </div>
            <p className="admin-categories-panel__counter">
              Найдено: {filteredCategories.length}
            </p>
          </div>

          <label className="admin-categories-search">
            <RiSearchLine size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по названию или slug"
            />
          </label>

          <div className="admin-categories-list">
            {filteredCategories.length === 0 ? (
              <EmptyState
                compact
                title="Категории не найдены"
                message="Измени поиск или создай новую категорию."
              />
            ) : (
              filteredCategories.map((category) => {
                const linkedProductsCount = getLinkedProductsCount(products, category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`admin-categories-item${selectedCategoryId === category.id ? ' is-active' : ''}`}
                    onClick={() => openEditForm(category)}
                  >
                    <div className="admin-categories-item__head">
                      <div>
                        <p className="admin-categories-item__title">{category.name}</p>
                        <p className="admin-categories-item__slug">/{category.slug}</p>
                      </div>
                      <span className="admin-categories-item__badge">
                        {linkedProductsCount} тов.
                      </span>
                    </div>

                    <div className="admin-categories-item__footer">
                      <span>ID: {category.id}</span>
                      <span>
                        {linkedProductsCount > 0 ? 'Используется в товарах' : 'Пока не используется'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="admin-card admin-categories-editor">
          <div className="admin-categories-editor__head">
            <div>
              <p className="admin-card__eyebrow">
                {selectedCategory ? 'Редактирование' : 'Создание'}
              </p>
              <h3 className="admin-card__title">
                {selectedCategory ? selectedCategory.name : 'Новая категория'}
              </h3>
            </div>

            {selectedCategory ? (
              <span className="admin-categories-editor__id">ID: {selectedCategory.id}</span>
            ) : (
              <span className="admin-categories-editor__id">Новая запись</span>
            )}
          </div>

          <form className="admin-category-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-category-form__grid">
              <label className="admin-category-field">
                <span className="admin-category-field__label">
                  {CATEGORY_FIELDS.name.label} *
                </span>
                <input
                  type="text"
                  name="name"
                  value={draft.name}
                  onChange={handleFieldChange}
                  className={`admin-category-input${formErrors.name ? ' is-invalid' : ''}`}
                />
                {formErrors.name ? (
                  <span className="admin-category-field__error">{formErrors.name}</span>
                ) : null}
              </label>

              <label className="admin-category-field">
                <span className="admin-category-field__label">
                  {CATEGORY_FIELDS.slug.label} *
                </span>
                <input
                  type="text"
                  name="slug"
                  value={draft.slug}
                  onChange={handleFieldChange}
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  className={`admin-category-input${formErrors.slug ? ' is-invalid' : ''}`}
                />
                <span className="admin-category-field__hint">
                  {CATEGORY_SLUG_HINT}
                </span>
                {formErrors.slug ? (
                  <span className="admin-category-field__error">{formErrors.slug}</span>
                ) : null}
              </label>
            </div>

            {selectedCategory ? (
              <div className="admin-category-summary">
                <div>
                  <p className="admin-card__eyebrow">Связанные товары</p>
                  <p className="admin-category-summary__value">
                    {getLinkedProductsCount(products, selectedCategory.id)}
                  </p>
                </div>
                <p className="admin-category-summary__text">
                  При удалении категории товары останутся в каталоге, но поле категории
                  у них станет пустым.
                </p>
              </div>
            ) : null}

            {submitError ? (
              <div className="admin-categories-feedback is-error" role="alert">
                {submitError}
              </div>
            ) : null}

            {submitMessage ? (
              <div className="admin-categories-feedback is-success">
                {submitMessage}
              </div>
            ) : null}

            <div className="admin-category-form__actions">
              <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                <RiSaveLine size={16} aria-hidden="true" />
                <span>
                  {isSubmitting
                    ? 'Сохраняем...'
                    : selectedCategory
                      ? 'Сохранить категорию'
                      : 'Создать категорию'}
                </span>
              </Button>

              <button
                type="button"
                className="admin-categories-action-button"
                onClick={openCreateForm}
              >
                <RiAddLine size={16} aria-hidden="true" />
                <span>Очистить форму</span>
              </button>

              {selectedCategory ? (
                <button
                  type="button"
                  className="admin-categories-action-button is-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <RiDeleteBinLine size={16} aria-hidden="true" />
                  <span>{isDeleting ? 'Удаляем...' : 'Удалить категорию'}</span>
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default AdminCategoriesPage;
