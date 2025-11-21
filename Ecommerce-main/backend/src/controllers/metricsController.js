//esto se borrara (creo)
// src/controllers/metricsController.js
import pool from '../db.js';

export const registrarMetrica = async (req, res) => {
  const { nodo_id, cpu, ram, disco } = req.body;
  try {
    await pool.query('INSERT INTO metricas (nodo_id, cpu, ram, disco) VALUES (?, ?, ?, ?)',
      [nodo_id, cpu, ram, disco]);
    res.json({ status: 'Métrica registrada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const obtenerMetricas = async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM metricas ORDER BY fecha DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
