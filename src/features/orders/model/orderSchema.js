export const ORDER_STATUS = Object.freeze({
  NEW: 'new',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const DELIVERY_METHODS = Object.freeze([
  Object.freeze({
    value: 'russian-post',
    label: 'Почта России',
    details: 'от 3 дней',
    price: 900,
    priceLabel: '900 р.',
  }),
  Object.freeze({
    value: 'belarus-kazakhstan',
    label: 'Доставка в РБ и КЗ',
    details: '',
    price: 900,
    priceLabel: '900 р.',
  }),
  Object.freeze({
    value: 'worldwide',
    label: 'Доставка по миру',
    details: '',
    price: 1500,
    priceLabel: '1 500 р.',
  }),
]);

export const ORDER_FORM_DEFAULTS = Object.freeze({
  customerName: '',
  email: '',
  phone: '',
  telegram: '',
  city: '',
  deliveryMethod: DELIVERY_METHODS[0].value,
  street: '',
  house: '',
  entrance: '',
  floor: '',
  apartmentOffice: '',
  comment: '',
});

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

function normalizeQuantity(quantity) {
  return Math.max(1, Math.trunc(normalizeNumber(quantity, 1)));
}

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      productId: item?.productId ?? null,
      slug: normalizeText(item?.slug),
      title: normalizeText(item?.title),
      imageUrl: normalizeText(item?.imageUrl),
      price: normalizeNumber(item?.price, 0),
      size: normalizeNullableText(item?.size),
      quantity: normalizeQuantity(item?.quantity),
    }))
    .filter((item) => item.productId !== null && item.title);
}

export function getDeliveryMethod(value) {
  return DELIVERY_METHODS.find((method) => method.value === normalizeText(value)) || null;
}

export function getDeliveryMethodLabel(value) {
  return getDeliveryMethod(value)?.label || value;
}

export function getDeliveryPrice(value) {
  return getDeliveryMethod(value)?.price || 0;
}

export function normalizeOrderForm(values = {}) {
  const normalizedDeliveryMethod = normalizeText(values.deliveryMethod);

  return {
    ...ORDER_FORM_DEFAULTS,
    customerName: normalizeText(values.customerName),
    email: normalizeText(values.email),
    phone: normalizeText(values.phone),
    telegram: normalizeText(values.telegram),
    city: normalizeText(values.city),
    deliveryMethod: getDeliveryMethod(normalizedDeliveryMethod)
      ? normalizedDeliveryMethod
      : ORDER_FORM_DEFAULTS.deliveryMethod,
    street: normalizeText(values.street),
    house: normalizeText(values.house),
    entrance: normalizeText(values.entrance),
    floor: normalizeText(values.floor),
    apartmentOffice: normalizeText(values.apartmentOffice),
    comment: normalizeText(values.comment),
  };
}

export function getOrderTotals(items, deliveryMethod = ORDER_FORM_DEFAULTS.deliveryMethod) {
  const normalizedItems = normalizeItems(items);
  const itemsAmount = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryPrice = getDeliveryPrice(deliveryMethod);

  return {
    totalItems: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    itemsAmount,
    deliveryPrice,
    totalAmount: itemsAmount + deliveryPrice,
  };
}

export function validateOrderForm(values = {}, items = []) {
  const normalizedValues = normalizeOrderForm(values);
  const normalizedItems = normalizeItems(items);
  const errors = {};

  if (!normalizedValues.customerName || normalizedValues.customerName.length < 2) {
    errors.customerName = 'Укажи Ф.И.О. получателя.';
  }

  const phoneDigits = normalizedValues.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.phone = 'Укажи корректный номер телефона.';
  }

  if (
    normalizedValues.email
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValues.email)
  ) {
    errors.email = 'Укажи корректный e-mail.';
  }

  if (!normalizedValues.city) {
    errors.city = 'Укажи город доставки.';
  }

  if (!normalizedValues.street) {
    errors.street = 'Укажи улицу.';
  }

  if (!normalizedValues.house) {
    errors.house = 'Укажи дом.';
  }

  if (!getDeliveryMethod(normalizedValues.deliveryMethod)) {
    errors.deliveryMethod = 'Выбери способ доставки.';
  }

  if (normalizedItems.length === 0) {
    errors.items = 'Корзина пуста.';
  }

  return errors;
}

export function serializeOrderForWrite(values = {}, items = []) {
  const normalizedValues = normalizeOrderForm(values);
  const totals = getOrderTotals(items, normalizedValues.deliveryMethod);

  return {
    customer_name: normalizedValues.customerName,
    email: normalizedValues.email || null,
    phone: normalizedValues.phone,
    telegram: normalizedValues.telegram || null,
    city: normalizedValues.city,
    delivery_method: normalizedValues.deliveryMethod,
    delivery_price: totals.deliveryPrice,
    street: normalizedValues.street,
    house: normalizedValues.house,
    entrance: normalizedValues.entrance || null,
    floor: normalizedValues.floor || null,
    apartment_office: normalizedValues.apartmentOffice || null,
    comment: normalizedValues.comment || null,
    total_amount: totals.totalAmount,
    total_items: totals.totalItems,
    status: ORDER_STATUS.NEW,
  };
}

export function serializeOrderItemsForWrite(orderId, items = []) {
  return normalizeItems(items).map((item) => ({
    order_id: orderId,
    product_id: String(item.productId),
    product_title: item.title,
    product_slug: item.slug || null,
    image_url: item.imageUrl || null,
    price: item.price,
    size: item.size,
    quantity: item.quantity,
  }));
}
