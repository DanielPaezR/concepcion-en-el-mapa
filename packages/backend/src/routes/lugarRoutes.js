const express = require('express');
const router = express.Router();
const lugarController = require('../controllers/lugarController');

// Rutas públicas (sin autenticación por ahora)
router.get('/', lugarController.getAllLugares);
router.get('/:id', lugarController.getLugarById);
router.get('/tipo/:tipo', lugarController.getLugaresByTipo);

// Rutas de creación/edición (también públicas por ahora, para pruebas)
router.post('/', lugarController.createLugar);
router.put('/:id', lugarController.updateLugar);
router.delete('/:id', lugarController.deleteLugar);

module.exports = router;