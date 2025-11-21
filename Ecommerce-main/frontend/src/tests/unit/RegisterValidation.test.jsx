// src/tests/unit/RegisterValidation.test.js
import { validateRegister } from '@/utils/validators'; // Ajuste de import

describe('validateRegister', () => {
  it('debería validar que el nombre sea válido (al menos 3 caracteres)', () => {
    expect(validateRegister({ name: 'Sebastian', email: 'test@domain.com', password: 'password' })).toBe(true);
    expect(validateRegister({ name: 'Se', email: 'test@domain.com', password: 'password' })).toBe(false);
  });

  it('debería validar que el email sea válido', () => {
    expect(validateRegister({ name: 'Sebastian', email: 'test@domain.com', password: 'password' })).toBe(true);
    expect(validateRegister({ name: 'Sebastian', email: 'invalid-email', password: 'password' })).toBe(false);
  });

  it('debería validar que la contraseña no esté vacía', () => {
    expect(validateRegister({ name: 'Sebastian', email: 'test@domain.com', password: 'password' })).toBe(true);
    expect(validateRegister({ name: 'Sebastian', email: 'test@domain.com', password: '' })).toBe(false);
  });

  it('debería fallar si algún campo está vacío', () => {
    expect(validateRegister({ name: '', email: '', password: '' })).toBe(false);
  });
});

