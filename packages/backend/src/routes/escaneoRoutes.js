// routes/escaneoRoutes.js
const express = require('express');
const router = express.Router();
const escaneoController = require('../controllers/escaneoController');
const authMiddleware = require('../middleware/auth');

// Ruta pública (para escanear QR)
router.post('/', escaneoController.registrar);

// Rutas protegidas (solo admin)
router.get('/estadisticas', authMiddleware, escaneoController.getEstadisticas);
router.get('/visitantes-unicos', authMiddleware, escaneoController.getVisitantesUnicos); // ← NUEVA

module.exports = router;