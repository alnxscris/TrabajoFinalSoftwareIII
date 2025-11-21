// src/controllers/destinatarioController.js
import pool from "../db.js";

// Crear un nuevo destinatario
export const createDestinatario = async (req, res) => {
  const { id_usuario, nombre_destinatario, direccion_destinatario, celular_destinatario } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO destinatarios (id_usuario, nombre_destinatario, direccion_destinatario, celular_destinatario) VALUES (?, ?, ?, ?)",
      [id_usuario, nombre_destinatario, direccion_destinatario, celular_destinatario]
    );
    
    const id_destinatario = Number(result.insertId);

    res.status(201).json({ mensaje: "Destinatario creado con éxito.", id_destinatario: id_destinatario });
  } catch (error) {
    console.error("Error al crear destinatario:", error);
    res.status(500).json({ mensaje: "Error al crear destinatario." });
  }
};
