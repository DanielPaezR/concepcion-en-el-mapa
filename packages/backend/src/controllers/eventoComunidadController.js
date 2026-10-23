// controllers/eventoComunidadController.js
// Eventos del pueblo (ferias, conciertos, mercados...) que se muestran como
// marcadores en el mapa del turista. No confundir con los retos
// (bancos_preguntas / eventos_diarios) de eventoController.
const pool = require('../config/database');
const cloudinary = require('cloudinary').v2;
const { tienePermiso } = require('../services/permisosService');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const subirImagen = (buffer) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'concepcion_eventos_comunidad', transformation: [{ width: 1080, height: 1080, crop: 'limit' }] },
        (error, result) => (error ? reject(error) : resolve(result))
    );
    uploadStream.end(buffer);
});

// Quién puede gestionar eventos y dónde:
//   admin → cualquier punto; guía → solo con puede_gestionar_eventos;
//   comercio → solo en la ubicación de su negocio.
async function obtenerPermiso(user) {
    // Admins y guías: permiso "eventos_pueblo" que da o quita el superadmin
    if (user.rol === 'admin' || user.rol === 'guia') {
        return (await tienePermiso(user, 'eventos_pueblo'))
            ? { puede: true }
            : { puede: false, error: 'No tienes permiso para publicar eventos. Pídeselo al superadministrador.' };
    }
    if (user.rol === 'comercio') {
        const r = await pool.query('SELECT id, latitud, longitud, direccion, nombre FROM comercios WHERE usuario_id = $1', [user.id]);
        const comercio = r.rows[0];
        if (!comercio) return { puede: false, error: 'No tienes un negocio registrado' };
        if (comercio.latitud == null || comercio.longitud == null) {
            return { puede: false, error: 'Tu negocio no tiene ubicación en el mapa. Pídele al administrador que la registre.' };
        }
        return { puede: true, comercio };
    }
    return { puede: false, error: 'No tienes permiso para crear eventos' };
}

// Normaliza y valida los campos del formulario (multipart: todo llega como texto)
function leerCampos(body, comercio) {
    const titulo = (body.titulo || '').trim();
    const descripcion = (body.descripcion || '').trim() || null;
    const fechaInicio = body.fecha_inicio ? new Date(body.fecha_inicio) : null;
    const fechaFin = body.fecha_fin ? new Date(body.fecha_fin) : null;
    let latitud = parseFloat(body.latitud);
    let longitud = parseFloat(body.longitud);
    let lugarTexto = (body.lugar_texto || '').trim() || null;

    if (comercio) {
        latitud = parseFloat(comercio.latitud);
        longitud = parseFloat(comercio.longitud);
        lugarTexto = lugarTexto || comercio.nombre;
    }

    if (!titulo) return { error: 'El título es obligatorio' };
    if (!fechaInicio || isNaN(fechaInicio)) return { error: 'La fecha de inicio es obligatoria' };
    if (fechaFin && (isNaN(fechaFin) || fechaFin < fechaInicio)) {
        return { error: 'La fecha de fin debe ser posterior al inicio' };
    }
    if (isNaN(latitud) || isNaN(longitud)) return { error: 'Selecciona la ubicación del evento en el mapa' };

    return {
        campos: {
            titulo, descripcion, latitud, longitud, lugarTexto,
            fechaInicio: body.fecha_inicio, fechaFin: body.fecha_fin || null,
        }
    };
}

// Las fechas salen como texto local ("2026-10-23T15:00") para que no las
// corra la zona horaria del servidor al serializarlas
const SELECT_EVENTO = `
    SELECT e.id, e.titulo, e.descripcion, e.imagen_url, e.latitud, e.longitud, e.lugar_texto,
           to_char(e.fecha_inicio, 'YYYY-MM-DD"T"HH24:MI') AS fecha_inicio,
           to_char(e.fecha_fin, 'YYYY-MM-DD"T"HH24:MI') AS fecha_fin,
           e.creado_por, e.comercio_id, e.activo,
           u.nombre AS creador_nombre, u.rol AS creador_rol, c.nombre AS comercio_nombre
    FROM eventos_comunidad e
    JOIN usuarios u ON u.id = e.creado_por
    LEFT JOIN comercios c ON c.id = e.comercio_id
`;

