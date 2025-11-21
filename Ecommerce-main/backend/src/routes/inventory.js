// src/routes/inventory.js
import { Router } from 'express';
import { getInventory, getProductById, addProduct, updateInventory, removeProduct } from '../controllers/inventoryController.js';

const router = Router();

// Obtener todos los productos del inventario
router.get('/', getInventory);

// Obtener un producto por id
router.get("/:id_producto", getProductById);

// Agregar un nuevo producto al inventario
router.post('/add', addProduct);

// Actualizar inventario despues de un pedido
router.put('/update', updateInventory);

// Eliminar un producto del inventario
router.delete('/remove/:id_producto', removeProduct);

export default router;
