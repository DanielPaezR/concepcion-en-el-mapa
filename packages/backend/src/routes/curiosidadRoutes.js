const express = require('express');
const router = express.Router();
const curiosidadController = require('../controllers/curiosidadController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

// Pública: curiosidades activas (el mapa solo muestra las cercanas)
router.get('/', curiosidadController.listar);

// Administración
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/admin', curiosidadController.listarAdmin);
router.post('/', upload.single('imagen'), curiosidadController.crear);
router.put('/:id(\\d+)', upload.single('imagen'), curiosidadController.actualizar);
router.delete('/:id(\\d+)', curiosidadController.eliminar);

module.exports = router;