const eventoComunidadController = {
    // GET /api/eventos-comunidad — públicos: activos y que no hayan terminado
    // (sin fecha de fin, se considera que dura hasta el final del día de inicio).
    // Las fechas se guardan en hora local de Colombia (vienen de un
    // datetime-local), así que se comparan contra la hora de Bogotá y no
    // contra NOW(), que en el servidor de producción está en UTC.
    async listarActivos(req, res) {
        try {
            const result = await pool.query(`
                ${SELECT_EVENTO}
                WHERE e.activo = true
                  AND COALESCE(e.fecha_fin, date_trunc('day', e.fecha_inicio) + INTERVAL '1 day')
                      >= (NOW() AT TIME ZONE 'America/Bogota')
                ORDER BY e.fecha_inicio
            `);
            res.json({ success: true, eventos: result.rows });
        } catch (error) {
            console.error('Error al listar eventos de la comunidad:', error);
            res.status(500).json({ error: 'Error al obtener eventos' });
        }
    },

    // GET /api/eventos-comunidad/gestion — los que puede administrar el usuario
    async listarGestion(req, res) {
        try {
            const permiso = await obtenerPermiso(req.user);
            const esAdmin = req.user.rol === 'admin';
            const result = await pool.query(`
                ${SELECT_EVENTO}
                ${esAdmin ? '' : 'WHERE e.creado_por = $1'}
                ORDER BY e.fecha_inicio DESC
            `, esAdmin ? [] : [req.user.id]);

            res.json({
                success: true,
                eventos: result.rows,
                puede_crear: permiso.puede,
                motivo: permiso.puede ? null : permiso.error,
                ubicacion_fija: permiso.comercio
                    ? { latitud: permiso.comercio.latitud, longitud: permiso.comercio.longitud, nombre: permiso.comercio.nombre }
                    : null,
            });
        } catch (error) {
            console.error('Error al listar eventos para gestión:', error);
            res.status(500).json({ error: 'Error al obtener eventos' });
        }
    },

    async crear(req, res) {
        try {
            const permiso = await obtenerPermiso(req.user);
            if (!permiso.puede) return res.status(403).json({ error: permiso.error });

            const { campos, error } = leerCampos(req.body, permiso.comercio);
            if (error) return res.status(400).json({ error });

            const imagenUrl = req.file ? (await subirImagen(req.file.buffer)).secure_url : null;

            const result = await pool.query(`
                INSERT INTO eventos_comunidad
                    (titulo, descripcion, imagen_url, latitud, longitud, lugar_texto, fecha_inicio, fecha_fin, creado_por, comercio_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [campos.titulo, campos.descripcion, imagenUrl, campos.latitud, campos.longitud, campos.lugarTexto,
                campos.fechaInicio, campos.fechaFin, req.user.id, permiso.comercio?.id || null]);

            res.status(201).json({ success: true, evento: result.rows[0] });
        } catch (error) {
            console.error('Error al crear evento de la comunidad:', error);
            res.status(500).json({ error: 'Error al crear el evento' });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const permiso = await obtenerPermiso(req.user);
            if (!permiso.puede) return res.status(403).json({ error: permiso.error });

            const actual = await pool.query('SELECT creado_por, imagen_url FROM eventos_comunidad WHERE id = $1', [id]);
            if (actual.rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
            if (req.user.rol !== 'admin' && actual.rows[0].creado_por !== req.user.id) {
                return res.status(403).json({ error: 'Solo puedes editar tus propios eventos' });
            }

            const { campos, error } = leerCampos(req.body, permiso.comercio);
            if (error) return res.status(400).json({ error });

            let imagenUrl = actual.rows[0].imagen_url;
            if (req.file) imagenUrl = (await subirImagen(req.file.buffer)).secure_url;
            else if (req.body.quitar_imagen === 'true') imagenUrl = null;

            const activo = req.body.activo === undefined ? true : req.body.activo !== 'false';

            const result = await pool.query(`
                UPDATE eventos_comunidad
                SET titulo = $1, descripcion = $2, imagen_url = $3, latitud = $4, longitud = $5,
                    lugar_texto = $6, fecha_inicio = $7, fecha_fin = $8, activo = $9, updated_at = NOW()
                WHERE id = $10
                RETURNING *
            `, [campos.titulo, campos.descripcion, imagenUrl, campos.latitud, campos.longitud,
                campos.lugarTexto, campos.fechaInicio, campos.fechaFin, activo, id]);

            res.json({ success: true, evento: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar evento de la comunidad:', error);
            res.status(500).json({ error: 'Error al actualizar el evento' });
        }
    },

    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const actual = await pool.query('SELECT creado_por FROM eventos_comunidad WHERE id = $1', [id]);
            if (actual.rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
            if (req.user.rol !== 'admin' && actual.rows[0].creado_por !== req.user.id) {
                return res.status(403).json({ error: 'Solo puedes eliminar tus propios eventos' });
            }
            await pool.query('DELETE FROM eventos_comunidad WHERE id = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            console.error('Error al eliminar evento de la comunidad:', error);
            res.status(500).json({ error: 'Error al eliminar el evento' });
        }
    },
};

module.exports = eventoComunidadController;
