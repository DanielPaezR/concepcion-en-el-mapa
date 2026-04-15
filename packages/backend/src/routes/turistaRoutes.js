const express = require('express');
const router = express.Router();
const turistaController = require('../controllers/turistaController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.post('/anonymous', turistaController.anonymous);
router.post('/login', turistaController.login);

// Rutas protegidas
router.use(authMiddleware);
router.post('/register', turistaController.register);
router.get('/progreso', turistaController.getProgreso);

module.exports = router;