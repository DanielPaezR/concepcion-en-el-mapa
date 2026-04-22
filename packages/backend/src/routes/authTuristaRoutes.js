// routes/authTuristaRoutes.js
const express = require('express');
const router = express.Router();
const authTuristaController = require('../controllers/authTuristaController');

// Ruta para autenticar turistas (sin necesidad de login manual)
router.post('/registro', authTuristaController.registrarTurista);
router.post('/registro-email', authTuristaController.registrarConEmail);
router.post('/login', authTuristaController.loginTurista);

module.exports = router;
