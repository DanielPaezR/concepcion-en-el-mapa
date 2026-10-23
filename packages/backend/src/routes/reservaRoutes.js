// routes/reservaRoutes.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/auth');
const { requirePermiso } = require('../services/permisosService');

// Ruta PÚBLICA - no requiere autenticación
router.get('/disponibles', reservaController.getGuiasDisponibles);

// Todas las demás rutas requieren autenticación
router.use(authMiddleware);

router.post('/', reservaController.create);
// El permiso "reservas" solo filtra a admins: guías y turistas ven las suyas
router.get('/', requirePermiso('reservas'), reservaController.getAll);
router.get('/:id', reservaController.getById);
router.patch('/:id/estado', requirePermiso('reservas'), reservaController.updateEstado);

module.exports = router;
