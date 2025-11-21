//src/services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw data || { mensaje: "Error al obtener datos (GET)." };
    }
    return data;
  },
  post: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw json || { mensaje: "Error en la petición (POST)." };
    }
    return json;
  },
  //adicionamos para el inventario
  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json || { mensaje: "Error en la petición (PUT)." };
    return json;
  },
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw json || { mensaje: "Error en la petición (DELETE)." };
    return json;
  },
};