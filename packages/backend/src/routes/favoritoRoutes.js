const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/toggle/:lugarId', favoritoController.toggle);
router.get('/verificar/:lugarId', favoritoController.verificar);
router.get('/mis-favoritos', favoritoController.getFavoritos);

module.exports = router;