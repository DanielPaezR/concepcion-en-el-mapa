// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Verificar que el controlador se importó correctamente
console.log('📦 authController:', {
    login: typeof authController.login,
    verificar: typeof authController.verificar,
    register: typeof authController.register,
    perfil: typeof authController.perfil,
    listarUsuarios: typeof authController.listarUsuarios,
    actualizarUsuario: typeof authController.actualizarUsuario,
    cambiarDisponibilidad: typeof authController.cambiarDisponibilidad
});

// Rutas públicas (no requieren autenticación)
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/verificar', authMiddleware, authController.verificar);
router.get('/perfil', authMiddleware, authController.perfil);

// Rutas de admin (requieren autenticación y rol admin)
router.post('/register', authMiddleware, authController.register);
router.get('/usuarios', authMiddleware, authController.listarUsuarios);
router.put('/usuarios/:id', authMiddleware, authController.actualizarUsuario);

// Rutas de guía
router.patch('/disponibilidad', authMiddleware, authController.cambiarDisponibilidad);

module.exports = router;