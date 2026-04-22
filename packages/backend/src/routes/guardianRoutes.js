const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/guardianController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.get('/cercanos', guardianController.getGuardianesCercanos);
router.get('/perfil/:usuarioId', guardianController.getPerfil);

// Rutas protegidas
router.use(authMiddleware);
router.get('/mis-insignias', guardianController.getInsignias);
router.put('/perfil', guardianController.updatePerfil);
router.post('/anclar', guardianController.anclarGuardian);
router.post('/visitar/:guardianId', guardianController.visitarGuardian);

module.exports = router;