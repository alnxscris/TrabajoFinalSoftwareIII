/**
 * @file cart.controller.test.js
 * @description Pruebas unitarias para CartController
 */

import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/db.js';
import { jest } from '@jest/globals';

jest.mock('../../src/db.js');
pool.query = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  pool.query.mockReset();
});

// ===============================================================
//  GET CART
// ===============================================================
describe('CartController - GET CART', () => {

  test('Debe obtener el carrito correctamente con items y total', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // llamada 1
    pool.query.mockResolvedValueOnce([
      { precio_producto: 10, cantidad: 2 },
      { precio_producto: 5, cantidad: 1 }
    ]); // llamada 2

    const res = await request(app).get('/api/cart/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.carrito.length).toBe(2);
    expect(res.body.total).toBe("25.00");
  });

  test('Debe devolver 404 si el usuario no tiene carrito', async () => {

    pool.query.mockResolvedValueOnce([]); // llamada 1

    const res = await request(app).get('/api/cart/99');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toMatch(/Carrito no encontrado/i);
  });

  test('Debe devolver 404 si el carrito está vacío', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // llamada 1
    pool.query.mockResolvedValueOnce([]);                  // llamada 2

    const res = await request(app).get('/api/cart/1');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toMatch(/vacio/i);
  });

});

// ===============================================================
//  ADD TO CART
// ===============================================================
describe('CartController - ADD TO CART', () => {

  test('Debe crear un carrito si no existe y agregar producto', async () => {

    pool.query.mockResolvedValueOnce([]);                  // no carrito
    pool.query.mockResolvedValueOnce({ insertId: 1 });     // insert carrito
    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // volver a leer carrito
    pool.query.mockResolvedValueOnce([]);                  // item no existe
    pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // insert item

    const res = await request(app)
      .post('/api/cart/add')
      .send({ id_usuario: 1, id_producto: 10, cantidad: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Producto agregado al carrito.');
  });

  test('Debe actualizar la cantidad si el producto ya existe', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // carrito
    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // volver a leer
    pool.query.mockResolvedValueOnce([{ id_producto: 10 }]); // item existe
    pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // update

    const res = await request(app)
      .post('/api/cart/add')
      .send({ id_usuario: 1, id_producto: 10, cantidad: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/actualizado/i);
  });

});

// ===============================================================
//  REMOVE FROM CART
// ===============================================================
describe('CartController - REMOVE FROM CART', () => {

  test('Debe eliminar un producto del carrito', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // carrito
    pool.query.mockResolvedValueOnce([{ id_producto: 10 }]); // item existe
    pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // delete

    const res = await request(app).delete('/api/cart/remove/1/10');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminado/i);
  });

  test('Debe devolver 404 si el carrito no existe', async () => {

    pool.query.mockResolvedValueOnce([]); // no carrito

    const res = await request(app).delete('/api/cart/remove/1/10');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toMatch(/Carrito no encontrado/i);
  });

  test('Debe devolver 404 si el producto no está', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // carrito existe
    pool.query.mockResolvedValueOnce([]);                 // item no existe

    const res = await request(app).delete('/api/cart/remove/1/10');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toMatch(/no est/i);
  });

});

// ===============================================================
//  UPDATE QUANTITY
// ===============================================================
describe('CartController - UPDATE QUANTITY', () => {

  test('Debe actualizar cantidad correctamente', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // carrito
    pool.query.mockResolvedValueOnce([{ id_producto: 10 }]); // item existe
    pool.query.mockResolvedValueOnce({ affectedRows: 1 }); // update

    const res = await request(app)
      .put('/api/cart/update')
      .send({ id_usuario: 1, id_producto: 10, cantidad: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/actualizada/i);
  });

  test('Debe devolver 404 si el carrito no existe', async () => {

    pool.query.mockResolvedValueOnce([]); // no carrito

    const res = await request(app)
      .put('/api/cart/update')
      .send({ id_usuario: 1, id_producto: 10, cantidad: 5 });

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toMatch(/Carrito no encontrado/i);
  });

  test('Debe devolver 404 si el producto no existe', async () => {

    pool.query.mockResolvedValueOnce([{ id_carrito: 1 }]); // carrito
    pool.query.mockResolvedValueOnce([]);                 // item vacío

    const res = await request(app)
      .put('/api/cart/update')
      .send({ id_usuario: 1, id_producto: 10, cantidad: 5 });

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toMatch(/no est/i);
  });

});
