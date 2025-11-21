// testDB.js
import pool from './src/db.js';

(async () => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT NOW() AS fecha_actual');
    console.log('Conexión exitosa', rows);
    conn.release();
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    process.exit();
  }
})();