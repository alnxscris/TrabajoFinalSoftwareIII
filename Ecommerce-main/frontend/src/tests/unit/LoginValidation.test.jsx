// src/tests/unit/LoginValidation.test.js
import { validateLogin } from '@/utils/validators'; // Ajuste de import

describe('validateLogin', () => {
  it('debería validar que el email sea válido', () => {
    const validEmail = 'test@domain.com';
    const invalidEmail = 'testdomain.com';
    expect(validateLogin({ email: validEmail, password: 'password' })).toBe(true);
    expect(validateLogin({ email: invalidEmail, password: 'password' })).toBe(false);
  });

  it('debería validar que la contraseña no esté vacía', () => {
    expect(validateLogin({ email: 'test@domain.com', password: 'password' })).toBe(true);
    expect(validateLogin({ email: 'test@domain.com', password: '' })).toBe(false);
  });

  it('debería validar la combinación de email y contraseña', () => {
    expect(validateLogin({ email: 'test@domain.com', password: 'password' })).toBe(true);
    expect(validateLogin({ email: 'invalid-email', password: '' })).toBe(false);
  });
});

