// controllers/anuncioController.js
// Tablero de anuncios: servicios, ventas y compras de la gente del pueblo.
// Cualquiera con cuenta pide publicar un anuncio; el superadmin lo aprueba o
// lo rechaza; el dueño lo marca como completado para quitarlo del tablero.
// El contacto es por WhatsApp con el número registrado en el perfil.
const db = require('../config/database');
const cloudinary = require('cloudinary').v2;
const pushNotificationService = require('../services/pushNotificationService');

const pool = db;
const TIPOS = ['servicio', 'venta', 'compra'];
const MAX_PENDIENTES = 5;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const subirImagen = (buffer) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'concepcion_anuncios', transformation: [{ width: 1080, height: 1080, crop: 'limit' }] },
        (error, result) => (error ? reject(error) : resolve(result))
    );
    uploadStream.end(buffer);
});

// Número para wa.me: solo dígitos, con indicativo de Colombia (57) si es un
// celular local de 10 dígitos. Devuelve null si no parece un número válido.
const numeroWhatsApp = (telefono) => {
    let d = String(telefono || '').replace(/\D/g, '');
    if (d.length === 10 && d.startsWith('3')) d = `57${d}`;
    return d.length >= 10 && d.length <= 15 ? d : null;
};

const enlaceWhatsApp = (telefono, titulo) => {
    const numero = numeroWhatsApp(telefono);
    if (!numero) return null;
    const texto = `Hola, vi tu anuncio "${titulo}" en Concepción en el Mapa.`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
};

const avisarDueno = async (anuncio, titulo, cuerpo) => {
    try {
        await pushNotificationService.sendToUser(anuncio.usuario_id, {
            title: titulo, body: cuerpo, icon: '/icons/icon-192x192.png',
            data: { url: '/mis-anuncios', tipo: 'anuncio', relacionadoId: anuncio.id },
            tipo: 'anuncio', relacionadoId: anuncio.id,
        });
    } catch (error) {
        console.error('⚠️ No se pudo notificar al dueño del anuncio:', error.message);
    }
};

