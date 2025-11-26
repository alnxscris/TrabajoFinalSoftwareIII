import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Gifts from '../../pages/Gifts';
import GiftDetails from '../../pages/GiftDetails';
import * as inventoryService from '../../services/inventory';
import * as cartService from '../../services/cart';

// 1. Mockeamos el Router (Navigation y Params)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // Importante: useParams lo definimos dinámicamente en los tests si hace falta
  };
});

// 2. Mockeamos Servicios
vi.mock('../../services/inventory', () => ({
  getInventory: vi.fn(),
  getProductById: vi.fn(),
}));

vi.mock('../../services/cart', () => ({
  addToCart: vi.fn(),
}));

// Datos de prueba
const mockProducts = [
  {
    id_producto: 'box-mama',
    nombre_producto: 'Box Día de la Madre',
    precio_producto: 120.00,
    imagen_url: '/img1.jpg',
    descripcion_producto: 'Contiene chocolates y vino'
  }
];

describe('Pruebas Funcionales: Catálogo y Productos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('PR-01: El catálogo carga y muestra los productos', async () => {
    // Simulamos respuesta del inventario
    inventoryService.getInventory.mockResolvedValue({
      secciones: [{ title: 'Recomendados', items: mockProducts }]
    });

    render(<MemoryRouter><Gifts /></MemoryRouter>);

    // Verificamos que llamó al servicio
    await waitFor(() => expect(inventoryService.getInventory).toHaveBeenCalled());

    // Verificamos que el producto aparece en pantalla
    expect(await screen.findByText('Box Día de la Madre')).toBeInTheDocument();
    expect(screen.getByText('S/. 120')).toBeInTheDocument();
  });

  it('PR-02: "Ver detalles" navega a la página del producto', async () => {
    const user = userEvent.setup();
    inventoryService.getInventory.mockResolvedValue({
      secciones: [{ title: 'Recomendados', items: mockProducts }]
    });

    render(<MemoryRouter><Gifts /></MemoryRouter>);

    // Esperar carga
    const linkBtn = await screen.findByRole('link', { name: /Ver detalles/i });
    
    // Clic en el botón
    // Nota: Como es un <Link>, en test de unidad verificamos el atributo href o click
    expect(linkBtn).toHaveAttribute('href', '/regalos/box-mama');
  });

  it('PR-03: Detalle de Producto permite "Agregar al Carrito" (Usuario Logueado)', async () => {
    const user = userEvent.setup();
    
    // Simulamos usuario logueado
    localStorage.setItem('user', JSON.stringify({ id_usuario: 1 }));

    // Simulamos que el servicio devuelve el producto específico
    inventoryService.getProductById.mockResolvedValue(mockProducts[0]);
    cartService.addToCart.mockResolvedValue({ mensaje: 'Agregado' });

    // Renderizamos GiftDetails simulando que estamos en la URL /regalos/box-mama
    render(
      <MemoryRouter initialEntries={['/regalos/box-mama']}>
        <Routes>
          <Route path="/regalos/:id" element={<GiftDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que cargó la info
    expect(await screen.findByText('Box Día de la Madre')).toBeInTheDocument();

    // Clic en agregar
    const addBtn = screen.getByRole('button', { name: /Agregar al carrito/i });
    await user.click(addBtn);

    // Verificar que llamó al servicio de agregar
    expect(cartService.addToCart).toHaveBeenCalledWith({
      id_usuario: 1,
      id_producto: 'box-mama',
      cantidad: 1 // Cantidad por defecto
    });

    // Verificar redirección al carrito
    expect(mockNavigate).toHaveBeenCalledWith('/carrito');
  });

  it('PR-04: Impide agregar al carrito si NO hay usuario (Redirige a Login)', async () => {
    const user = userEvent.setup();
    
    // NO guardamos usuario en localStorage (Visitante)
    inventoryService.getProductById.mockResolvedValue(mockProducts[0]);

    // Mockeamos window.alert para que no rompa el test (tu código usa alert)
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/regalos/box-mama']}>
        <Routes>
          <Route path="/regalos/:id" element={<GiftDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Box Día de la Madre')).toBeInTheDocument();

    // Intentar agregar
    await user.click(screen.getByRole('button', { name: /Agregar al carrito/i }));

    // Verificar comportamiento: NO llama al servicio, SÍ redirige a login
    expect(cartService.addToCart).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});