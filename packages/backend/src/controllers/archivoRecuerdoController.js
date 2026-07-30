// controllers/archivoRecuerdoController.js
const pool = require('../config/database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const archivoRecuerdoController = {
    // POST /api/recuerdos — el frontend ya compone la foto con el marco
    // decorado (nombre del lugar + fecha) usando canvas, y sube el
    // resultado final como un solo archivo de imagen.
    async subir(req, res) {
        try {
            const usuarioId = req.user.id;
            const { lugar_id } = req.body;

            if (!req.file) {
                return res.status(400).json({ error: 'No se envió ninguna imagen' });
            }
            if (!lugar_id) {
                return res.status(400).json({ error: 'lugar_id es requerido' });
            }

            // Solo se puede generar un recuerdo de un lugar que de verdad
            // ya descubriste — evita que alguien suba recuerdos de lugares
            // que nunca visitó.
            const descubrio = await pool.query(
                'SELECT id FROM descubrimientos WHERE usuario_id = $1 AND lugar_id = $2',
                [usuarioId, lugar_id]
            );
            if (descubrio.rows.length === 0) {
                return res.status(403).json({ error: 'Todavía no has descubierto este lugar' });
            }

            const resultadoSubida = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'concepcion_recuerdos', transformation: [{ width: 1080, height: 1350, crop: 'limit' }] },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            const result = await pool.query(`
                INSERT INTO archivos_recuerdo (usuario_id, lugar_id, imagen_url)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [usuarioId, lugar_id, resultadoSubida.secure_url]);

            res.status(201).json({ success: true, recuerdo: result.rows[0] });
        } catch (error) {
            console.error('Error subiendo recuerdo:', error);
            res.status(500).json({ error: 'Error subiendo recuerdo' });
        }
    },

    // GET /api/recuerdos/mis-recuerdos — para la galería en el perfil del
    // turista (hasta 10, uno por lugar).
    async misRecuerdos(req, res) {
        try {
            const usuarioId = req.user.id;

            const result = await pool.query(`
                SELECT ar.id, ar.imagen_url, ar.fecha_creacion, ar.estado,
                       l.nombre AS lugar_nombre
                FROM archivos_recuerdo ar
                JOIN lugares l ON ar.lugar_id = l.id
                WHERE ar.usuario_id = $1
                ORDER BY ar.fecha_creacion DESC
            `, [usuarioId]);

            res.json(result.rows);
        } catch (error) {
            console.error('Error listando recuerdos:', error);
            res.status(500).json({ error: 'Error listando recuerdos' });
        }
    }
};

module.exports = archivoRecuerdoController;
