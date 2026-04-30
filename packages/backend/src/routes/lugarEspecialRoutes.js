// routes/lugarEspecialRoutes.js
const express = require('express');
const router = express.Router();
const lugarEspecialController = require('../controllers/lugarEspecialController');
const authMiddleware = require('../middleware/auth');

// Ruta con autenticación para obtener el nivel del usuario
router.get('/', authMiddleware, lugarEspecialController.obtener);

module.exports = router;