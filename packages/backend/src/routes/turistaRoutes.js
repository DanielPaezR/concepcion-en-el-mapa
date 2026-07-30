const express = require('express');
const router = express.Router();
const turistaController = require('../controllers/turistaController');
const authMiddleware = require('../middleware/auth');
const { loginLimiter, registroLimiter } = require('../middleware/rateLimiters');

// Rutas públicas (NO requieren autenticación)
router.post('/anonymous', registroLimiter, turistaController.anonymous);
router.post('/register', registroLimiter, turistaController.register);
router.post('/login', loginLimiter, turistaController.login);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);
router.get('/progreso', turistaController.getProgreso);

module.exports = router;