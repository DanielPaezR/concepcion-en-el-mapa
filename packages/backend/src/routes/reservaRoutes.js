// routes/reservaRoutes.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/auth');

// Ruta PÚBLICA - no requiere autenticación
router.get('/disponibles', reservaController.getGuiasDisponibles);
router.post('/', reservaController.create);

// Todas las demás rutas requieren autenticación
router.use(authMiddleware);

router.get('/', reservaController.getAll);
router.get('/:id', reservaController.getById);
router.put('/:id/asignar-guia', reservaController.asignarGuia);
router.patch('/:id/estado', reservaController.updateEstado);

module.exports = router;
