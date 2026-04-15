// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de usuarios
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obtenerPorId);
router.patch('/:id/disponibilidad', usuarioController.cambiarDisponibilidad);
router.patch('/:id/calificacion', usuarioController.actualizarCalificacion);

module.exports = router;