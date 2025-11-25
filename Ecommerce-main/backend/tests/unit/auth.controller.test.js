import { jest } from '@jest/globals';

/**
 * TESTS PARA REGISTER Y LOGIN
 * Compatible con ESM + Jest 30 + bcrypt
 */

// =============================
// 1) MOCK mariadb
// =============================
jest.unstable_mockModule('mariadb', () => ({
  __esModule: true,
  createPool: () => ({
    query: jest.fn(),
    getConnection: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn()
    })
  })
}));

// =============================
// 2) MOCK db.js (usa el mock de mariadb)
// =============================
jest.unstable_mockModule('../../src/db.js', async () => {
  const mariadb = await import('mariadb');
  return {
    __esModule: true,
    default: mariadb.createPool()
  };
});

// =============================
// 3) MOCK bcrypt - CORREGIDO ⭐
// =============================
jest.unstable_mockModule('bcrypt', () => ({
  __esModule: true,
  default: {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

// =============================
// 4) MOCK jsonwebtoken
// =============================
jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn().mockReturnValue("fake-token")
  }
}));

// ==========================================================
// IMPORTS DINÁMICOS
// ==========================================================
const { default: pool } = await import('../../src/db.js');
const { default: app } = await import('../../src/app.js');
const request = (await import('supertest')).default;
const bcrypt = (await import('bcrypt')).default;
const jwt = (await import('jsonwebtoken')).default;

// =============================
// 5) TESTS REGISTER
// =============================

describe('AuthController - REGISTER', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar mocks por defecto
    bcrypt.genSalt.mockResolvedValue('salt_mock');
    bcrypt.hash.mockResolvedValue('hash_mock');
    bcrypt.compare.mockResolvedValue(false);
  });

  test('Debe registrar un usuario correctamente', async () => {
    pool.query
      .mockResolvedValueOnce([])     // validar usuario repetido
      .mockResolvedValueOnce([])     // validar contraseñas existentes
      .mockResolvedValueOnce({ affectedRows: 1 }); // insert

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'demo',
        email: 'demo@demo.com',
        password: '123456'
      });

    expect(response.status).toBe(201);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'salt_mock');
  });

  test('Debe rechazar si correo o nombre ya existen', async () => {
    pool.query.mockResolvedValueOnce([{ id_usuario: 1 }]);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'demo',
        email: 'demo@demo.com',
        password: '123456'
      });

    expect(response.status).toBe(409);
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
  
  test('Debe rechazar si la contraseña ya fue usada', async () => {
    pool.query
      .mockResolvedValueOnce([]) // no existe correo / nombre
      .mockResolvedValueOnce([
        { contrasena_hash: 'hash1' },
        { contrasena_hash: 'hash2' }
      ]);

    bcrypt.compare.mockResolvedValueOnce(true);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'demo',
        email: 'demo@demo.com',
        password: '123456'
      });

    expect(response.status).toBe(400);
    expect(bcrypt.compare).toHaveBeenCalled();
  });
});

// =============================
// 6) TESTS LOGIN
// =============================

describe('AuthController - LOGIN', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    bcrypt.compare.mockResolvedValue(true);
  });

  test('Debe iniciar sesión correctamente', async () => {
    pool.query.mockResolvedValueOnce([
      { 
        id_usuario: 10, 
        nombre_usuario: 'demo', 
        correo_usuario: 'demo@demo.com', 
        contrasena_hash: 'hash' 
      }
    ]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@demo.com',
        password: '123456'
      });

    expect(response.status).toBe(200);
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash');
    expect(jwt.sign).toHaveBeenCalled();
  });

  test('Debe fallar si el correo no existe', async () => {
    pool.query.mockResolvedValueOnce([]);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no@existe.com', password: '123' });

    expect(response.status).toBe(400);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('Debe fallar si contraseña es incorrecta', async () => {
    pool.query.mockResolvedValueOnce([
      { 
        id_usuario: 1, 
        correo_usuario: 'demo@demo.com', 
        contrasena_hash: 'hash' 
      }
    ]);

    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@demo.com', password: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(bcrypt.compare).toHaveBeenCalledWith('incorrecta', 'hash');
  });
});