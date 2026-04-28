const express = require('express');
const router = express.Router();
const encuestaController = require('../controllers/encuestaController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación (para obtener el usuario)
router.use(authMiddleware);

router.post('/', encuestaController.create);
router.get('/', encuestaController.getAll);
router.get('/reserva/:reservaId', encuestaController.getByReserva);

module.exports = router;