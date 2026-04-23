const express = require('express');
const router = express.Router();
const encuestaController = require('../controllers/encuestaController');
const auth = require('../middleware/auth'); // Importación directa ya que se exporta como función única

router.post('/', auth, encuestaController.create);
router.get('/reserva/:reserva_id', auth, encuestaController.getByReserva);

// Rutas administrativas (si usas un middleware de roles)
router.get('/estadisticas', auth, encuestaController.getEstadisticas);

module.exports = router;