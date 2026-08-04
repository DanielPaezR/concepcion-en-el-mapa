// routes/comercioRoutes.js
const express = require('express');
const router = express.Router();
const comercioController = require('../controllers/comercioController');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

// Rutas públicas (turista viendo el mapa/ficha de un comercio)
router.get('/', comercioController.getAll);
router.get('/:id(\\d+)', comercioController.getById);
router.get('/:id(\\d+)/puedo-calificar', authMiddleware, requireRole('turista'), comercioController.puedoCalificar);
router.post('/:id(\\d+)/resenas', authMiddleware, requireRole('turista'), comercioController.crearResena);

// Solo admin: crear un comercio nuevo (cuenta + perfil)
router.post('/admin', authMiddleware, requireRole('admin'), comercioController.crearComercioAdmin);
router.get('/admin/todos', authMiddleware, requireRole('admin'), comercioController.listarTodosAdmin);
router.put('/admin/:id', authMiddleware, requireRole('admin'), comercioController.actualizarAdmin);

// Solo el dueño del comercio logueado
router.get('/mi-negocio', authMiddleware, requireRole('comercio'), comercioController.miNegocio);
router.get('/mi-negocio/recuerdos', authMiddleware, requireRole('comercio'), comercioController.misRecuerdosPendientes);
router.put('/mi-negocio', authMiddleware, requireRole('comercio'), upload.single('imagen'), comercioController.actualizarMiNegocio);
router.post('/mi-negocio/fotos', authMiddleware, requireRole('comercio'), upload.single('imagen'), comercioController.subirFoto);
router.delete('/mi-negocio/fotos/:fotoId', authMiddleware, requireRole('comercio'), comercioController.eliminarFoto);
router.get('/codigos/:codigo', authMiddleware, requireRole('comercio'), comercioController.validarCodigo);
router.post('/codigos/:codigo/canjear', authMiddleware, requireRole('comercio'), comercioController.canjearCodigo);

module.exports = router;
