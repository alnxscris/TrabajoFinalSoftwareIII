import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Shipping from '../../pages/Shipping';

// Mock del router y location
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: { id_usuario: 1, productos: [], total: 100 }
    }),
  };
});

describe('Pruebas Funcionales: Regla de Negocio 48h', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fijamos la fecha del sistema: 15 de Junio 2025
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Debe mostrar error si selecciono una fecha inválida (ej. fecha pasada)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<MemoryRouter><Shipping /></MemoryRouter>);

    // 1. Llenar datos básicos
    await user.type(screen.getByLabelText(/Nombre Completo/i), 'Test User');
    await user.type(screen.getByLabelText(/Celular/i), '+51 999888777');
    await user.type(screen.getByLabelText(/Dirección/i), 'Calle Falsa 123');

    // 2. PROVOCAR EL ERROR:
    // Fecha del sistema: 2025. Ponemos fecha 2020.
    // Regla: Debe ser >= (hoy + 2 días). 2020 claramente falla.
    const dateInput = screen.getByLabelText(/Fecha de Entrega/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2020-01-01');

    const timeInput = screen.getByLabelText(/Hora de Entrega/i);
    await user.clear(timeInput);
    await user.type(timeInput, '10:00');

    // 3. Enviar formulario (click humano)
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    // 4. Verificar
    // Buscamos el mensaje de error definido en Shipping.jsx
    expect(await screen.findByText(/48 horas de anticipación/i)).toBeInTheDocument();
  });
});