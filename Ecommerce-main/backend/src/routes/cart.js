// src/routes/cart.js
import { Router } from 'express';
import { getCart, addToCart, removeFromCart, updateQuantity } from '../controllers/cartController.js';

const router = Router();

// Obtener los productos en el carrito de un usuario, incluyendo el total
router.get('/:id_usuario', getCart);

// Agregar un producto al carrito
router.post('/add', addToCart);

// Eliminar un producto del carrito
router.delete('/remove/:id_usuario/:id_producto', removeFromCart);

// Actualizar la cantidad de un producto en el carrito
router.put('/update', updateQuantity);

export default router;
