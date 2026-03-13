import { supabase } from '../../../services/supabase/client';
import {
  serializeOrderForWrite,
  serializeOrderItemsForWrite,
  validateOrderForm,
} from '../model';

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
    throw new Error(orderError.message);
  }

  const orderItemsPayload = serializeOrderItemsForWrite(order.id, items);
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) {
    await rollbackOrder(order.id);
    throw new Error(itemsError.message);
  }

  return order;
}
