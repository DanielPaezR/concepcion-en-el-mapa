// services/permisosService.js
// Permisos por usuario que el superadmin da y quita desde su panel.
// usuarios.permisos (JSON) guarda solo lo que el superadmin cambió; lo que no
// está definido toma el valor por defecto:
//   admin → todo permitido
//   guía  → retos y eventos del pueblo según puede_gestionar_eventos
const pool = require('../config/database');

const PERMISOS_ADMIN = {
    lugares: 'Lugares',
    comercios: 'Comercios',
    eventos_pueblo: 'Eventos del pueblo',
    curiosidades: 'Curiosidades',
    retos: 'Retos',
    reservas: 'Reservas',
    guias: 'Guías',
    encuestas: 'Encuestas',
    metricas: 'Dashboard y métricas',
};

const PERMISOS_GUIA = {
    retos: 'Gestionar retos',
    eventos_pueblo: 'Publicar eventos del pueblo',
};

function calcularPermisos(usuario) {
    if (!usuario) return {};
    const guardados = usuario.permisos || {};
    if (usuario.rol === 'superadmin') {
        return Object.fromEntries(Object.keys(PERMISOS_ADMIN).map((k) => [k, true]));
    }
    if (usuario.rol === 'admin') {
        return Object.fromEntries(Object.keys(PERMISOS_ADMIN).map((k) => [k, guardados[k] ?? true]));
    }
    if (usuario.rol === 'guia') {
        const base = !!usuario.puede_gestionar_eventos;
        return Object.fromEntries(Object.keys(PERMISOS_GUIA).map((k) => [k, guardados[k] ?? base]));
    }
    return {};
}

async function obtenerPermisos(usuarioId) {
    const r = await pool.query(
        'SELECT rol, permisos, COALESCE(puede_gestionar_eventos, false) AS puede_gestionar_eventos FROM usuarios WHERE id = $1',
        [usuarioId]
    );
    return calcularPermisos(r.rows[0]);
}

async function tienePermiso(user, clave) {
    if ((user.rolReal || user.rol) === 'superadmin') return true;
    const permisos = await obtenerPermisos(user.id);
    return !!permisos[clave];
}

// Middleware: exige el permiso a admins y guías (el superadmin siempre pasa).
// Solo filtra si el permiso existe para ese rol (ej. "reservas" es de admin:
// no bloquea a un guía que consulta sus propias reservas). Los demás roles no
// se filtran aquí: para eso está requireRole.
const requirePermiso = (clave) => async (req, res, next) => {
    try {
        const aplica = (req.user.rol === 'admin' && clave in PERMISOS_ADMIN)
            || (req.user.rol === 'guia' && clave in PERMISOS_GUIA);
        if (!aplica) return next();
        if (await tienePermiso(req.user, clave)) return next();
        return res.status(403).json({
            error: `No tienes permiso para "${PERMISOS_ADMIN[clave] || PERMISOS_GUIA[clave] || clave}". Pídeselo al superadministrador.`,
        });
    } catch (error) {
        console.error('Error verificando permisos:', error);
        res.status(500).json({ error: 'Error verificando permisos' });
    }
};

module.exports = { PERMISOS_ADMIN, PERMISOS_GUIA, calcularPermisos, obtenerPermisos, tienePermiso, requirePermiso };
