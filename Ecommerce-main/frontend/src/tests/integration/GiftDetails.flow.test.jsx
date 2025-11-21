import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/services/products', () => ({
  getProduct: (id) => ({
    id,
    title: 'Box Rosa',
    price: 25.5,
    description: 'Delicias',
    image: '/images/box.jpg'
  })
}));

// Mock de useParams y useNavigate
jest.mock('react-router-dom', () => {
  const real = jest.requireActual('react-router-dom');
  return {
    ...real,
    useParams: () => ({ id: 'p123' }),
    useNavigate: () => jest.fn()
  };
});

import GiftDetails from '@/pages/GiftDetails';

describe('GiftDetails', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-10T10:00:00Z')); // fecha fija
  });
  afterAll(() => jest.useRealTimers());

  beforeEach(() => localStorage.clear());

  it('valida fecha/hora requeridas y 48h mínimas', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GiftDetails />
      </MemoryRouter>
    );

    // Click sin fecha/hora => error
    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/seleccionar fecha y hora/i);

    // Seleccionar fecha < 48h (por ejemplo, mismo día)
    const dateInput = screen.getByLabelText(/fecha/i);
    const timeInput = screen.getByLabelText(/hora/i);

    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-10');
    await user.clear(timeInput);
    await user.type(timeInput, '12:00');

    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/48 horas/i);

    // Fecha válida (3 días después)
    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-13');
    await user.clear(timeInput);
    await user.type(timeInput, '12:00');

    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    // Debe redirigir a /carrito
    const navigateMock = require('react-router-dom').useNavigate();
    expect(navigateMock).toHaveBeenCalledWith('/carrito');

    // Item guardado en localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(cart.length).toBeGreaterThan(0);
    expect(cart[0]).toMatchObject({ id: 'p123', title: 'Box Rosa', qty: 1 });
  });
});
