// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Agregar el usuario al request.
        // El superadmin es un admin con poderes extra: se expone como rol
        // 'admin' para que pase todas las comprobaciones existentes de admin,
        // y rolReal conserva 'superadmin' para las rutas exclusivas
        // (requireRole('superadmin')) y para saltarse los permisos.
        req.user = decoded;
        req.user.rolReal = decoded.rol;
        if (decoded.rol === 'superadmin') req.user.rol = 'admin';

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;