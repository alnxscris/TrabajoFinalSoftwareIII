// src/controllers/inventoryController.js
import pool from '../db.js';

// Obtener todos los productos del inventario
export const getInventory = async (req, res) => {
    try {
        const productos = await pool.query('SELECT * FROM productos ORDER BY categoria, nombre_producto');

        if (productos.length === 0) {
            return res.status(404).json({ mensaje: 'No hay productos en el inventario.' });
        }

        // Agrupar por categoría
        const porCategoria = productos.reduce((acc, producto) => {
            const cat = producto.categoria || 'Otros regalos';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(producto);
            return acc;
        }, {});

        // Convertimos en un array de secciones
        const secciones = Object.entries(porCategoria).map(([categoria, items]) => ({
            title: categoria,
            items
        }));

        res.status(200).json({ inventario: productos, secciones });
    } catch (error) {
        console.error('Error al obtener el inventario:', error);
        res.status(500).json({ mensaje: 'Error al obtener el inventario.' });
    }
};

// Obtener producto por id
export const getProductById = async (req, res) => {
  const { id_producto } = req.params;
  try {
    const rows = await pool.query(
      "SELECT * FROM productos WHERE id_producto = ?",
      [id_producto]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ mensaje: "Error interno al obtener producto." });
  }
};

// Agregar un nuevo producto al inventario
export const addProduct = async (req, res) => {
    const { nombre_producto, descripcion_producto, precio_producto, stock, imagen_url } = req.body;

    try {
        // Verificamos si el producto ya existe en el inventario por su nombre
        const existingProduct = await pool.query('SELECT * FROM productos WHERE nombre_producto = ?', [nombre_producto]);

        if (existingProduct.length > 0) {
            return res.status(400).json({ mensaje: 'El producto ya existe en el inventario.' });
        }

        // Insertamos el nuevo producto en la tabla 'productos'
        await pool.query(
            'INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock, imagen_url) VALUES (?, ?, ?, ?, ?)',
            [nombre_producto, descripcion_producto, precio_producto, stock, imagen_url]
        );

        res.status(201).json({ mensaje: 'Producto agregado al inventario.' });
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ mensaje: 'Error al agregar producto al inventario.' });
    }
};

// Función para descontar stock
export const descontarStock = async (id_producto, cantidad) => {
  const [producto] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id_producto]);
  if (!producto) throw new Error("Producto no encontrado");
  if (producto.stock < cantidad) throw new Error("Stock insuficiente");

  await pool.query("UPDATE productos SET stock = stock - ? WHERE id_producto = ?", [cantidad, id_producto]);
};


// Actualizar el inventario despues de un pedido
export const updateInventory = async (req, res) => {
    const { id_producto, cantidad } = req.body;

    try {
        // Verificamos si el producto existe en el inventario
        const producto = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [id_producto]);

        if (producto.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado en el inventario.' });
        }

        // Verificamos si hay suficiente stock para realizar el pedido
        const currentStock = producto[0].stock;
        if (currentStock < cantidad) {
            return res.status(400).json({ mensaje: 'No hay suficiente stock para completar el pedido.' });
        }

        // Actualizamos el stock del producto en la tabla 'productos'
        await pool.query(
            'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
            [cantidad, id_producto]
        );

        res.status(200).json({ mensaje: 'Inventario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el inventario:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el inventario.' });
    }
};

// Eliminar un producto del inventario
export const removeProduct = async (req, res) => {
    const { id_producto } = req.params;

    try {
        // Verificamos si el producto existe en el inventario
        const producto = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [id_producto]);

        if (producto.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado en el inventario.' });
        }

        // Eliminamos el producto de la tabla 'productos'
        await pool.query('DELETE FROM productos WHERE id_producto = ?', [id_producto]);

        res.status(200).json({ mensaje: 'Producto eliminado del inventario.' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ mensaje: 'Error al eliminar producto del inventario.' });
    }
};