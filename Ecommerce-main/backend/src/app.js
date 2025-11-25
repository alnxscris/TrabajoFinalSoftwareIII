// src/app.js
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';

import metricsRoutes from './routes/metrics.js';
import authRoutes from './routes/auth.js';
import nodesRoutes from './routes/nodes.js';
import cartRoutes from './routes/cart.js';
import inventoryRoutes from './routes/inventory.js';
import orderRoutes from './routes/order.js';
import destinatariosRoutes from './routes/destinatarios.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/nodes', nodesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/destinatarios', destinatariosRoutes);

// Estado del backend
app.get('/status', (req, res) => {
  res.json({ status: 'Servidor operativo y escuchando conexiones.' });
});

export default app;
