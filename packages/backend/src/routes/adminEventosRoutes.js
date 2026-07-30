const express = require('express');
const router = express.Router();
const adminEventosController = require('../controllers/adminEventosController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware);
router.use(requireRole('admin'));

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