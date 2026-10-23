// routes/escaneoRoutes.js
const express = require('express');
const router = express.Router();
const escaneoController = require('../controllers/escaneoController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { requirePermiso } = require('../services/permisosService');

// Ruta pública (para escanear QR)
router.post('/', escaneoController.registrar);

// Rutas protegidas (solo admin)
router.get('/estadisticas', authMiddleware, requireRole('admin'), requirePermiso('metricas'), escaneoController.getEstadisticas);
router.get('/visitantes-unicos', authMiddleware, requireRole('admin'), requirePermiso('metricas'), escaneoController.getVisitantesUnicos); // ← NUEVA

module.exports = router;