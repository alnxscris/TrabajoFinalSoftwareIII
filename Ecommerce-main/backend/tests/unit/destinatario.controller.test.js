import { jest } from '@jest/globals';
import request from 'supertest';

// =======================================
// 1) MOCK mariadb
// =======================================
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

// =======================================
// 2) MOCK db.js (usa el pool mockeado)
// =======================================
jest.unstable_mockModule('../../src/db.js', async () => {
  const mariadb = await import('mariadb');
  return {
    __esModule: true,
    default: mariadb.createPool()
  };
});

// =======================================
// 3) IMPORTS DINÁMICOS
// =======================================
const { default: pool } = await import('../../src/db.js');
const { default: app } = await import('../../src/app.js');
const requestSupertest = (await import('supertest')).default;

// =======================================
// 4) SILENCIAR console.error PARA NO VER ROJO
// =======================================
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// =======================================
// 5) TESTS DESTINATARIO
// =======================================
describe('DestinatarioController - CREATE', () => {

  beforeEach(() => jest.clearAllMocks());

  test('Debe crear un destinatario correctamente', async () => {

    pool.query.mockResolvedValueOnce({ insertId: 55 });

    const data = {
      id_usuario: 1,
      nombre_destinatario: 'Juan Perez',
      direccion_destinatario: 'Av Lima 123',
      celular_destinatario: '987654321'
    };

    const res = await requestSupertest(app)
      .post('/api/destinatarios/create')
      .send(data);

    expect(res.status).toBe(201);
    expect(res.body.mensaje).toBe('Destinatario creado con éxito.');
    expect(res.body.id_destinatario).toBe(55);
  });

  test('Debe devolver 500 si ocurre un error en BD', async () => {

    pool.query.mockRejectedValueOnce(new Error('DB Error'));

    const res = await requestSupertest(app)
      .post('/api/destinatarios/create')
      .send({
        id_usuario: 1,
        nombre_destinatario: 'Juan Perez',
        direccion_destinatario: 'Av Lima 123',
        celular_destinatario: '987654321'
      });

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toMatch(/Error al crear destinatario/i);
  });

});
