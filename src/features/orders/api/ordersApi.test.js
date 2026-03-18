jest.mock('../../../services/supabase/client', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

import { supabase } from '../../../services/supabase/client';
import { createOrder } from './ordersApi';

const mockSupabase = supabase;

const validValues = {
  customerName: 'Roman Petrov',
  email: 'roman@example.com',
  phone: '+7 900 123 45 67',
  telegram: '@roman',
  city: 'Moscow',
  deliveryMethod: 'worldwide',
  street: 'Tverskaya',
  house: '10',
  entrance: '2',
  floor: '4',
  apartmentOffice: '18',
  comment: 'Call before delivery',
};

const validItems = [
  {
    productId: 1,
    title: 'Destroy',
    slug: 'destroy',
    imageUrl: 'https://example.com/destroy.jpg',
    price: 4000,
    quantity: 2,
    size: '50 ml',
  },
];

describe('ordersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createOrder uses guest checkout RPC and returns created order', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [{ id: 77, created_at: '2026-03-17T09:00:00Z' }],
      error: null,
    });

    const order = await createOrder(validValues, validItems);

    expect(order).toEqual({
      id: 77,
      created_at: '2026-03-17T09:00:00Z',
    });
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'create_public_order',
      expect.objectContaining({
        order_payload: expect.objectContaining({
          customer_name: 'Roman Petrov',
          phone: '+7 900 123 45 67',
          status: 'new',
        }),
      }),
    );
    expect(
      mockSupabase.rpc.mock.calls[0][1].order_items_payload[0],
    ).toEqual(
      expect.objectContaining({
        product_id: '1',
        product_title: 'Destroy',
        quantity: 2,
      }),
    );
    expect(
      mockSupabase.rpc.mock.calls[0][1].order_items_payload[0],
    ).not.toHaveProperty('order_id');
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test('createOrder stops before rpc when validation fails', async () => {
    await expect(
      createOrder(
        {
          customerName: 'A',
          phone: '123',
          city: '',
          street: '',
          house: '',
        },
        [],
      ),
    ).rejects.toMatchObject({
      validationErrors: expect.any(Object),
    });

    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  test('createOrder shows setup hint when guest checkout rpc is missing', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: {
        message:
          'Could not find the function public.create_public_order(order_payload, order_items_payload) in the schema cache',
      },
    });

    await expect(createOrder(validValues, validItems)).rejects.toThrow(
      'supabase/setup/08_guest_checkout_rpc.sql',
    );
  });
});
