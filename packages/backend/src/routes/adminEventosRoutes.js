const express = require('express');
const router = express.Router();
const adminEventosController = require('../controllers/adminEventosController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol admin
router.use(authMiddleware);

// Preguntas
router.get('/preguntas', adminEventosController.getPreguntas);
router.post('/preguntas', adminEventosController.crearPregunta);
router.delete('/preguntas/:id', adminEventosController.eliminarPregunta);

// Ubicaciones
router.get('/ubicaciones', adminEventosController.getUbicaciones);
router.post('/ubicaciones', adminEventosController.crearUbicacion);
router.delete('/ubicaciones/:id', adminEventosController.eliminarUbicacion);

module.exports = router;