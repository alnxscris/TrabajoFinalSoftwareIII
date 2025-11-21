import { api } from "./api";

//registrar nuevo usuario
export const registerUser = async (data) => {
  try {
    const res = await api.post("/api/auth/register", data);
    return res;
  } catch (err) {
    throw err.mensaje ? err : { mensaje: "Error desconocido al registrar"};
  }
};

//iniciar sesión
export const loginUser = async (data) => {
  try {
    const res = await api.post("/api/auth/login", data);

    //guarda el token en localStorage
    if (res.token) {
      localStorage.setItem("token", res.token);
    }
    return res;
  } catch (err) {
    throw err.mensaje ? err : { mensaje: "Error desconocido al iniciar sesión." };
  }
};

//obtener token actual
export const getToken = () => localStorage.getItem("token");

//cerrar sesión
export const logout = () => localStorage.removeItem("token");