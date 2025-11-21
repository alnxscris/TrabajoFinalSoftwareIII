// src/db.js
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config(); // ← ASÍ, SIN PATH

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
