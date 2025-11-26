/**
 * @file auth.integration.test.js
 * @description Pruebas de integración para el módulo de autenticación (API + BD real).
 */

import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/db.js';

describe('Pruebas de integración - Auth (API + BD)', () => {
  const email = 'int_auth@miari.pe';
  const password = '123456';
  const nombre = 'Usuario Integración Auth';

  beforeAll(async () => {
    // Limpieza por si el usuario quedó de una ejecución anterior
    await pool.query('DELETE FROM usuarios WHERE correo_usuario = ?', [email]);
  });

  afterAll(async () => {
    // Limpieza final
    await pool.query('DELETE FROM usuarios WHERE correo_usuario = ?', [email]);
  });

  test('INT-AUTH-01: Registrar e iniciar sesión contra la BD real', async () => {
    // 1) Registro
    const resRegister = await request(app)
      .post('/api/auth/register')
      .send({ nombre, email, password });

    expect(resRegister.statusCode).toBe(201);
    expect(resRegister.body).toHaveProperty('mensaje');

    // 2) Login
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(resLogin.statusCode).toBe(200);
    expect(resLogin.body).toHaveProperty('token');
    expect(resLogin.body).toHaveProperty('user');
    expect(resLogin.body.user.correo_usuario).toBe(email);

    // 3) Verificación directa en BD
    const rows = await pool.query(
      'SELECT * FROM usuarios WHERE correo_usuario = ?',
      [email]
    );
    expect(rows.length).toBe(1);
  });

  test('INT-AUTH-02: Rechazar login con contraseña incorrecta', async () => {
    // Aquí asumimos que el usuario ya fue creado en INT-AUTH-01
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'clave_incorrecta' });

    // Normalmente será 400 o 401 según tu implementación
    expect([400, 401]).toContain(resLogin.statusCode);
    expect(resLogin.body).not.toHaveProperty('token');
  });

  test('INT-AUTH-03: Evitar registro duplicado con el mismo correo', async () => {
    // El usuario ya existe desde INT-AUTH-01, así que este registro debe fallar
    const resRegister2 = await request(app)
      .post('/api/auth/register')
      .send({ nombre, email, password });

    // Debería rechazar el duplicado: 400 o 409
    expect([400, 409]).toContain(resRegister2.statusCode);
  });
});
