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

pool.getConnection()
  .then(conn => {
    console.log("Conectado a la base de datos:", process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error("Error al conectar a la base de datos:", err.message);
  });

export default pool;