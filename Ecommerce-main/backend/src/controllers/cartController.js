// src/controllers/cartController.js
import pool from '../db.js';

// Funcion para calcular el total del carrito
const calculateTotal = (items) => {
  // Sumar el total de todos los productos en el carrito
  const total = items.reduce((total, item) => {
    const subtotal = item.precio_producto * item.cantidad;
    return total + subtotal; 
  }, 0);

  // Redondear el total a dos decimales
  return total.toFixed(2); // Aquí se asegura que el total tenga 2 decimales
};

// Obtener los productos del carrito de un usuario, incluyendo el total
export const getCart = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    // Verificar si el usuario tiene un carrito
    const carrito = await pool.query('SELECT * FROM carritos WHERE id_usuario = ?', [id_usuario]);

    if (carrito.length === 0) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado para este usuario.' });
    }

    // Obtener los productos del carrito
    const items = await pool.query(
      `SELECT productos.id_producto, productos.nombre_producto, productos.precio_producto, 
      productos.imagen_url, items_carrito.cantidad 
      FROM items_carrito 
      JOIN productos ON items_carrito.id_producto = productos.id_producto 
      WHERE items_carrito.id_carrito = ?`,
      [carrito[0].id_carrito]
    );

    if (items.length === 0) {
      return res.status(404).json({ mensaje: 'El carrito esta vacio.' });
    }

    // Calcular el total del carrito
    const total = calculateTotal(items);

    res.status(200).json({ carrito: items, total });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos del carrito.' });
  }
};

// Agregar un producto al carrito
export const addToCart = async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  try {
    // Verificar si el usuario ya tiene un carrito
    let carrito = await pool.query('SELECT * FROM carritos WHERE id_usuario = ?', [id_usuario]);

    // Si el usuario no tiene carrito, creamos uno nuevo
    if (carrito.length === 0) {
      const result = await pool.query(
        'INSERT INTO carritos (id_usuario) VALUES (?)',
        [id_usuario]
      );
      carrito = await pool.query('SELECT * FROM carritos WHERE id_usuario = ?', [id_usuario]);
    }

    const id_carrito = carrito[0].id_carrito;

    // Verificar si el producto ya esta en el carrito
    const itemExistente = await pool.query(
      'SELECT * FROM items_carrito WHERE id_carrito = ? AND id_producto = ?',
      [id_carrito, id_producto]
    );

    if (itemExistente.length > 0) {
      // Si ya existe, actualizamos la cantidad
      await pool.query(
        'UPDATE items_carrito SET cantidad = cantidad + ? WHERE id_carrito = ? AND id_producto = ?',
        [cantidad, id_carrito, id_producto]
      );
      return res.status(200).json({ mensaje: 'Producto actualizado en el carrito.' });
    }

    // Si no existe, agregamos el producto al carrito
    await pool.query(
      'INSERT INTO items_carrito (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)',
      [id_carrito, id_producto, cantidad]
    );

    res.status(201).json({ mensaje: 'Producto agregado al carrito.' });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ mensaje: 'Error al agregar producto al carrito.' });
  }
};

// Eliminar un producto del carrito
export const removeFromCart = async (req, res) => {
  const { id_usuario, id_producto } = req.params;

  try {
    // Verificar si el usuario tiene un carrito
    const carrito = await pool.query('SELECT * FROM carritos WHERE id_usuario = ?', [id_usuario]);

    if (carrito.length === 0) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado para este usuario.' });
    }

    const id_carrito = carrito[0].id_carrito;

    // Verificar si el producto esta en el carrito
    const itemExistente = await pool.query(
      'SELECT * FROM items_carrito WHERE id_carrito = ? AND id_producto = ?',
      [id_carrito, id_producto]
    );

    if (itemExistente.length === 0) {
      return res.status(404).json({ mensaje: 'El producto no est� en el carrito.' });
    }

    // Eliminar el producto del carrito
    await pool.query(
      'DELETE FROM items_carrito WHERE id_carrito = ? AND id_producto = ?',
      [id_carrito, id_producto]
    );

    res.status(200).json({ mensaje: 'Producto eliminado del carrito.' });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto del carrito.' });
  }
};

// Actualizar la cantidad de un producto en el carrito
export const updateQuantity = async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;

  try {
    // Verificar si el usuario tiene un carrito
    const carrito = await pool.query('SELECT * FROM carritos WHERE id_usuario = ?', [id_usuario]);

    if (carrito.length === 0) {
      return res.status(404).json({ mensaje: 'Carrito no encontrado para este usuario.' });
    }

    const id_carrito = carrito[0].id_carrito;

    // Verificar si el producto esta en el carrito
    const itemExistente = await pool.query(
      'SELECT * FROM items_carrito WHERE id_carrito = ? AND id_producto = ?',
      [id_carrito, id_producto]
    );

    if (itemExistente.length === 0) {
      return res.status(404).json({ mensaje: 'El producto no est� en el carrito.' });
    }

    // Actualizar la cantidad del producto
    await pool.query(
      'UPDATE items_carrito SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?',
      [cantidad, id_carrito, id_producto]
    );

    res.status(200).json({ mensaje: 'Cantidad actualizada en el carrito.' });
  } catch (error) {
    console.error('Error al actualizar cantidad en el carrito:', error);
    res.status(500).json({ mensaje: 'Error al actualizar cantidad en el carrito.' });
  }
};