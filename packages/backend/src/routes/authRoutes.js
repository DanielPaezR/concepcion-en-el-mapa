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


router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }
    
    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Generar nuevo token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Opcional: generar nuevo refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_REFRESH_SECRET,
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