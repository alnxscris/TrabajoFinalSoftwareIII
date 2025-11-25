import { jest } from "@jest/globals";

/**
 * TEST UNITARIO – inventoryController.js
 * Versión final, rutas corregidas, mocks estables y console.error oculto
 */


const mockQuery = jest.fn();
jest.unstable_mockModule("../../src/db.js", () => ({
  default: { query: mockQuery }
}));

const { default: app } = await import("../../src/app.js");
const request = (await import("supertest")).default;

describe("InventoryController – Pruebas Unitarias", () => {

  // Ocultar todos los console.error de los controladores
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => jest.clearAllMocks());

  // ============================================================
  // 1. GET INVENTORY
  // ============================================================

  test("GET /api/inventory → devuelve inventario y secciones (correcto)", async () => {
    mockQuery.mockResolvedValue([
      { id_producto: 1, nombre_producto: "Ramo Rosas", categoria: "Flores" },
      { id_producto: 2, nombre_producto: "Teddy Mini", categoria: "Peluches" }
    ]);

    const res = await request(app).get("/api/inventory");

    expect(res.status).toBe(200);
    expect(res.body.inventario.length).toBe(2);
    expect(res.body.secciones.length).toBe(2);
  });

  test("GET /api/inventory → inventario vacío", async () => {
    mockQuery.mockResolvedValue([]);

    const res = await request(app).get("/api/inventory");

    expect(res.status).toBe(404);
    expect(res.body.mensaje).toBe("No hay productos en el inventario.");
  });

  test("GET /api/inventory → error interno", async () => {
    mockQuery.mockRejectedValue(new Error("DB Error"));

    const res = await request(app).get("/api/inventory");

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error al obtener el inventario.");
  });

  // ============================================================
  // 2. GET PRODUCT BY ID
  // ============================================================

  test("GET /api/inventory/:id_producto → encontrado", async () => {
    mockQuery.mockResolvedValue([
      { id_producto: 1, nombre_producto: "Rosa" }
    ]);

    const res = await request(app).get("/api/inventory/1");

    expect(res.status).toBe(200);
    expect(res.body.id_producto).toBe(1);
  });

  test("GET /api/inventory/:id_producto → no encontrado", async () => {
    mockQuery.mockResolvedValue([]);

    const res = await request(app).get("/api/inventory/999");

    expect(res.status).toBe(404);
    expect(res.body.mensaje).toBe("Producto no encontrado.");
  });

  test("GET /api/inventory/:id_producto → error interno", async () => {
    mockQuery.mockRejectedValue(new Error("DB Error"));

    const res = await request(app).get("/api/inventory/40");

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error interno al obtener producto.");
  });

  // ============================================================
  // 3. ADD PRODUCT
  // ============================================================

  test("POST /api/inventory/add → agregar producto OK", async () => {
    mockQuery
      .mockResolvedValueOnce([])                 // No existe
      .mockResolvedValueOnce({ insertId: 10 }); // Inserción

    const res = await request(app)
      .post("/api/inventory/add")
      .send({
        nombre_producto: "Caja Premium",
        descripcion_producto: "Caja regalo",
        precio_producto: 50,
        stock: 10,
        imagen_url: "img.jpg"
      });

    expect(res.status).toBe(201);
    expect(res.body.mensaje).toBe("Producto agregado al inventario.");
  });

  test("POST /api/inventory/add → producto ya existe", async () => {
    mockQuery.mockResolvedValue([{ id_producto: 1 }]);

    const res = await request(app)
      .post("/api/inventory/add")
      .send({ nombre_producto: "Caja Premium" });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBe("El producto ya existe en el inventario.");
  });

  test("POST /api/inventory/add → error interno", async () => {
    mockQuery.mockRejectedValue(new Error("DB Error"));

    const res = await request(app)
      .post("/api/inventory/add")
      .send({ nombre_producto: "Teddy Max" });

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error al agregar producto al inventario.");
  });

  // ============================================================
  // 4. UPDATE INVENTORY
  // ============================================================

  test("PUT /api/inventory/update → stock actualizado", async () => {
    mockQuery
      .mockResolvedValueOnce([{ id_producto: 1, stock: 10 }])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app)
      .put("/api/inventory/update")
      .send({ id_producto: 1, cantidad: 3 });

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe("Inventario actualizado correctamente.");
  });

  test("PUT /api/inventory/update → producto no encontrado", async () => {
    mockQuery.mockResolvedValue([]);

    const res = await request(app)
      .put("/api/inventory/update")
      .send({ id_producto: 99, cantidad: 1 });

    expect(res.status).toBe(404);
    expect(res.body.mensaje).toBe("Producto no encontrado en el inventario.");
  });

  test("PUT /api/inventory/update → stock insuficiente", async () => {
    mockQuery.mockResolvedValue([{ id_producto: 1, stock: 1 }]);

    const res = await request(app)
      .put("/api/inventory/update")
      .send({ id_producto: 1, cantidad: 5 });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBe("No hay suficiente stock para completar el pedido.");
  });

  test("PUT /api/inventory/update → error interno", async () => {
    mockQuery.mockRejectedValue(new Error("DB Error"));

    const res = await request(app)
      .put("/api/inventory/update")
      .send({ id_producto: 1, cantidad: 2 });

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error al actualizar el inventario.");
  });

  // ============================================================
  // 5. REMOVE PRODUCT
  // ============================================================

  test("DELETE /api/inventory/remove/:id_producto → eliminado correctamente", async () => {
    mockQuery
      .mockResolvedValueOnce([{ id_producto: 1 }])
      .mockResolvedValueOnce({ affectedRows: 1 });

    const res = await request(app).delete("/api/inventory/remove/1");

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe("Producto eliminado del inventario.");
  });

  test("DELETE /api/inventory/remove/:id_producto → no encontrado", async () => {
    mockQuery.mockResolvedValue([]);

    const res = await request(app).delete("/api/inventory/remove/100");

    expect(res.status).toBe(404);
    expect(res.body.mensaje).toBe("Producto no encontrado en el inventario.");
  });

  test("DELETE /api/inventory/remove/:id_producto → error interno", async () => {
    mockQuery.mockRejectedValue(new Error("DB Error"));

    const res = await request(app).delete("/api/inventory/remove/5");

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error al eliminar producto del inventario.");
  });

});
