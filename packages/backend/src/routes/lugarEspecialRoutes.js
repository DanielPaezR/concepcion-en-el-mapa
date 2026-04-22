// routes/lugarEspecialRoutes.js
const express = require('express');
const router = express.Router();
const lugarEspecialController = require('../controllers/lugarEspecialController');
const authMiddleware = require('../middleware/auth');

// Ruta pública (pero puede requerir auth opcional)
router.get('/', lugarEspecialController.obtener);

module.exports = router;