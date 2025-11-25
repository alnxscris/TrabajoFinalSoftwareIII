// tests/unit/order.controller.test.js
import { jest } from '@jest/globals';

// === Mocks globales de la BD e inventario ===
const mockQuery = jest.fn();
const mockDescontarStock = jest.fn();

// Mock del pool de MariaDB
jest.unstable_mockModule('../../src/db.js', () => ({
  default: { query: mockQuery },
}));

// Mock de la función descontarStock del inventoryController
jest.unstable_mockModule('../../src/controllers/inventoryController.js', () => ({
  descontarStock: mockDescontarStock,
}));

// Importamos el controlador ya con los mocks aplicados
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  confirmOrderPayment,
} = await import('../../src/controllers/orderController.js');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// Helper para simular res de Express
const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  mockQuery.mockReset();
  mockDescontarStock.mockReset();
});

//
// ==================== TESTS createOrder ====================
//
describe('OrderController - createOrder', () => {
  test('debe crear el pedido correctamente cuando todo es válido', async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_destinatario: 10,
        fecha_entrega: '2025-12-01T10:00:00Z',
        productos: [
          {
            id_producto: 100,
            cantidad: 2,
            precio_unitario: 50,
            subtotal: 100,
          },
        ],
      },
    };
    const res = createRes();

    // Orden esperado de llamadas a pool.query dentro de createOrder:
    // 1) SELECT usuario
    // 2) SELECT destinatario
    // 3) SELECT producto
    // 4) INSERT pedido
    // 5) INSERT item_pedido
    mockQuery
      .mockResolvedValueOnce([{ id_usuario: 1 }]) // usuario
      .mockResolvedValueOnce([{ id_destinatario: 10, id_usuario: 1 }]) // destinatario
      .mockResolvedValueOnce([
        {
          id_producto: 100,
          nombre_producto: 'Producto demo',
          precio_producto: 50,
          stock: 10,
        },
      ]) // producto
      .mockResolvedValueOnce({ insertId: 123 }) // insert pedido
      .mockResolvedValueOnce({ affectedRows: 1 }); // insert item

    await createOrder(req, res);

    // Verificar respuesta
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: 'Pedido creado con éxito.',
        id_pedido: 123,
      }),
    );

    // Verificar que se descontó el stock
    expect(mockDescontarStock).toHaveBeenCalledTimes(1);
    expect(mockDescontarStock).toHaveBeenCalledWith(100, 2);
  });

  test('debe devolver 404 si el usuario no existe', async () => {
    const req = {
      body: {
        id_usuario: 999,
        id_destinatario: 10,
        fecha_entrega: '2025-12-01T10:00:00Z',
        productos: [],
      },
    };
    const res = createRes();

    mockQuery.mockResolvedValueOnce([]); // usuario no encontrado

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Usuario no encontrado.',
    });

    // No debería llamarse descontarStock
    expect(mockDescontarStock).not.toHaveBeenCalled();
  });

  test('debe devolver 404 si el destinatario no existe', async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_destinatario: 999,
        fecha_entrega: '2025-12-01T10:00:00Z',
        productos: [],
      },
    };
    const res = createRes();

    mockQuery
      .mockResolvedValueOnce([{ id_usuario: 1 }]) // usuario
      .mockResolvedValueOnce([]); // destinatario no encontrado

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Destinatario no encontrado.',
    });

    expect(mockDescontarStock).not.toHaveBeenCalled();
  });

  test('debe devolver 404 si algún producto no existe', async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_destinatario: 10,
        fecha_entrega: '2025-12-01T10:00:00Z',
        productos: [{ id_producto: 999, cantidad: 1 }],
      },
    };
    const res = createRes();

    mockQuery
      .mockResolvedValueOnce([{ id_usuario: 1 }]) // usuario
      .mockResolvedValueOnce([{ id_destinatario: 10, id_usuario: 1 }]) // destinatario
      .mockResolvedValueOnce([]); // producto no encontrado

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Producto con id 999 no encontrado.',
    });
  });

  test('debe devolver 400 si no hay stock suficiente', async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_destinatario: 10,
        fecha_entrega: '2025-12-01T10:00:00Z',
        productos: [{ id_producto: 100, cantidad: 5 }],
      },
    };
    const res = createRes();

    mockQuery
      .mockResolvedValueOnce([{ id_usuario: 1 }]) // usuario
      .mockResolvedValueOnce([{ id_destinatario: 10, id_usuario: 1 }]) // destinatario
      .mockResolvedValueOnce([
        {
          id_producto: 100,
          nombre_producto: 'Producto demo',
          precio_producto: 50,
          stock: 2, // stock insuficiente
        },
      ]);

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'No hay suficiente stock para el producto Producto demo.',
    });

    expect(mockDescontarStock).not.toHaveBeenCalled();
  });

  test('debe devolver 500 si ocurre un error inesperado', async () => {
    const req = {
      body: {
        id_usuario: 1,
        id_destinatario: 10,
        fecha_entrega: '2025-12-01T10:00:00Z',
        productos: [],
      },
    };
    const res = createRes();

    mockQuery.mockRejectedValueOnce(new Error('Error en la BD'));

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Error al crear el pedido.',
    });
  });
});

