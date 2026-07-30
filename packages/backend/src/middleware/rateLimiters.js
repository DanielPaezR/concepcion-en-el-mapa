// middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

// Login: pocos intentos por IP, para frenar fuerza bruta de contraseñas.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' }
});

// Registro (incluye el registro anónimo por dispositivo): más laxo que login
// porque turistas reales lo llaman al abrir la app, pero igual con techo.
const registroLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes de registro. Intenta de nuevo en unos minutos.' }
});

module.exports = { loginLimiter, registroLimiter };
