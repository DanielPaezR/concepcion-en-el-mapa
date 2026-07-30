// middleware/requireRole.js
// Debe usarse SIEMPRE después de authMiddleware (necesita req.user ya cargado).
//
// Uso:
//   router.use(authMiddleware);
//   router.post('/', requireRole('admin'), controller.create);
//
// Acepta uno o varios roles válidos:
//   requireRole('admin')
//   requireRole('admin', 'guia')

const requireRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                error: 'No tienes permisos para realizar esta acción',
                rol_requerido: rolesPermitidos,
                tu_rol: req.user.rol
            });
        }

        next();
    };
};

module.exports = requireRole;
