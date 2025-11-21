// src/services/order.js
import { api } from "./api";

// Crear un nuevo pedido
export const createOrder = async (orderData) => {
  const res = await api.post("/api/order/create", orderData);
  return res.id_pedido;
};

// Obtener los pedidos de un usuario
export const getUserOrders = async (id_usuario) => {
  return await api.get(`/api/order/user/${id_usuario}`);
};

// Obtener los detalles de un pedido específico
export const getOrderDetails = async (id_pedido) => {
  return await api.get(`/api/order/details/${id_pedido}`);
};

// Actualizar el estado de un pedido (si algún día lo usas)
export const updateOrderStatus = async (id_pedido, estado_pedido) => {
  return await api.put("/api/order/estado", { id_pedido, estado_pedido });
};

// Confirmar pago
export const confirmOrderPayment = async (id_pedido) => {
  return await api.post("/api/order/confirmar-pago", { id_pedido });
};