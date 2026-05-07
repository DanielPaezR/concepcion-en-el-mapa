const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const descubrimientoController = require('../controllers/descubrimientoController');

router.use(authMiddleware);

router.get('/mis-descubrimientos', descubrimientoController.getMisDescubrimientos);
router.post('/registrar', descubrimientoController.registrar);

module.exports = router;
