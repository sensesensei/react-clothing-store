import { fireEvent, render } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { useCart } from '../../features/cart';
import { createOrder } from '../../features/orders';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  Link: ({ children, className, to, ...props }) => (
    <a href={typeof to === 'string' ? to : ''} className={className} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('../../features/cart', () => ({
  useCart: jest.fn(),
}));

jest.mock('../../features/orders', () => {
  const actualModel = jest.requireActual('../../features/orders/model');

  return {
    ...actualModel,
    createOrder: jest.fn(),
  };
});

const mockedUseCart = useCart;
const mockedCreateOrder = createOrder;

describe('CheckoutPage', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: jest.fn(),
    });

    mockedUseCart.mockReturnValue({
      items: [
        {
          id: '1',
          productId: 1,
          title: 'Destroy',
          price: 4000,
          quantity: 1,
        },
      ],
      clearCart: jest.fn(),
    });

    mockedCreateOrder.mockResolvedValue({ id: 42 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('prevents submit and focuses phone when a required field is missing', () => {
    const { container } = render(<CheckoutPage />);

    const customerNameInput = container.querySelector('input[name="customerName"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    const cityInput = container.querySelector('input[name="city"]');
    const streetInput = container.querySelector('input[name="street"]');
    const houseInput = container.querySelector('input[name="house"]');
    const submitButton = container.querySelector('button[type="submit"]');

    fireEvent.change(customerNameInput, { target: { value: 'Roman Petrov' } });
    fireEvent.change(cityInput, { target: { value: 'Moscow' } });
    fireEvent.change(streetInput, { target: { value: 'Tverskaya' } });
    fireEvent.change(houseInput, { target: { value: '10' } });
    fireEvent.click(submitButton);

    expect(mockedCreateOrder).not.toHaveBeenCalled();
    expect(phoneInput.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(phoneInput);
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
