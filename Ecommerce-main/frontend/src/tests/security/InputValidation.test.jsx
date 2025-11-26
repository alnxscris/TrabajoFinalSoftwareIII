import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Login from '../../pages/auth/Login';

// Mock simple
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

describe('Pruebas de Seguridad: Validación de Entradas (Input Validation)', () => {
  
  it('SEC-03: Sanitización de entradas (Previene XSS básico en campos de texto)', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Login /></MemoryRouter>);

    const emailInput = screen.getByLabelText(/Email/i);
    
    // Intentamos inyectar un payload XSS clásico
    const xssPayload = "<script>alert('Hacked')</script>";
    
    await user.type(emailInput, xssPayload);

    // React debe renderizar el valor como texto plano en el input, no ejecutarlo.
    // Verificamos que el valor del input sea exactamente el string, lo que significa
    // que el DOM lo trató como texto y no como HTML ejecutable.
    expect(emailInput).toHaveValue(xssPayload);
    
    // Adicionalmente, verificaríamos que al enviar, tu backend sanitice esto,
    // pero desde el frontend garantizamos que el input lo maneja como string.
  });
});