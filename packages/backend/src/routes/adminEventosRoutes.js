const express = require('express');
const router = express.Router();
const adminEventosController = require('../controllers/adminEventosController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { requirePermiso } = require('../services/permisosService');

// Todas las rutas requieren autenticación y ser admin o guía con permiso
router.use(authMiddleware);
router.use(requireRole('admin', 'guia'));
// Admins y guías con el permiso "retos" (que el superadmin da o quita)
router.use(requirePermiso('retos'));

// Retos vigentes y generación manual
router.get('/activos', adminEventosController.getRetosActivos);
router.post('/generar', adminEventosController.generarRetos);

// Preguntas
router.get('/preguntas', adminEventosController.getPreguntas);
router.post('/preguntas', adminEventosController.crearPregunta);
router.delete('/preguntas/:id', adminEventosController.eliminarPregunta);
router.put('/preguntas/:id', adminEventosController.actualizarPregunta);

// Ubicaciones
router.get('/ubicaciones', adminEventosController.getUbicaciones);
router.post('/ubicaciones', adminEventosController.crearUbicacion);
router.delete('/ubicaciones/:id', adminEventosController.eliminarUbicacion);
router.put('/ubicaciones/:id', adminEventosController.actualizarUbicacion);

module.exports = router;