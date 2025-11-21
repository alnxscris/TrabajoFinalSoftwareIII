import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Cart from '@/pages/Cart';

const setCartLS = (items) => localStorage.setItem('cart', JSON.stringify(items));

describe('Flujo Carrito', () => {
  beforeEach(() => localStorage.clear());

  it('muestra vacío cuando no hay items', () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it('lista items y permite aumentar/disminuir/eliminar y vaciar', async () => {
    const user = userEvent.setup();
    setCartLS([
      {
        id: 'p1',
        title: 'Box Dulce',
        price: 10,
        qty: 1,
        deliveryAt: new Date().toISOString(),
        image: '/images/x.jpg'
      }
    ]);

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    const item = screen.getByRole('article');
    expect(within(item).getByText('Box Dulce')).toBeInTheDocument();

    // Aumentar
    await user.click(within(item).getByRole('button', { name: /aumentar/i }));
    expect(within(item).getByText('2')).toBeInTheDocument();

    // Disminuir
    await user.click(within(item).getByRole('button', { name: /disminuir/i }));
    expect(within(item).getByText('1')).toBeInTheDocument();

    // Eliminar
    await user.click(within(item).getByRole('button', { name: /eliminar/i }));
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();

    // Vaciar (con item de nuevo)
    setCartLS([
      { id: 'p1', title: 'Box Dulce', price: 10, qty: 1, deliveryAt: new Date().toISOString(), image: '' }
    ]);
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /vaciar/i }));
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
  });

  it('proceder al pago navega a /envio', async () => {
    const user = userEvent.setup();
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

    setCartLS([
      { id: 'p1', title: 'Box', price: 10, qty: 1, deliveryAt: new Date().toISOString(), image: '' }
    ]);

    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /procede al pago/i }));
    expect(navigateMock).toHaveBeenCalledWith('/envio');
  });
});
