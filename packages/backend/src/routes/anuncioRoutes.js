const express = require('express');
const router = express.Router();
const anuncioController = require('../controllers/anuncioController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

// Pública: tablero de anuncios aprobados
router.get('/', anuncioController.listar);

router.use(authMiddleware);

// Moderación: solo el superadmin
router.get('/moderacion', requireRole('superadmin'), anuncioController.moderacion);
router.patch('/:id(\\d+)/aprobar', requireRole('superadmin'), anuncioController.aprobar);
router.patch('/:id(\\d+)/rechazar', requireRole('superadmin'), anuncioController.rechazar);

// Del usuario con cuenta
router.get('/mios', anuncioController.mios);
router.post('/', upload.single('imagen'), anuncioController.crear);
router.patch('/:id(\\d+)/completar', anuncioController.completar);
router.delete('/:id(\\d+)', anuncioController.eliminar);

module.exports = router;
