const express = require('express');
const router = express.Router();
const descubrimientoController = require('../controllers/descubrimientoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/mis-descubrimientos', descubrimientoController.getMisDescubrimientos);

module.exports = router;
