// src/routes/order.js
import { Router } from 'express';
import { createOrder, getUserOrders, getOrderDetails, updateOrderStatus, confirmOrderPayment } from '../controllers/orderController.js';

const router = Router();

// Crear un nuevo pedido
router.post('/create', createOrder);

// Obtener los pedidos de un usuario
router.get('/user/:id_usuario', getUserOrders);

// Obtener los detalles de un pedido especifico
router.get('/details/:id_pedido', getOrderDetails);

// Actualizar el estado de un pedido
router.put('/update-status', updateOrderStatus);

// Confirmar pago
router.post('/confirmar-pago', confirmOrderPayment);

export default router;
