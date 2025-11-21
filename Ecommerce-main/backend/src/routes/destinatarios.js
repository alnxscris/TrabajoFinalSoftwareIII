// src/routes/destinatarios.js
import { Router } from "express";
import { createDestinatario } from "../controllers/destinatarioController.js";

const router = Router();

// Crear destinatario
router.post("/create", createDestinatario);

export default router;