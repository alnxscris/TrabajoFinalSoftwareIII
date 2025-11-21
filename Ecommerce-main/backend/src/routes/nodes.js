import express from 'express';
const router = express.Router();

// GET /nodes
router.get('/', (req, res) => {
  res.json([
    { id: 1, nombre: 'Nodo Debian 01', estado: 'activo' },
    { id: 2, nombre: 'Nodo Ubuntu AWS', estado: 'activo' }
  ]);
});

export default router;
