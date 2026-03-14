import { useEffect, useMemo, useState } from 'react';
import {
  RiRefreshLine,
  RiSearchLine,
  RiShoppingBag3Line,
  RiTimeLine,
} from 'react-icons/ri';
import { getAdminOrders, updateOrderStatus } from '../../features/orders/api';
import {
  getOrderStatusMeta,
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
} from '../../features/orders/model';
import { formatPrice } from '../../features/products/lib/productUtils';
import { Button, EmptyState, ErrorState, Loader } from '../../shared/ui';
import './AdminPage.css';
import './AdminOrdersPage.css';

const ORDER_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: ORDER_STATUS.NEW, label: 'Новые' },
  { value: ORDER_STATUS.PROCESSING, label: 'В работе' },
  { value: ORDER_STATUS.COMPLETED, label: 'Завершённые' },
  { value: ORDER_STATUS.CANCELLED, label: 'Отменённые' },
];

const orderDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatOrderDate(value) {
  if (!value) {
    return 'Дата не указана';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return orderDateFormatter.format(date);
}

function buildOrderAddress(order) {
  return [
    order.city,
    order.street ? `ул. ${order.street}` : '',
    order.house ? `д. ${order.house}` : '',
    order.entrance ? `под. ${order.entrance}` : '',
    order.floor ? `эт. ${order.floor}` : '',
    order.apartmentOffice ? `кв./офис ${order.apartmentOffice}` : '',
  ]
    .filter(Boolean)
    .join(', ');
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError('');

        const ordersData = await getAdminOrders();

        if (!isMounted) {
          return;
        }

        setOrders(ordersData);
        setSelectedOrderId(ordersData[0]?.id ?? null);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Не удалось загрузить заказы.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      return [
        String(order.id),
        order.customerName.toLowerCase(),
        order.phone.toLowerCase(),
        order.email?.toLowerCase() || '',
        order.city.toLowerCase(),
      ].some((value) => value.includes(normalizedSearchQuery));
    });
  }, [orders, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        result.total += 1;
        result.revenue += order.totalAmount;

        if (order.status === ORDER_STATUS.NEW) {
          result.newCount += 1;
        }

        if (order.status === ORDER_STATUS.PROCESSING) {
          result.processingCount += 1;
        }

        return result;
      },
      {
        total: 0,
        newCount: 0,
        processingCount: 0,
        revenue: 0,
      },
    );
  }, [orders]);

  function resetStatusFeedback() {
    setStatusMessage('');
    setStatusError('');
  }

  async function handleRefresh() {
    try {
      setLoading(true);
      setError('');
      resetStatusFeedback();

      const ordersData = await getAdminOrders();
      const nextSelectedOrder = ordersData.find(
        (order) => order.id === selectedOrderId,
      ) || ordersData[0] || null;

      setOrders(ordersData);
      setSelectedOrderId(nextSelectedOrder?.id ?? null);
    } catch (err) {
      setError(err.message || 'Не удалось обновить заказы.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!selectedOrder || selectedOrder.status === nextStatus) {
      return;
    }

    try {
      setUpdatingStatus(nextStatus);
      setStatusError('');
      setStatusMessage('');

      const updatedOrder = await updateOrderStatus(selectedOrder.id, nextStatus);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order));
      setStatusMessage(`Статус заказа #${updatedOrder.id} обновлён.`);
    } catch (err) {
      setStatusError(err.message || 'Не удалось обновить статус заказа.');
    } finally {
      setUpdatingStatus('');
    }
  }

  if (loading) {
    return <Loader label="Загрузка раздела заказов..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <section className="admin-page">
      <div className="admin-page__hero">
        <div>
          <p className="admin-page__eyebrow">Orders</p>
          <h2 className="admin-page__title">Управление заказами</h2>
          <p className="admin-page__description">
            Здесь уже можно смотреть заказы, открывать их состав, проверять
            контакты и переводить заказ между статусами.
          </p>
        </div>

        <div className="admin-page__actions">
          <button
            type="button"
            className="admin-orders-action-button"
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

      <div className="admin-orders-stats">
        <article className="admin-card admin-orders-stat">
          <p className="admin-card__eyebrow">Всего заказов</p>
          <p className="admin-card__value">{metrics.total}</p>
        </article>

        <article className="admin-card admin-orders-stat">
          <p className="admin-card__eyebrow">Новых</p>
          <p className="admin-card__value">{metrics.newCount}</p>
        </article>

        <article className="admin-card admin-orders-stat">
          <p className="admin-card__eyebrow">В работе</p>
          <p className="admin-card__value">{metrics.processingCount}</p>
        </article>

        <article className="admin-card admin-orders-stat">
          <p className="admin-card__eyebrow">Оборот</p>
          <p className="admin-card__value">{formatPrice(metrics.revenue) || '0 ₽'}</p>
        </article>
      </div>

      <div className="admin-orders-layout">
        <section className="admin-card admin-orders-panel">
          <div className="admin-orders-panel__head">
            <div>
              <p className="admin-card__eyebrow">Лента заказов</p>
              <h3 className="admin-card__title">Список заказов</h3>
            </div>
            <p className="admin-orders-panel__counter">
              Найдено: {filteredOrders.length}
            </p>
          </div>

          <label className="admin-orders-search">
            <RiSearchLine size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по имени, телефону, e-mail, городу или ID"
            />
          </label>

          <div className="admin-orders-filters">
            {ORDER_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`admin-orders-filter${statusFilter === filter.value ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="admin-orders-list">
            {filteredOrders.length === 0 ? (
              <EmptyState
                compact
                title="Заказы не найдены"
                message="Измени поиск или выбранный статус."
              />
            ) : (
              filteredOrders.map((order) => {
                const statusMeta = getOrderStatusMeta(order.status);

                return (
                  <button
                    key={order.id}
                    type="button"
                    className={`admin-orders-item${selectedOrderId === order.id ? ' is-active' : ''}`}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      resetStatusFeedback();
                    }}
                  >
                    <div className="admin-orders-item__head">
                      <div>
                        <p className="admin-orders-item__id">Заказ #{order.id}</p>
                        <p className="admin-orders-item__name">{order.customerName}</p>
                      </div>
                      <span className={`admin-order-status is-${statusMeta.tone}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="admin-orders-item__meta">
                      <span>{formatOrderDate(order.createdAt)}</span>
                      <span>{order.city}</span>
                    </div>

                    <div className="admin-orders-item__footer">
                      <span>{order.totalItems} шт.</span>
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="admin-card admin-order-details">
          {selectedOrder ? (
            <>
              <div className="admin-order-details__head">
                <div>
                  <p className="admin-card__eyebrow">Карточка заказа</p>
                  <h3 className="admin-card__title">Заказ #{selectedOrder.id}</h3>
                  <p className="admin-order-details__date">
                    {formatOrderDate(selectedOrder.createdAt)}
                  </p>
                </div>

                <div className="admin-order-details__status">
                  <RiTimeLine size={16} aria-hidden="true" />
                  <span>{getOrderStatusMeta(selectedOrder.status).label}</span>
                </div>
              </div>

              <div className="admin-order-details__status-list">
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    className={`admin-order-status-button${selectedOrder.status === status.value ? ' is-active' : ''}`}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={updatingStatus === status.value}
                  >
                    {updatingStatus === status.value ? 'Обновляем...' : status.label}
                  </button>
                ))}
              </div>

              {statusError ? (
                <div className="admin-orders-feedback is-error" role="alert">
                  {statusError}
                </div>
              ) : null}

              {statusMessage ? (
                <div className="admin-orders-feedback is-success">
                  {statusMessage}
                </div>
              ) : null}

              <div className="admin-order-summary-grid">
                <article className="admin-order-summary-card">
                  <p className="admin-card__eyebrow">Сумма</p>
                  <p className="admin-order-summary-card__value">
                    {formatPrice(selectedOrder.totalAmount)}
                  </p>
                  <p className="admin-order-summary-card__hint">
                    Товары: {formatPrice(selectedOrder.itemsAmount)} • Доставка:{' '}
                    {formatPrice(selectedOrder.deliveryPrice)}
                  </p>
                </article>

                <article className="admin-order-summary-card">
                  <p className="admin-card__eyebrow">Позиции</p>
                  <p className="admin-order-summary-card__value">
                    {selectedOrder.items.length}
                  </p>
                  <p className="admin-order-summary-card__hint">
                    Общее количество товаров: {selectedOrder.totalItems}
                  </p>
                </article>
              </div>

              <div className="admin-order-sections">
                <article className="admin-order-section">
                  <p className="admin-card__eyebrow">Контакты</p>
                  <div className="admin-order-info-list">
                    <div>
                      <span>Клиент</span>
                      <strong>{selectedOrder.customerName}</strong>
                    </div>
                    <div>
                      <span>Телефон</span>
                      <strong>{selectedOrder.phone}</strong>
                    </div>
                    <div>
                      <span>E-mail</span>
                      <strong>{selectedOrder.email || 'Не указан'}</strong>
                    </div>
                    <div>
                      <span>Telegram</span>
                      <strong>{selectedOrder.telegram || 'Не указан'}</strong>
                    </div>
                  </div>
                </article>

                <article className="admin-order-section">
                  <p className="admin-card__eyebrow">Доставка</p>
                  <div className="admin-order-info-list">
                    <div>
                      <span>Способ</span>
                      <strong>{selectedOrder.deliveryMethodLabel}</strong>
                    </div>
                    <div>
                      <span>Адрес</span>
                      <strong>{buildOrderAddress(selectedOrder)}</strong>
                    </div>
                    <div>
                      <span>Комментарий</span>
                      <strong>{selectedOrder.comment || 'Без комментария'}</strong>
                    </div>
                  </div>
                </article>
              </div>

              <article className="admin-order-section">
                <div className="admin-order-section__head">
                  <p className="admin-card__eyebrow">Состав заказа</p>
                  <div className="admin-order-section__icon">
                    <RiShoppingBag3Line size={16} aria-hidden="true" />
                  </div>
                </div>

                <div className="admin-order-items">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="admin-order-item">
                      <div className="admin-order-item__media">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} />
                        ) : (
                          <div className="admin-order-item__placeholder">No image</div>
                        )}
                      </div>

                      <div className="admin-order-item__content">
                        <p className="admin-order-item__title">{item.title}</p>
                        <p className="admin-order-item__meta">
                          {item.quantity} шт.
                          {item.size ? ` • ${item.size}` : ''}
                          {item.slug ? ` • /${item.slug}` : ''}
                        </p>
                      </div>

                      <div className="admin-order-item__prices">
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                        <span>{formatPrice(item.price)} / шт.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          ) : (
            <EmptyState
              title="Заказ не выбран"
              message="Выбери заказ слева, чтобы посмотреть детали."
            />
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminOrdersPage;
