// routes/metricasRoutes.js
const express = require('express');
const router = express.Router();
const metricasController = require('../controllers/metricasController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Todas las rutas requieren autenticación (solo admin)
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/estadisticas', metricasController.getEstadisticas);
router.get('/reservas-por-mes', metricasController.getReservasPorMes);
router.get('/lugares-top', metricasController.getLugaresTop);
router.get('/origen-turistas', metricasController.getOrigenTuristas);
router.get('/calificaciones-por-mes', metricasController.getCalificacionesPorMes);
router.get('/actividad-reciente', metricasController.getActividadReciente);
router.get('/visitas-por-dia', metricasController.getVisitasPorDia);

module.exports = router;