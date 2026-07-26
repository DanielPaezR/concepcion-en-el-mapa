// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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
// Cambiar contraseña
router.post('/cambiar-password', authMiddleware, authController.cambiarPassword);

// Rutas de admin (requieren autenticación y rol admin)
router.post('/register', authMiddleware, authController.register);
router.get('/usuarios', authMiddleware, authController.listarUsuarios);
router.put('/usuarios/:id', authMiddleware, authController.actualizarUsuario);

// Rutas de guía
router.patch('/disponibilidad', authMiddleware, authController.cambiarDisponibilidad);



router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }
    
    // Verificar el refresh token (no existe un secreto de refresh separado configurado,
    // así que se reutiliza JWT_SECRET tanto para verificar como para firmar)
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Generar nuevo token, preservando el rol para no perder permisos al renovar
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, rol: decoded.rol, nombre: decoded.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Opcional: generar nuevo refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id, email: decoded.email, rol: decoded.rol, nombre: decoded.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
});

module.exports = router;