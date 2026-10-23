const express = require('express');
const router = express.Router();
const adminEventosController = require('../controllers/adminEventosController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const pool = require('../config/database');

// Los guías a los que el admin les dio puede_gestionar_eventos también
// administran los retos desde su panel (PanelGuia → "Gestión de eventos").
const requireGestorEventos = async (req, res, next) => {
    if (req.user.rol !== 'guia') return next();
    try {
        const r = await pool.query('SELECT COALESCE(puede_gestionar_eventos, false) AS puede FROM usuarios WHERE id = $1', [req.user.id]);
        if (r.rows[0]?.puede) return next();
        return res.status(403).json({ error: 'No tienes permiso para gestionar eventos' });
    } catch (error) {
        console.error('Error verificando permiso de eventos:', error);
        return res.status(500).json({ error: 'Error verificando permisos' });
    }
};

// Todas las rutas requieren autenticación y ser admin o guía con permiso
router.use(authMiddleware);
router.use(requireRole('admin', 'guia'));
router.use(requireGestorEventos);

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