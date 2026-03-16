import { supabase } from '../../../services/supabase/client';
import {
  normalizeOrderModel,
  normalizeOrderStatus,
  ORDER_DB_SELECT,
  serializeOrderForWrite,
  serializeOrderItemsForWrite,
  validateOrderForm,
} from '../model';

function mapOrdersApiErrorMessage(error, action = 'load') {
  const message = String(error?.message || '').trim();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('row-level security')) {
    return 'Доступ к таблицам orders/order_items ограничен RLS. Выполни SQL из файла supabase/setup/03_public_policies.sql в Supabase.';
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

async function rollbackOrder(orderId) {
  if (!orderId) {
    return;
  }

  try {
    await supabase.from('orders').delete().eq('id', orderId);
  } catch {
    // Best-effort rollback only.
  }
}

export async function createOrder(values, items) {
  const validationErrors = validateOrderForm(values, items);

  if (Object.keys(validationErrors).length > 0) {
    const validationError = new Error('Проверь данные заказа.');
    validationError.validationErrors = validationErrors;
    throw validationError;
  }

  const orderPayload = serializeOrderForWrite(values, items);
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select('id, created_at')
    .single();

  if (orderError) {
    throw new Error(mapOrdersApiErrorMessage(orderError, 'create'));
  }

  const orderItemsPayload = serializeOrderItemsForWrite(order.id, items);
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) {
    await rollbackOrder(order.id);
    throw new Error(mapOrdersApiErrorMessage(itemsError, 'create'));
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
