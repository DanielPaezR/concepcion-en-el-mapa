const express = require('express');
const router = express.Router();
const galeriaController = require('../controllers/galeriaController');
const authMiddleware = require('../middleware/auth');

router.get('/', galeriaController.listar);

router.use(authMiddleware);
router.post('/', galeriaController.upload, galeriaController.subirFoto);
router.post('/:id/like', galeriaController.darLike);
router.post('/:id/comentarios', galeriaController.comentar);
router.get('/:id/comentarios', galeriaController.obtenerComentarios);

module.exports = router;