// src/services/cart.js
import { api } from "./api";

export async function addToCart(data) {
  return await api.post("/api/cart/add", data);
}

export async function getCart(id_usuario) {
  const { carrito, total } = await api.get(`/api/cart/${id_usuario}`);
  return { carrito, total: parseFloat(total) };
}

export async function updateCartItem(id_usuario, id_producto, cantidad) {
  await api.put("/api/cart/update", { id_usuario, id_producto, cantidad });
}

export async function removeCartItem(id_usuario, id_producto) {
  await api.delete(`/api/cart/remove/${id_usuario}/${id_producto}`);
}

export async function clearCart(id_usuario, carrito) {
  await Promise.all(carrito.map((p) => removeCartItem(id_usuario, p.id_producto)));
}