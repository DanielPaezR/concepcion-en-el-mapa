// routes/encuestaRoutes.js
const express = require('express');
const router = express.Router();
const encuestaController = require('../controllers/encuestaController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para encuestas
router.post('/', encuestaController.create);
router.get('/', encuestaController.getAll);
router.get('/estadisticas', encuestaController.getEstadisticas);
router.get('/reserva/:reserva_id', encuestaController.getByReserva);

module.exports = router;