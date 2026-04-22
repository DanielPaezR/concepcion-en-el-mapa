// routes/lugarRoutes.js
const express = require('express');
const router = express.Router();
const lugarController = require('../controllers/lugarController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas públicas
router.get('/', lugarController.getAll);
router.get('/:id', lugarController.getById);

// Rutas protegidas (solo admin)
router.use(authMiddleware);
router.post('/', upload.single('imagen'), lugarController.create);
router.put('/:id', upload.single('imagen'), lugarController.update);
router.delete('/:id', lugarController.delete);

module.exports = router;