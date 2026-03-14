import { getDeliveryMethodLabel, ORDER_STATUS } from './orderSchema';

export const ORDER_ITEM_DB_SELECT = `
  id,
  order_id,
  product_id,
  product_title,
  product_slug,
  image_url,
  price,
  size,
  quantity,
  created_at
`;

export const ORDER_DB_SELECT = `
  id,
  customer_name,
  email,
  phone,
  telegram,
  city,
  delivery_method,
  delivery_price,
  street,
  house,
  entrance,
  floor,
  apartment_office,
  comment,
  total_amount,
  total_items,
  status,
  created_at,
  order_items (
    ${ORDER_ITEM_DB_SELECT}
  )
`;

export const ORDER_STATUS_OPTIONS = Object.freeze([
  Object.freeze({
    value: ORDER_STATUS.NEW,
    label: 'Новый',
    tone: 'new',
  }),
  Object.freeze({
    value: ORDER_STATUS.PROCESSING,
    label: 'В работе',
    tone: 'processing',
  }),
  Object.freeze({
    value: ORDER_STATUS.COMPLETED,
    label: 'Завершён',
    tone: 'completed',
  }),
  Object.freeze({
    value: ORDER_STATUS.CANCELLED,
    label: 'Отменён',
    tone: 'cancelled',
  }),
]);

function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value);

  return normalizedValue || null;
}

function normalizeNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizeInteger(value, fallback = 0) {
  return Math.max(0, Math.trunc(normalizeNumber(value, fallback)));
}

function normalizeOrderIdentifier(value) {
  const normalizedValue = normalizeNullableText(value);

  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (Number.isInteger(numericValue) && String(numericValue) === normalizedValue) {
    return numericValue;
  }

  return normalizedValue;
}

export function normalizeOrderStatus(value) {
  const normalizedStatus = normalizeText(value);

  return ORDER_STATUS_OPTIONS.some((status) => status.value === normalizedStatus)
    ? normalizedStatus
    : ORDER_STATUS.NEW;
}

export function getOrderStatusMeta(value) {
  const normalizedStatus = normalizeOrderStatus(value);

  return ORDER_STATUS_OPTIONS.find((status) => status.value === normalizedStatus)
    || ORDER_STATUS_OPTIONS[0];
}

export function getOrderStatusLabel(value) {
  return getOrderStatusMeta(value).label;
}

export function normalizeOrderItemModel(item = {}) {
  return {
    id: normalizeOrderIdentifier(item.id),
    orderId: normalizeOrderIdentifier(item.orderId ?? item.order_id),
    productId: normalizeNullableText(item.productId ?? item.product_id),
    title: normalizeText(item.title ?? item.productTitle ?? item.product_title),
    slug: normalizeNullableText(item.slug ?? item.productSlug ?? item.product_slug),
    imageUrl: normalizeNullableText(item.imageUrl ?? item.image_url),
    price: normalizeNumber(item.price, 0),
    size: normalizeNullableText(item.size),
    quantity: normalizeInteger(item.quantity, 1),
    createdAt: normalizeNullableText(item.createdAt ?? item.created_at),
  };
}

export function normalizeOrderModel(order = {}) {
  const itemsSource = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.order_items)
      ? order.order_items
      : [];
  const items = itemsSource
    .map((item) => normalizeOrderItemModel(item))
    .sort((firstItem, secondItem) =>
      String(firstItem.id).localeCompare(String(secondItem.id), 'ru', {
        numeric: true,
      }));
  const deliveryPrice = normalizeNumber(order.deliveryPrice ?? order.delivery_price, 0);
  const totalAmount = normalizeNumber(order.totalAmount ?? order.total_amount, 0);

  return {
    id: normalizeOrderIdentifier(order.id),
    customerName: normalizeText(order.customerName ?? order.customer_name),
    email: normalizeNullableText(order.email),
    phone: normalizeText(order.phone),
    telegram: normalizeNullableText(order.telegram),
    city: normalizeText(order.city),
    deliveryMethod: normalizeText(order.deliveryMethod ?? order.delivery_method),
    deliveryMethodLabel: getDeliveryMethodLabel(
      order.deliveryMethod ?? order.delivery_method,
    ),
    deliveryPrice,
    street: normalizeText(order.street),
    house: normalizeText(order.house),
    entrance: normalizeNullableText(order.entrance),
    floor: normalizeNullableText(order.floor),
    apartmentOffice: normalizeNullableText(
      order.apartmentOffice ?? order.apartment_office,
    ),
    comment: normalizeNullableText(order.comment),
    totalAmount,
    itemsAmount: Math.max(0, totalAmount - deliveryPrice),
    totalItems: normalizeInteger(order.totalItems ?? order.total_items, items.length),
    status: normalizeOrderStatus(order.status),
    createdAt: normalizeNullableText(order.createdAt ?? order.created_at),
    items,
  };
}
