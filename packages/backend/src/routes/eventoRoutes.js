const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/activos', eventoController.getEventosActivos);
router.get('/meta-semanal', eventoController.getMetaSemanal);

// Rutas protegidas
router.use(authMiddleware);
router.get('/mis-estadisticas', eventoController.getMisEstadisticas); // ← AGREGAR
router.post('/completar', eventoController.completarEvento);

module.exports = router;