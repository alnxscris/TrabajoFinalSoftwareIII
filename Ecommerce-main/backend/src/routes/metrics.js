import express from 'express';
const router = express.Router();

// GET /metrics
router.get('/', (req, res) => {
  res.json([
    { nodo_id: 1, cpu: 45, ram: 68, disco: 75 },
    { nodo_id: 2, cpu: 30, ram: 55, disco: 40 }
  ]);
});

export default router;