//
// ==================== TESTS getUserOrders ====================
//
describe('OrderController - getUserOrders', () => {
  test('debe devolver 200 con los pedidos del usuario', async () => {
    const req = { params: { id_usuario: 1 } };
    const res = createRes();

    const fakeOrders = [{ id_pedido: 1 }, { id_pedido: 2 }];

    mockQuery.mockResolvedValueOnce(fakeOrders);

    await getUserOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ pedidos: fakeOrders });
  });

  test('debe devolver 404 si el usuario no tiene pedidos', async () => {
    const req = { params: { id_usuario: 1 } };
    const res = createRes();

    mockQuery.mockResolvedValueOnce([]);

    await getUserOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'No se encontraron pedidos para este usuario.',
    });
  });

  test('debe devolver 500 si ocurre un error', async () => {
    const req = { params: { id_usuario: 1 } };
    const res = createRes();

    mockQuery.mockRejectedValueOnce(new Error('Error BD'));

    await getUserOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Error al obtener los pedidos del usuario.',
    });
  });
});

//
// ==================== TESTS getOrderDetails ====================
//
describe('OrderController - getOrderDetails', () => {
  test('debe devolver 200 con pedido e items', async () => {
    const req = { params: { id_pedido: 1 } };
    const res = createRes();

    const fakeOrder = [{ id_pedido: 1, total_pedido: 100 }];
    const fakeItems = [
      { nombre_producto: 'Prod 1', cantidad: 1, precio_unitario: 50, subtotal: 50 },
    ];

    mockQuery
      .mockResolvedValueOnce(fakeOrder) // pedido
      .mockResolvedValueOnce(fakeItems); // items

    await getOrderDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      pedido: fakeOrder[0],
      items: fakeItems,
    });
  });

  test('debe devolver 404 si el pedido no existe', async () => {
    const req = { params: { id_pedido: 1 } };
    const res = createRes();

    mockQuery.mockResolvedValueOnce([]);

    await getOrderDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Pedido no encontrado.',
    });
  });

  test('debe devolver 500 si ocurre un error', async () => {
    const req = { params: { id_pedido: 1 } };
    const res = createRes();

    mockQuery.mockRejectedValueOnce(new Error('Error BD'));

    await getOrderDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Error al obtener los detalles del pedido.',
    });
  });
});

//
// ==================== TESTS updateOrderStatus ====================
//
describe('OrderController - updateOrderStatus', () => {
  test('debe actualizar el estado del pedido correctamente', async () => {
    const req = { body: { id_pedido: 1, estado_pedido: 'ENVIADO' } };
    const res = createRes();

    mockQuery
      .mockResolvedValueOnce([{ id_pedido: 1, estado_pedido: 'CREADO' }]) // existe
      .mockResolvedValueOnce({ affectedRows: 1 }); // update

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Estado del pedido actualizado correctamente.',
    });
  });

  test('debe devolver 404 si el pedido no existe', async () => {
    const req = { body: { id_pedido: 1, estado_pedido: 'ENVIADO' } };
    const res = createRes();

    mockQuery.mockResolvedValueOnce([]); // no existe

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Pedido no encontrado.',
    });
  });

  test('debe devolver 500 si ocurre un error', async () => {
    const req = { body: { id_pedido: 1, estado_pedido: 'ENVIADO' } };
    const res = createRes();

    mockQuery.mockRejectedValueOnce(new Error('Error BD'));

    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Error al actualizar el estado del pedido.',
    });
  });
});

//
// ==================== TESTS confirmOrderPayment ====================
//
describe('OrderController - confirmOrderPayment', () => {
  test('debe confirmar el pago del pedido correctamente', async () => {
    const req = { body: { id_pedido: 1 } };
    const res = createRes();

    mockQuery
      .mockResolvedValueOnce([{ id_pedido: 1, estado_pedido: 'CREADO' }]) // existe
      .mockResolvedValueOnce({ affectedRows: 1 }); // update

    await confirmOrderPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Pago confirmado correctamente.',
    });
  });

  test('debe devolver 404 si el pedido no existe', async () => {
    const req = { body: { id_pedido: 1 } };
    const res = createRes();

    mockQuery.mockResolvedValueOnce([]); // no existe

    await confirmOrderPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Pedido no encontrado.',
    });
  });

  test('debe devolver 500 si ocurre un error', async () => {
    const req = { body: { id_pedido: 1 } };
    const res = createRes();

    mockQuery.mockRejectedValueOnce(new Error('Error BD'));

    await confirmOrderPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Error al confirmar el pago.',
    });
  });
});
