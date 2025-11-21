// src/tests/component/Register.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '@/pages/auth/Register'; // Ajuste de import

jest.useFakeTimers();

jest.mock('react-router-dom', () => {
  const real = jest.requireActual('react-router-dom');
  return { ...real, useNavigate: () => jest.fn() };
});

describe('<Register />', () => {
  it('muestra error si faltan campos', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/complete todos los campos/i);
  });

  it('navega a /home con datos válidos', async () => {
    const user = userEvent.setup();

    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/nombre/i), 'Sebastian');
    await user.type(screen.getByLabelText(/email/i), 'sebastian@domain.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(navigateMock).toHaveBeenCalledWith('/home');
  });
});
