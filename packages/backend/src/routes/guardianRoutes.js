const express = require('express');
const router = express.Router();
const guardianController = require('../controllers/guardianController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Rutas públicas
router.get('/cercanos', guardianController.getGuardianesCercanos);
router.get('/perfil/:usuarioId', guardianController.getPerfil);

// Rutas protegidas - authMiddleware aplica a todo lo que sigue
router.use(authMiddleware);

router.get('/mis-insignias', guardianController.getInsignias);
router.put('/perfil', guardianController.updatePerfil);
router.post('/anclar', guardianController.anclarGuardian);
router.post('/visitar/:guardianId', guardianController.visitarGuardian);

// Subir foto - multer debe estar ANTES del controlador
router.post('/subir-foto', upload.single('foto'), guardianController.subirFoto);

module.exports = router;