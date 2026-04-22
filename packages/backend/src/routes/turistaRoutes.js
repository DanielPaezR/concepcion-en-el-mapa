const express = require('express');
const router = express.Router();
const turistaController = require('../controllers/turistaController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas (NO requieren autenticación)
router.post('/anonymous', turistaController.anonymous);
router.post('/register', turistaController.register);
router.post('/login', turistaController.login);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);
router.get('/progreso', turistaController.getProgreso);

module.exports = router;