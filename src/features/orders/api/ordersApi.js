import { supabase } from '../../../services/supabase/client';
import {
  normalizeOrderModel,
  normalizeOrderStatus,
  ORDER_DB_SELECT,
  serializeOrderForWrite,
  serializeOrderItemsForWrite,
  validateOrderForm,
} from '../model';

const CREATE_PUBLIC_ORDER_RPC = 'create_public_order';

function mapOrdersApiErrorMessage(error, action = 'load') {
  const message = String(error?.message || '').trim();
  const normalizedMessage = message.toLowerCase();

  if (
    action === 'create'
    && (
      normalizedMessage.includes(CREATE_PUBLIC_ORDER_RPC)
      || normalizedMessage.includes('schema cache')
      || normalizedMessage.includes('permission denied for function')
      || normalizedMessage.includes('row-level security')
    )
  ) {
    return 'Гостевое оформление заказа не настроено. Выполни SQL из файла supabase/setup/08_guest_checkout_rpc.sql.';
  }

  if (normalizedMessage.includes('row-level security')) {
    if (action === 'load' || action === 'update') {
      return 'Список заказов и смена статуса доступны только администратору. Проверь вход и SQL из файла supabase/setup/06_admin_policies.sql.';
    }
  }

  if (message) {
    return message;
  }

  switch (action) {
    case 'create':
      return 'Не удалось оформить заказ.';
    case 'update':
      return 'Не удалось обновить статус заказа.';
    default:
      return 'Не удалось загрузить заказы.';
  }
}

function serializeOrderItemsForRpc(items) {
  return serializeOrderItemsForWrite(null, items).map(({ order_id, ...item }) => item);
}

export async function createOrder(values, items) {
  const validationErrors = validateOrderForm(values, items);

  if (Object.keys(validationErrors).length > 0) {
    const validationError = new Error('Проверь данные заказа.');
    validationError.validationErrors = validationErrors;
    throw validationError;
  }

  const orderPayload = serializeOrderForWrite(values, items);
  const orderItemsPayload = serializeOrderItemsForRpc(items);
  const { data, error } = await supabase.rpc(CREATE_PUBLIC_ORDER_RPC, {
    order_payload: orderPayload,
    order_items_payload: orderItemsPayload,
  });

  if (error) {
    throw new Error(mapOrdersApiErrorMessage(error, 'create'));
  }

  const order = Array.isArray(data) ? data[0] : data;

  if (!order?.id) {
    throw new Error('Не удалось получить номер оформленного заказа.');
  }

  return order;
}

export async function getAdminOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DB_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(mapOrdersApiErrorMessage(error));
  }

  return (data ?? []).map((order) => normalizeOrderModel(order));
}

export async function updateOrderStatus(orderId, status) {
  const nextStatus = normalizeOrderStatus(status);
  const { data, error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .select(ORDER_DB_SELECT)
    .single();

  if (error) {
    throw new Error(mapOrdersApiErrorMessage(error, 'update'));
  }

  return normalizeOrderModel(data);
}
