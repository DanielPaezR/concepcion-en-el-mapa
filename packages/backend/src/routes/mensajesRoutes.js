const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajesController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // Todas las rutas requieren autenticación

router.get('/conversaciones', mensajesController.obtenerConversaciones);
router.get('/reserva/:reservaId', mensajesController.obtenerMensajes);
router.post('/enviar', mensajesController.enviarMensaje);

module.exports = router;