import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Cart from '../../pages/Cart';
import * as cartService from '../../services/cart';

// 1. Mock del Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. Mock de los Servicios del Carrito
vi.mock('../../services/cart', () => ({
  getCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

describe('Pruebas Funcionales: Carrito de Compras', () => {
  const mockUser = { id_usuario: 1, nombre: 'Cliente Test' };
  
  // Datos de prueba: 2 productos en el carrito
  const mockCartItems = [
    {
      id_producto: 101,
      nombre_producto: 'Box Romántico',
      precio_producto: 50.00,
      cantidad: 2,
      imagen_url: '/img1.jpg'
    },
    {
      id_producto: 102,
      nombre_producto: 'Vino Especial',
      precio_producto: 30.00,
      cantidad: 1,
      imagen_url: '/img2.jpg'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Simulamos que el usuario ya está logueado
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('CT-01: Carga productos y calcula el total correctamente', async () => {
    // Configuramos que getCart devuelva nuestros datos de prueba
    // Subtotal esperado: (50*2) + (30*1) = 130
    // Total esperado: 130 + 7 (envío) = 137
    cartService.getCart.mockResolvedValue({ 
      carrito: mockCartItems, 
      total: 130 
    });

    render(<MemoryRouter><Cart /></MemoryRouter>);

    // 1. Verificar que se llamó al servicio
    await waitFor(() => {
      expect(cartService.getCart).toHaveBeenCalledWith(mockUser.id_usuario);
    });

    // 2. Verificar que los productos aparecen en pantalla
    expect(screen.getByText('Box Romántico')).toBeInTheDocument();
    expect(screen.getByText('Vino Especial')).toBeInTheDocument();

    // 3. Verificar Cálculos (Busca el texto exacto formateado "S/. ...")
    // Subtotal 130
    expect(screen.getByText('S/. 130')).toBeInTheDocument();
    // Total final (130 + 7 envío)
    expect(screen.getByText('S/. 137')).toBeInTheDocument();
  });

  it('CT-02: Permite eliminar un producto y actualiza la vista', async () => {
    const user = userEvent.setup();
    
    cartService.getCart.mockResolvedValue({ 
      carrito: mockCartItems, 
      total: 130 
    });
    // Simulamos que la eliminación en backend es exitosa
    cartService.removeCartItem.mockResolvedValue({});

    render(<MemoryRouter><Cart /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Box Romántico')).toBeInTheDocument());

    // Buscamos el botón de eliminar del primer producto
    // Nota: Como hay varios botones de eliminar, usamos 'getAllByRole' y tomamos el primero
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    await user.click(deleteButtons[0]); // Borramos el primero (Box Romántico)

    // Verificar que se llamó al servicio de eliminar con el ID correcto (101)
    expect(cartService.removeCartItem).toHaveBeenCalledWith(mockUser.id_usuario, 101);

    // Verificar que el producto desapareció de la vista
    await waitFor(() => {
      expect(screen.queryByText('Box Romántico')).not.toBeInTheDocument();
    });
  });

  it('CT-03: Botón "Procede al pago" redirige a /envio', async () => {
    const user = userEvent.setup();
    cartService.getCart.mockResolvedValue({ carrito: mockCartItems, total: 130 });

    render(<MemoryRouter><Cart /></MemoryRouter>);

    // Esperar carga
    await waitFor(() => screen.getByText('S/. 137'));

    // Clic en pagar
    const payBtn = screen.getByRole('button', { name: /Procede al pago/i });
    await user.click(payBtn);

    // Verificar redirección con los datos del estado
    expect(mockNavigate).toHaveBeenCalledWith("/envio", expect.objectContaining({
      state: expect.objectContaining({
        id_usuario: 1,
        total: 130 // El total base que pasa tu componente
      })
    }));
  });
});