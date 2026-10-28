const express = require('express');
const router = express.Router();
const curiosidadController = require('../controllers/curiosidadController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');
const { requirePermiso } = require('../services/permisosService');

// Pública: curiosidades activas (el mapa solo muestra las cercanas)
router.get('/', curiosidadController.listar);

// Administración: admins y los guías a los que se les dé el acceso
router.use(authMiddleware);
router.use(requireRole('admin', 'guia'));
router.use(requirePermiso('curiosidades'));

router.get('/admin', curiosidadController.listarAdmin);
router.post('/', upload.single('imagen'), curiosidadController.crear);
router.put('/:id(\\d+)', upload.single('imagen'), curiosidadController.actualizar);
router.delete('/:id(\\d+)', curiosidadController.eliminar);

module.exports = router;
