import { api } from "./api";

export const getInventory = async () => {
  return await api.get("/api/inventory");
};

export const getProductById = async (id_producto) => {
  return await api.get(`/api/inventory/${id_producto}`);
};

export const addProduct = async (data) => {
  return await api.post("/api/inventory/add", data);
};

export const updateInventory = async (data) => {
  return await api.put("/api/inventory/update", data);
};

export const removeProduct = async (id_producto) => {
  return await api.delete(`/api/inventory/remove/${id_producto}`);
};
