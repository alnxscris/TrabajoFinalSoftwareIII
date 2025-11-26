import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../../pages/auth/Login';
import * as authService from '../../services/auth';

// 1. Mockeamos el Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// 2. Mockeamos el Servicio de Auth
vi.mock('../../services/auth', () => ({
  loginUser: vi.fn(),
}));

describe('Pruebas Funcionales: Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('AU-01: Inicia sesión correctamente y redirige al Home', async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    
    // Espiamos useNavigate
    const routerModule = await import('react-router-dom');
    vi.spyOn(routerModule, 'useNavigate').mockReturnValue(mockNavigate);

    // 👇 CORRECCIÓN AQUÍ: Usamos mockImplementation para simular que el servicio guarda el token
    authService.loginUser.mockImplementation(async () => {
      localStorage.setItem('token', 'fake-jwt-token'); // Simulamos lo que hace tu archivo auth.js real
      return {
        token: 'fake-jwt-token',
        user: { id: 1, nombre: 'Test User' }
      };
    });

    render(<MemoryRouter><Login /></MemoryRouter>);

    // Llenamos el formulario
    await user.type(screen.getByLabelText(/Email/i), 'test@mail.com');
    await user.type(screen.getByLabelText(/Contraseña/i), '123456');
    
    // Clic en entrar
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verificaciones
    await waitFor(() => {
      // Verifica que se llamó a la API
      expect(authService.loginUser).toHaveBeenCalledWith({ 
        email: 'test@mail.com', 
        password: '123456' 
      });
      
      // Verifica que el token existe (ahora sí pasará porque lo simulamos arriba)
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      
      // Verifica la redirección
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('AU-02: Muestra error con credenciales inválidas', async () => {
    const user = userEvent.setup();
    
    // Caso de error: Promesa rechazada
    authService.loginUser.mockRejectedValue({ mensaje: 'Credenciales inválidas.' });

    render(<MemoryRouter><Login /></MemoryRouter>);

    await user.type(screen.getByLabelText(/Email/i), 'bad@mail.com');
    await user.type(screen.getByLabelText(/Contraseña/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    // Verifica que aparezca el error en pantalla
    expect(await screen.findByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });
});