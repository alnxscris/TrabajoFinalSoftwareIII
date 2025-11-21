// src/tests/unit/CartCalculations.test.js
import { calculateTotal, calculateShipping } from '@/utils/cart'; // Ajuste de import

describe('calculateTotal', () => {
  it('debería calcular correctamente el total con items', () => {
    const items = [
      { price: 10, qty: 1 },
      { price: 20, qty: 2 }
    ];
    expect(calculateTotal(items)).toBe(50);
  });

  it('debería devolver 0 si no hay items en el carrito', () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe('calculateShipping', () => {
  it('debería calcular correctamente el envío si hay productos en el carrito', () => {
    expect(calculateShipping([{ price: 10, qty: 1 }])).toBe(7); // Ejemplo de tarifa de envío
  });

  it('debería devolver 0 si no hay productos', () => {
    expect(calculateShipping([])).toBe(0);
  });
});
