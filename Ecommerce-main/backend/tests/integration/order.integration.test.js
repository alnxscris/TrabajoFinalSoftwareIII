/**
 * @file order.integration.test.js
 * @description Pruebas de integración para el módulo de pedidos (API + lógica + BD real).
 */

import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/db.js';

describe('Pruebas de integración - Pedidos (API + lógica + BD)', () => {
  const email = 'int_order@miari.pe';
  const password = '123456';
  const nombre = 'Usuario Integración Pedido';

  let idUsuario;
  let idDestinatario;
  let idProducto;

  beforeAll(async () => {
    // 1) Limpieza previa completa del usuario si existiera
    const existing = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo_usuario = ?',
      [email]
    );

    if (existing.length > 0) {
      const idU = existing[0].id_usuario;

      await pool.query(
        'DELETE FROM items_pedido WHERE id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_usuario = ?)',
        [idU]
      );
      await pool.query('DELETE FROM pedidos WHERE id_usuario = ?', [idU]);
      await pool.query('DELETE FROM destinatarios WHERE id_usuario = ?', [idU]);
      await pool.query('DELETE FROM carritos WHERE id_usuario = ?', [idU]);
      await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [idU]);
    }

    // 2) Registrar usuario vía API
    const resRegister = await request(app)
      .post('/api/auth/register')
      .send({ nombre, email, password });

    expect(resRegister.statusCode).toBe(201);

    const rowsUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo_usuario = ?',
      [email]
    );
    idUsuario = rowsUser[0].id_usuario;

    // 3) Crear destinatario de prueba mediante la API
    const resDest = await request(app)
      .post('/api/destinatarios/create')
      .send({
        id_usuario: idUsuario,
        nombre_destinatario: 'Destinatario INT',
        direccion_destinatario: 'Av. Integración 123',
        celular_destinatario: '900000111'
      });

    expect(resDest.statusCode).toBe(201);
    expect(resDest.body).toHaveProperty('id_destinatario');
    idDestinatario = resDest.body.id_destinatario;

    // 4) Crear producto de prueba en la BD
    const resultProd = await pool.query(
      `INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock)
       VALUES (?, ?, ?, ?)`,
      [
        'Producto INT Pedido',
        'Producto para pruebas de integración de pedido',
        80.0,
        10
      ]
    );
    idProducto = Number(resultProd.insertId);
  });

  afterAll(async () => {
    if (idUsuario) {
      await pool.query(
        'DELETE FROM items_pedido WHERE id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_usuario = ?)',
        [idUsuario]
      );
      await pool.query('DELETE FROM pedidos WHERE id_usuario = ?', [idUsuario]);
      await pool.query('DELETE FROM destinatarios WHERE id_usuario = ?', [idUsuario]);
      await pool.query('DELETE FROM carritos WHERE id_usuario = ?', [idUsuario]);
      await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [idUsuario]);
    }

    if (idProducto) {
      await pool.query('DELETE FROM productos WHERE id_producto = ?', [idProducto]);
    }
  });

  test('INT-ORDER-01: Crear un pedido descuenta stock y registra items en la BD real', async () => {
    // 1) Stock y precio inicial del producto
    const beforeRows = await pool.query(
      'SELECT stock, precio_producto FROM productos WHERE id_producto = ?',
      [idProducto]
    );
    const stockInicial = beforeRows[0].stock;
    const precio = beforeRows[0].precio_producto;
    const cantidad = 2;

    // Armamos array productos como lo espera createOrder:
    const productoPayload = {
      id_producto: idProducto,
      cantidad,
      precio_unitario: precio,
      subtotal: precio * cantidad
    };

    // 2) Crear pedido mediante la API
    const resOrder = await request(app)
      .post('/api/order/create')
      .send({
        id_usuario: idUsuario,
        id_destinatario: idDestinatario,
        fecha_entrega: new Date().toISOString(),
        productos: [productoPayload]
      });

    expect(resOrder.statusCode).toBe(201);
    expect(resOrder.body).toHaveProperty('id_pedido');
    const idPedido = resOrder.body.id_pedido;

    // 3) Verificar pedido en la BD
    const pedidos = await pool.query(
      'SELECT * FROM pedidos WHERE id_pedido = ?',
      [idPedido]
    );
    expect(pedidos.length).toBe(1);
    expect(pedidos[0].id_usuario).toBe(idUsuario);
    expect(pedidos[0].id_destinatario).toBe(idDestinatario);

    const totalEsperado = Number(precio) * cantidad;
    expect(Number(pedidos[0].total_pedido)).toBeCloseTo(totalEsperado, 2);

    // 4) Verificar items_pedido
    const items = await pool.query(
      'SELECT * FROM items_pedido WHERE id_pedido = ? AND id_producto = ?',
      [idPedido, idProducto]
    );
    expect(items.length).toBe(1);
    expect(items[0].cantidad).toBe(cantidad);

    // 5) Verificar stock actualizado en productos
    const afterRows = await pool.query(
      'SELECT stock FROM productos WHERE id_producto = ?',
      [idProducto]
    );
    expect(afterRows[0].stock).toBe(stockInicial - cantidad);
  });

  test('INT-ORDER-02: Crear pedido con múltiples productos calcula el total y descuenta stock de todos', async () => {
    // Creamos un segundo producto de prueba
    const prod2Res = await pool.query(
      `INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock)
       VALUES (?, ?, ?, ?)`,
      [
        'Producto INT Pedido 2',
        'Segundo producto para pruebas de integración de pedido',
        40.0,
        5
      ]
    );
    const idProducto2 = Number(prod2Res.insertId);

    // Leemos stock y precio de ambos productos antes del pedido
    const prod1Before = await pool.query(
      'SELECT stock, precio_producto FROM productos WHERE id_producto = ?',
      [idProducto]
    );
    const prod2Before = await pool.query(
      'SELECT stock, precio_producto FROM productos WHERE id_producto = ?',
      [idProducto2]
    );

    const stock1Inicial = prod1Before[0].stock;
    const precio1 = prod1Before[0].precio_producto;

    const stock2Inicial = prod2Before[0].stock;
    const precio2 = prod2Before[0].precio_producto;

    const cant1 = 1;
    const cant2 = 2;

    const productosPayload = [
      {
        id_producto: idProducto,
        cantidad: cant1,
        precio_unitario: precio1,
        subtotal: precio1 * cant1
      },
      {
        id_producto: idProducto2,
        cantidad: cant2,
        precio_unitario: precio2,
        subtotal: precio2 * cant2
      }
    ];

    // Crear pedido con ambos productos
    const resOrder = await request(app)
      .post('/api/order/create')
      .send({
        id_usuario: idUsuario,
        id_destinatario: idDestinatario,
        fecha_entrega: new Date().toISOString(),
        productos: productosPayload
      });

    expect(resOrder.statusCode).toBe(201);
    expect(resOrder.body).toHaveProperty('id_pedido');
    const idPedido = resOrder.body.id_pedido;

    // Verificar total del pedido
    const pedidos = await pool.query(
      'SELECT * FROM pedidos WHERE id_pedido = ?',
      [idPedido]
    );
    expect(pedidos.length).toBe(1);

    const totalEsperado =
      Number(precio1) * cant1 + Number(precio2) * cant2;

    expect(Number(pedidos[0].total_pedido)).toBeCloseTo(totalEsperado, 2);

    // Verificar items_pedido (deben existir 2 registros)
    const items = await pool.query(
      'SELECT * FROM items_pedido WHERE id_pedido = ?',
      [idPedido]
    );
    expect(items.length).toBe(2);

    // Verificar stock actualizado
    const prod1After = await pool.query(
      'SELECT stock FROM productos WHERE id_producto = ?',
      [idProducto]
    );
    const prod2After = await pool.query(
      'SELECT stock FROM productos WHERE id_producto = ?',
      [idProducto2]
    );

    expect(prod1After[0].stock).toBe(stock1Inicial - cant1);
    expect(prod2After[0].stock).toBe(stock2Inicial - cant2);

    // Limpieza del segundo producto (el primero lo borra el afterAll)
    await pool.query('DELETE FROM items_pedido WHERE id_producto = ?', [idProducto2]);
    await pool.query('DELETE FROM productos WHERE id_producto = ?', [idProducto2]);
  });
});