const anuncioController = {
    // GET /api/anuncios?tipo=venta&q=texto — tablero público (solo aprobados)
    async listar(req, res) {
        try {
            const params = [];
            let filtro = '';
            if (TIPOS.includes(req.query.tipo)) {
                params.push(req.query.tipo);
                filtro += ` AND a.tipo = $${params.length}`;
            }
            if (req.query.q?.trim()) {
                params.push(`%${req.query.q.trim()}%`);
                filtro += ` AND (a.titulo ILIKE $${params.length} OR a.descripcion ILIKE $${params.length})`;
            }
            const r = await pool.query(`
                SELECT a.id, a.usuario_id, a.tipo, a.titulo, a.descripcion, a.precio, a.imagen_url,
                       a.fecha_revision, a.created_at, u.nombre AS autor, u.telefono
                FROM anuncios a JOIN usuarios u ON u.id = a.usuario_id
                WHERE a.estado = 'aprobado' ${filtro}
                ORDER BY COALESCE(a.fecha_revision, a.created_at) DESC
                LIMIT 100
            `, params);
            res.json({
                success: true,
                anuncios: r.rows.map(({ telefono, autor, ...a }) => ({
                    ...a,
                    autor: (autor || 'Vecino').split(' ')[0],
                    whatsapp: enlaceWhatsApp(telefono, a.titulo),
                })),
            });
        } catch (error) {
            console.error('Error listando anuncios:', error);
            res.status(500).json({ error: 'Error al obtener los anuncios' });
        }
    },

    // GET /api/anuncios/mios — anuncios del usuario (todos los estados) y su teléfono
    async mios(req, res) {
        try {
            const [anuncios, usuario] = await Promise.all([
                pool.query('SELECT * FROM anuncios WHERE usuario_id = $1 ORDER BY created_at DESC', [req.user.id]),
                pool.query('SELECT telefono FROM usuarios WHERE id = $1', [req.user.id]),
            ]);
            res.json({ success: true, anuncios: anuncios.rows, telefono: usuario.rows[0]?.telefono || null });
        } catch (error) {
            console.error('Error en mis anuncios:', error);
            res.status(500).json({ error: 'Error al obtener tus anuncios' });
        }
    },

    // POST /api/anuncios (multipart) — solicitud de anuncio, queda pendiente
    async crear(req, res) {
        try {
            const usuario = (await pool.query('SELECT id, nombre, anonimo, telefono FROM usuarios WHERE id = $1', [req.user.id])).rows[0];
            if (!usuario || usuario.anonimo) {
                return res.status(403).json({ error: 'Crea una cuenta para publicar anuncios' });
            }

            const tipo = req.body.tipo;
            const titulo = (req.body.titulo || '').trim();
            const descripcion = (req.body.descripcion || '').trim();
            const precioTexto = String(req.body.precio ?? '').replace(/\D/g, '');
            const precio = precioTexto ? parseInt(precioTexto, 10) : null;

            if (!TIPOS.includes(tipo)) return res.status(400).json({ error: 'Elige si es un servicio, una venta o una compra' });
            if (titulo.length < 4 || titulo.length > 120) return res.status(400).json({ error: 'El título debe tener entre 4 y 120 caracteres' });
            if (descripcion.length < 10 || descripcion.length > 1000) return res.status(400).json({ error: 'La descripción debe tener entre 10 y 1000 caracteres' });

            // El WhatsApp sale del perfil; si no tiene, se guarda el que envía aquí
            let telefono = usuario.telefono;
            if (req.body.telefono) {
                if (!numeroWhatsApp(req.body.telefono)) return res.status(400).json({ error: 'Escribe un número de WhatsApp válido (ej. 3001234567)' });
                telefono = String(req.body.telefono).replace(/[^\d+]/g, '').slice(0, 20);
                await pool.query('UPDATE usuarios SET telefono = $1 WHERE id = $2', [telefono, usuario.id]);
            }
            if (!numeroWhatsApp(telefono)) {
                return res.status(400).json({ error: 'Agrega tu número de WhatsApp para que te puedan contactar', codigo: 'SIN_TELEFONO' });
            }

            const pendientes = await pool.query(
                `SELECT COUNT(*)::int AS n FROM anuncios WHERE usuario_id = $1 AND estado = 'pendiente'`, [usuario.id]
            );
            if (pendientes.rows[0].n >= MAX_PENDIENTES) {
                return res.status(429).json({ error: `Ya tienes ${MAX_PENDIENTES} anuncios esperando revisión` });
            }

            const imagenUrl = req.file ? (await subirImagen(req.file.buffer)).secure_url : null;
            const r = await pool.query(`
                INSERT INTO anuncios (usuario_id, tipo, titulo, descripcion, precio, imagen_url)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `, [usuario.id, tipo, titulo, descripcion, precio, imagenUrl]);

            res.status(201).json({ success: true, anuncio: r.rows[0] });
        } catch (error) {
            console.error('Error creando anuncio:', error);
            res.status(500).json({ error: 'Error al enviar la solicitud de anuncio' });
        }
    },

    // PATCH /api/anuncios/:id/completar — el dueño lo quita del tablero
    async completar(req, res) {
        try {
            const r = await pool.query(`
                UPDATE anuncios SET estado = 'completado', updated_at = NOW()
                WHERE id = $1 AND usuario_id = $2 AND estado = 'aprobado' RETURNING *
            `, [req.params.id, req.user.id]);
            if (r.rows.length === 0) return res.status(404).json({ error: 'Solo puedes completar tus anuncios publicados' });
            res.json({ success: true, anuncio: r.rows[0] });
        } catch (error) {
            console.error('Error completando anuncio:', error);
            res.status(500).json({ error: 'Error al completar el anuncio' });
        }
    },

    // DELETE /api/anuncios/:id — el dueño borra su anuncio
    async eliminar(req, res) {
        try {
            const r = await pool.query('DELETE FROM anuncios WHERE id = $1 AND usuario_id = $2 RETURNING id', [req.params.id, req.user.id]);
            if (r.rows.length === 0) return res.status(404).json({ error: 'Anuncio no encontrado' });
            res.json({ success: true });
        } catch (error) {
            console.error('Error eliminando anuncio:', error);
            res.status(500).json({ error: 'Error al eliminar el anuncio' });
        }
    },

    // ── Moderación (superadmin) ────────────────────────────────────
    // GET /api/anuncios/moderacion?estado=pendiente
    async moderacion(req, res) {
        try {
            const estado = ['pendiente', 'aprobado', 'rechazado', 'completado'].includes(req.query.estado) ? req.query.estado : 'pendiente';
            const r = await pool.query(`
                SELECT a.*, u.nombre AS autor, u.email AS autor_email, u.telefono AS autor_telefono
                FROM anuncios a JOIN usuarios u ON u.id = a.usuario_id
                WHERE a.estado = $1 ORDER BY a.created_at ${estado === 'pendiente' ? 'ASC' : 'DESC'} LIMIT 200
            `, [estado]);
            const conteo = await pool.query('SELECT estado, COUNT(*)::int AS n FROM anuncios GROUP BY estado');
            res.json({
                success: true,
                anuncios: r.rows.map((a) => ({ ...a, whatsapp: enlaceWhatsApp(a.autor_telefono, a.titulo) })),
                conteo: Object.fromEntries(conteo.rows.map((c) => [c.estado, c.n])),
            });
        } catch (error) {
            console.error('Error en moderación de anuncios:', error);
            res.status(500).json({ error: 'Error al obtener los anuncios' });
        }
    },

    async aprobar(req, res) {
        try {
            const r = await pool.query(`
                UPDATE anuncios SET estado = 'aprobado', motivo_rechazo = NULL, revisado_por = $2,
                       fecha_revision = NOW(), updated_at = NOW()
                WHERE id = $1 AND estado IN ('pendiente', 'rechazado') RETURNING *
            `, [req.params.id, req.user.id]);
            if (r.rows.length === 0) return res.status(404).json({ error: 'Anuncio no encontrado o ya revisado' });
            avisarDueno(r.rows[0], '¡Tu anuncio fue publicado!', `"${r.rows[0].titulo}" ya está en el tablero de anuncios.`);
            res.json({ success: true, anuncio: r.rows[0] });
        } catch (error) {
            console.error('Error aprobando anuncio:', error);
            res.status(500).json({ error: 'Error al aprobar el anuncio' });
        }
    },

    async rechazar(req, res) {
        try {
            const motivo = (req.body.motivo || '').trim().slice(0, 500) || null;
            const r = await pool.query(`
                UPDATE anuncios SET estado = 'rechazado', motivo_rechazo = $3, revisado_por = $2,
                       fecha_revision = NOW(), updated_at = NOW()
                WHERE id = $1 AND estado IN ('pendiente', 'aprobado') RETURNING *
            `, [req.params.id, req.user.id, motivo]);
            if (r.rows.length === 0) return res.status(404).json({ error: 'Anuncio no encontrado o ya revisado' });
            avisarDueno(r.rows[0], 'Tu anuncio no fue aprobado', motivo || `Revisa "${r.rows[0].titulo}" en Mis anuncios.`);
            res.json({ success: true, anuncio: r.rows[0] });
        } catch (error) {
            console.error('Error rechazando anuncio:', error);
            res.status(500).json({ error: 'Error al rechazar el anuncio' });
        }
    },
};

module.exports = { ...anuncioController, numeroWhatsApp };
