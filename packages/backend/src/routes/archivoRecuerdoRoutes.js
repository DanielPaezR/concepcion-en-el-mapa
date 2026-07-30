// routes/archivoRecuerdoRoutes.js
const express = require('express');
const router = express.Router();
const archivoRecuerdoController = require('../controllers/archivoRecuerdoController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

router.use(authMiddleware);
router.use(requireRole('turista'));

router.post('/', upload.single('imagen'), archivoRecuerdoController.subir);
router.get('/mis-recuerdos', archivoRecuerdoController.misRecuerdos);

module.exports = router;
