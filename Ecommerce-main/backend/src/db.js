// src/db.js
import mariadb from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5
});

// Añadimos un método query directo para facilitar testing
pool.query = async (...args) => {
  const conn = await pool.getConnection();
  try {
    return await conn.query(...args);
  } finally {
    conn.release();
  }
};

export default pool;

