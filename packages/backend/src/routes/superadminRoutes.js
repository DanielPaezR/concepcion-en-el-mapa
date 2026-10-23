const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { visitaLimiter } = require('../middleware/rateLimiters');

// Pública: la app del turista registra visitas al abrirse
router.post('/visita', visitaLimiter, superadminController.registrarVisita);

// Solo el superadmin
router.use(authMiddleware);
router.use(requireRole('superadmin'));

router.get('/sistema', superadminController.sistema);
router.get('/visitas', superadminController.visitas);
router.get('/resumen', superadminController.resumen);
router.get('/equipo', superadminController.equipo);
router.put('/equipo/:id(\\d+)/permisos', superadminController.actualizarPermisos);

module.exports = router;
