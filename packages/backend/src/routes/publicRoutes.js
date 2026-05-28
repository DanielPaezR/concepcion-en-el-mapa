const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/avatares-guias', publicController.getAvataresGuias);

module.exports = router;
