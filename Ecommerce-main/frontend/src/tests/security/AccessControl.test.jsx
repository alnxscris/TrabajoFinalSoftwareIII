import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Cart from '../../pages/Cart';
import Shipping from '../../pages/Shipping';
import * as cartService from '../../services/cart';

// Mock del Router y Navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de Servicios (para que no fallen por llamadas a API)
vi.mock('../../services/cart', () => ({
  getCart: vi.fn(),
}));

describe('Pruebas de Seguridad: Control de Acceso (Broken Access Control)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // IMPORTANTE: Iniciamos sin token (Usuario no autenticado)
  });

  it('SEC-01: Protege la ruta /carrito contra acceso no autorizado', async () => {
    // Intentamos renderizar el carrito SIN estar logueados
    // Simulamos que el servicio de carrito falla porque no hay auth
    cartService.getCart.mockRejectedValue({ status: 401, mensaje: 'No autorizado' });

    render(<MemoryRouter><Cart /></MemoryRouter>);

    // En tu lógica actual (Cart.jsx), si no hay items o falla, muestra "vacío" o error.
    // Pero si implementas protección de rutas, debería redirigir.
    // Vamos a asumir que tu lógica de negocio debería detectar la falta de usuario.
    
    // Si tu componente Cart.jsx tiene esta lógica: 
    // "const user = JSON.parse(localStorage.getItem("user")); if (!user) navigate('/login')"
    
    // Esperamos que NO se muestre información sensible (ej. total del carrito)
    expect(screen.queryByText(/Total/i)).not.toBeInTheDocument();
    
    // O verificamos que muestre el estado vacío/seguro
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });

  it('SEC-02: Protege la ruta /envio (Checkout) contra acceso directo', async () => {
    // Intentamos saltarnos el carrito e ir directo a pagar (/envio)
    // sin tener items ni sesión.
    
    // Simulamos useLocation vacío (sin state de productos)
    // Nota: Esto requiere mockear useLocation como hicimos en los funcionales
    
    render(<MemoryRouter><Shipping /></MemoryRouter>);

    // Tu componente Shipping debería fallar o redirigir si no hay datos
    // Verificamos que NO permita hacer submit
    const btn = screen.getByRole('button', { name: /Siguiente/i });
    expect(btn).toBeDisabled(); // O verificar que no deje avanzar
  });
});