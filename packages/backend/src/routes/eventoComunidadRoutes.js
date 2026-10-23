const express = require('express');
const router = express.Router();
const eventoComunidadController = require('../controllers/eventoComunidadController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

// Pública: eventos vigentes para el mapa del turista
router.get('/', eventoComunidadController.listarActivos);

// Gestión: admin, guías (con permiso, se valida en el controlador) y comercios
router.use(authMiddleware);
router.use(requireRole('admin', 'guia', 'comercio'));

router.get('/gestion', eventoComunidadController.listarGestion);
router.post('/', upload.single('imagen'), eventoComunidadController.crear);
router.put('/:id(\\d+)', upload.single('imagen'), eventoComunidadController.actualizar);
router.delete('/:id(\\d+)', eventoComunidadController.eliminar);

module.exports = router;
