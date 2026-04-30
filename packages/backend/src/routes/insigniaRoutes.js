// routes/insigniaRoutes.js
const express = require('express');
const router = express.Router();
const insigniaController = require('../controllers/insigniaController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/', insigniaController.listar);

// Rutas protegidas
router.use(authMiddleware);
router.get('/mis-insignias', insigniaController.misInsignias);
router.get('/nuevas', insigniaController.nuevas);

module.exports = router;
