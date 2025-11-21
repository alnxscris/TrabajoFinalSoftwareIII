import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import metricsRoutes from './routes/metrics.js';
import nodesRoutes from './routes/nodes.js';
import authRoutes from './routes/auth.js'; //autenticacion
import cartRoutes from './routes/cart.js'; //cart
import inventoryRoutes from './routes/inventory.js'; //inventory
import orderRoutes from './routes/order.js';  //order
import destinatariosRoutes from "./routes/destinatarios.js";

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
app.use("/api/destinatarios", destinatariosRoutes);

// Ruta de estado
app.get('/status', (req, res) => {
    res.json({ status: 'Servidor operativo y escuchando conexiones.' });
});

export default app;
