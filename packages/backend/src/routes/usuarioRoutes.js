// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { requirePermiso } = require('../services/permisosService');

// El admin puede actuar sobre cualquier usuario; los demás solo sobre sí mismos
// (ej. el guía consultando su perfil o cambiando su disponibilidad en PanelGuia).
const requireSelfOrAdmin = (req, res, next) => {
    if (req.user.rol === 'admin' || String(req.user.id) === String(req.params.id)) {
        return next();
    }
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
};

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de usuarios
router.get('/', requireRole('admin'), requirePermiso('guias'), usuarioController.listar);
router.post('/', requireRole('admin'), requirePermiso('guias'), usuarioController.crearGuia);           // Crear nuevo guía

// =============================================
// NUEVAS RUTAS PARA SEGUIMIENTO DE HORAS Y UBICACIONES
// =============================================
router.post('/sesion/iniciar', requireRole('guia'), usuarioController.iniciarSesion);
router.post('/sesion/finalizar', requireRole('guia'), usuarioController.finalizarSesion);
router.get('/sesiones/estadisticas', requireRole('admin'), requirePermiso('metricas'), usuarioController.estadisticasSesiones);
router.get('/sesiones/detalle/:guiaId', requireRole('admin'), requirePermiso('metricas'), usuarioController.detalleSesiones);
router.get('/ubicaciones', requireRole('admin'), usuarioController.getGuiasUbicaciones);
router.get('/guias/ubicaciones', requireRole('admin'), usuarioController.getGuiasUbicaciones);

// Rutas de usuario individual
router.get('/:id', requireSelfOrAdmin, usuarioController.obtenerPorId);
router.patch('/:id/disponibilidad', requireSelfOrAdmin, usuarioController.cambiarDisponibilidad);
router.patch('/:id/calificacion', requireRole('admin'), usuarioController.actualizarCalificacion);
router.put('/:id', requireRole('admin'), requirePermiso('guias'), usuarioController.actualizarGuia);    // Actualizar guía
router.delete('/:id', requireRole('admin'), requirePermiso('guias'), usuarioController.eliminarGuia);   // Eliminar guía

module.exports = router;
