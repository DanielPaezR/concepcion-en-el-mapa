// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de usuarios
router.get('/', usuarioController.listar);
router.post('/', usuarioController.crearGuia);           // Crear nuevo guía

// =============================================
// NUEVAS RUTAS PARA SEGUIMIENTO DE HORAS Y UBICACIONES
// =============================================
router.post('/sesion/iniciar', usuarioController.iniciarSesion);
router.post('/sesion/finalizar', usuarioController.finalizarSesion);
router.get('/sesiones/estadisticas', usuarioController.estadisticasSesiones);
router.get('/sesiones/detalle/:guiaId', usuarioController.detalleSesiones);
router.get('/ubicaciones', usuarioController.getGuiasUbicaciones);
router.get('/guias/ubicaciones', usuarioController.getGuiasUbicaciones);

// Rutas de usuario individual
router.get('/:id', usuarioController.obtenerPorId);
router.patch('/:id/disponibilidad', usuarioController.cambiarDisponibilidad);
router.patch('/:id/calificacion', usuarioController.actualizarCalificacion);
router.put('/:id', usuarioController.actualizarGuia);    // Actualizar guía
router.delete('/:id', usuarioController.eliminarGuia);   // Eliminar guía

module.exports = router;