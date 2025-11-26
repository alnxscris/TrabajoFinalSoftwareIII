/**
 * @file cart.integration.test.js
 * @description Pruebas de integración para el módulo de carrito (API + lógica + BD real).
 */

import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/db.js';

describe('Pruebas de integración - Carrito (API + lógica + BD)', () => {
  const email = 'int_cart@miari.pe';
  const password = '123456';
  const nombre = 'Usuario Integración Cart';

  let idUsuario;
  let idProducto;

  beforeAll(async () => {
    // 1) Limpieza previa del usuario (por si quedó de una ejecución anterior)
    await pool.query('DELETE FROM usuarios WHERE correo_usuario = ?', [email]);

    // 2) Crear usuario vía API de autenticación
    const resRegister = await request(app)
      .post('/api/auth/register')
      .send({ nombre, email, password });

    expect(resRegister.statusCode).toBe(201);

    // 3) Obtener id_usuario desde la BD real
    const rowsUser = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo_usuario = ?',
      [email]
    );
    idUsuario = rowsUser[0].id_usuario;

    // 4) Crear un producto de prueba directamente en la BD de pruebas
    const resultProd = await pool.query(
      `INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock)
       VALUES (?, ?, ?, ?)`,
      [
        'Producto INT Carrito',
        'Producto para pruebas de integración de carrito',
        50.0,
        10
      ]
    );
    idProducto = Number(resultProd.insertId);
  });

  afterAll(async () => {
    // Borrar usuario (borra carritos e items_carrito por ON DELETE CASCADE)
    await pool.query('DELETE FROM usuarios WHERE correo_usuario = ?', [email]);

    // Borrar producto de prueba por si quedó sin relaciones
    if (idProducto) {
      await pool.query('DELETE FROM items_pedido WHERE id_producto = ?', [idProducto]);
      await pool.query('DELETE FROM productos WHERE id_producto = ?', [idProducto]);
    }
  });

  test('INT-CART-01: Agregar y listar productos del carrito usando la API y la BD real', async () => {
    // 1) Agregar producto al carrito mediante la API
    const resAdd = await request(app)
      .post('/api/cart/add')
      .send({
        id_usuario: idUsuario,
        id_producto: idProducto,
        cantidad: 2
      });

    expect(resAdd.statusCode).toBe(201);
    expect(resAdd.body).toHaveProperty('mensaje');

    // 2) Obtener el carrito del usuario
    const resCart = await request(app)
      .get(`/api/cart/${idUsuario}`);

    expect(resCart.statusCode).toBe(200);
    expect(resCart.body).toHaveProperty('carrito');
    expect(resCart.body).toHaveProperty('total');

    const items = resCart.body.carrito;
    expect(Array.isArray(items)).toBe(true);

    const item = items.find((i) => i.id_producto === idProducto);
    expect(item).toBeDefined();
    expect(item.cantidad).toBe(2);

    // 3) Verificación directa en la BD (API + BD)
    const rows = await pool.query(
      `SELECT ic.cantidad
       FROM items_carrito ic
       JOIN carritos c ON c.id_carrito = ic.id_carrito
       WHERE c.id_usuario = ? AND ic.id_producto = ?`,
      [idUsuario, idProducto]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].cantidad).toBe(2);
  });

  test('INT-CART-02: Carrito vacío devuelve lista vacía y total 0 (o 404 si no existe carrito)', async () => {
    // Dejamos el carrito TOTALMENTE vacío para este usuario
    await pool.query(
      `DELETE ic FROM items_carrito ic
       JOIN carritos c ON c.id_carrito = ic.id_carrito
       WHERE c.id_usuario = ?`,
      [idUsuario]
    );


    // Consultar carrito de ese usuario (sin items / sin carrito)
    const resCart = await request(app)
      .get(`/api/cart/${idUsuario}`);

    // Tu API puede devolver 200 (carrito vacío) o 404 (carrito no encontrado)
    expect([200, 404]).toContain(resCart.statusCode);

    if (resCart.statusCode === 200) {
      expect(resCart.body).toHaveProperty('carrito');
      expect(resCart.body).toHaveProperty('total');
      expect(Array.isArray(resCart.body.carrito)).toBe(true);
      expect(resCart.body.carrito.length).toBe(0);
      expect(Number(resCart.body.total)).toBeCloseTo(0, 2);
    } else if (resCart.statusCode === 404) {

    }
  });

  test('INT-CART-03: Agregar dos veces el mismo producto suma cantidades en el carrito', async () => {
    // Dejamos el carrito limpio para este usuario
    await pool.query(
      `DELETE ic FROM items_carrito ic
       JOIN carritos c ON c.id_carrito = ic.id_carrito
       WHERE c.id_usuario = ?`,
      [idUsuario]
    );

    // Primera vez: cantidad 1
    const resAdd1 = await request(app)
      .post('/api/cart/add')
      .send({
        id_usuario: idUsuario,
        id_producto: idProducto,
        cantidad: 1
      });

    expect(resAdd1.statusCode).toBe(201);

    // Segunda vez: cantidad 3 (tu API puede devolver 200 si actualiza o 201 si inserta)
    const resAdd2 = await request(app)
      .post('/api/cart/add')
      .send({
        id_usuario: idUsuario,
        id_producto: idProducto,
        cantidad: 3
      });

    expect([200, 201]).toContain(resAdd2.statusCode);

    // Verificamos en la BD que la cantidad total sea 4
    const rows = await pool.query(
      `SELECT ic.cantidad
       FROM items_carrito ic
       JOIN carritos c ON c.id_carrito = ic.id_carrito
       WHERE c.id_usuario = ? AND ic.id_producto = ?`,
      [idUsuario, idProducto]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].cantidad).toBe(4);
  });
});
