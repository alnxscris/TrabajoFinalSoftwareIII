// src/controllers/orderController.js
import pool from '../db.js';
import { descontarStock } from './inventoryController.js'; // Aseguramos la actualizacion del inventario

// Crear un nuevo pedido
export const createOrder = async (req, res) => {
    const { id_usuario, id_destinatario, productos, fecha_entrega } = req.body; // productos es un array de {id_producto, cantidad}

    try {
        // Verificar si el usuario existe
        const usuario = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]);

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Verificar si el destinatario existe
        const destinatario = await pool.query('SELECT * FROM destinatarios WHERE id_destinatario = ? AND id_usuario = ?', [id_destinatario, id_usuario]);

        if (destinatario.length === 0) {
            return res.status(404).json({ mensaje: 'Destinatario no encontrado.' });
        }

        // Calcular el total del pedido
        let totalPedido = 0;
        for (let i = 0; i < productos.length; i++) {
            const producto = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [productos[i].id_producto]);

            if (producto.length === 0) {
                return res.status(404).json({ mensaje: `Producto con id ${productos[i].id_producto} no encontrado.` });
            }

            const precioProducto = producto[0].precio_producto;
            const cantidad = productos[i].cantidad;
            totalPedido += precioProducto * cantidad;

            // Verificar si hay suficiente stock
            const stockProducto = producto[0].stock;
            if (stockProducto < cantidad) {
                return res.status(400).json({ mensaje: `No hay suficiente stock para el producto ${producto[0].nombre_producto}.` });
            }

            // Actualizar el inventario despues de la compra
            await descontarStock(productos[i].id_producto, productos[i].cantidad);
        }
        
        // Convertir fecha a formato DATETIME: 'YYYY-MM-DD HH:MM:SS'
        const fechaEntregaMySQL = fecha_entrega 
            ? new Date(fecha_entrega).toISOString().slice(0, 19).replace('T', ' ')
            : null;

        // Insertar el pedido con la fecha de entrega
        const result = await pool.query(
            'INSERT INTO pedidos (id_usuario, id_destinatario, total_pedido, estado_pedido, fecha_entrega) VALUES (?, ?, ?, ?, ?)',
            [id_usuario, id_destinatario, totalPedido, 'CREADO', fechaEntregaMySQL] // ← Usar fecha_entrega
        );

        // Insertar los productos del pedido en la tabla 'items_pedido'
        const id_pedido = Number(result.insertId);
        for (let i = 0; i < productos.length; i++) {
            await pool.query(
                'INSERT INTO items_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [id_pedido, productos[i].id_producto, productos[i].cantidad, productos[i].precio_unitario, productos[i].subtotal]
            );
        }

        res.status(201).json({ mensaje: 'Pedido creado con éxito.', id_pedido});
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ mensaje: 'Error al crear el pedido.' });
    }
};

// Obtener los pedidos de un usuario
export const getUserOrders = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        // Obtener los pedidos del usuario
        const orders = await pool.query(
            'SELECT * FROM pedidos WHERE id_usuario = ?',
            [id_usuario]
        );

        if (orders.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron pedidos para este usuario.' });
        }

        res.status(200).json({ pedidos: orders });
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los pedidos del usuario.' });
    }
};

// Obtener los detalles de un pedido especifico
export const getOrderDetails = async (req, res) => {
    const { id_pedido } = req.params;

    try {
        // Obtener el pedido
        const order = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id_pedido]);

        if (order.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        }

        // Obtener los items del pedido
        const items = await pool.query(
            `SELECT p.nombre_producto, ip.cantidad, ip.precio_unitario, ip.subtotal 
       FROM items_pedido ip 
       JOIN productos p ON ip.id_producto = p.id_producto 
       WHERE ip.id_pedido = ?`,
            [id_pedido]
        );

        res.status(200).json({ pedido: order[0], items });
    } catch (error) {
        console.error('Error al obtener los detalles del pedido:', error);
        res.status(500).json({ mensaje: 'Error al obtener los detalles del pedido.' });
    }
};

// Actualizar el estado de un pedido
export const updateOrderStatus = async (req, res) => {
    const { id_pedido, estado_pedido } = req.body;

    try {
        // Verificar si el pedido existe
        const order = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id_pedido]);

        if (order.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        }

        // Actualizar el estado del pedido
        await pool.query('UPDATE pedidos SET estado_pedido = ? WHERE id_pedido = ?', [estado_pedido, id_pedido]);

        res.status(200).json({ mensaje: 'Estado del pedido actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el estado del pedido.' });
    }
};

//confirmar pago de un pedido
//(OJO: a traves del botón del front "Confirmar pedido") 
//en la bd se marcara como "CONFIRMADO" ya que en si es una simulacion de un 
//pago real que no se realizara en serio

export const confirmOrderPayment = async (req, res) => {
    const { id_pedido } = req.body;

    try {
        const pedido = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id_pedido]);

        if (pedido.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        }

        // Actualizamos el estado a CONFIRMADO
        await pool.query('UPDATE pedidos SET estado_pedido = ? WHERE id_pedido = ?', ['CONFIRMADO', id_pedido]);

        res.status(200).json({ mensaje: 'Pago confirmado correctamente.' });
    } catch (error) {
        console.error('Error al confirmar el pago:', error);
        res.status(500).json({ mensaje: 'Error al confirmar el pago.' });
    }
};