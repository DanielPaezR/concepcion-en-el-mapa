// controllers/curiosidadController.js
// Curiosidades del pueblo: marcadores con foto y descripción que el turista
// solo ve al pasar cerca. No forman parte del recorrido ni del juego (no dan XP).
const pool = require('../config/database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const subirImagen = (buffer) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'concepcion_curiosidades', transformation: [{ width: 1080, height: 1080, crop: 'limit' }] },
        (error, result) => (error ? reject(error) : resolve(result))
    );
    uploadStream.end(buffer);
});

function leerCampos(body) {
    const titulo = (body.titulo || '').trim();
    const descripcion = (body.descripcion || '').trim();
    const latitud = parseFloat(body.latitud);
    const longitud = parseFloat(body.longitud);

    if (!titulo) return { error: 'El título es obligatorio' };
    if (!descripcion) return { error: 'La descripción es obligatoria' };
    if (isNaN(latitud) || isNaN(longitud)) return { error: 'Selecciona la ubicación en el mapa' };
    return { campos: { titulo, descripcion, latitud, longitud } };
}

const curiosidadController = {
    // GET /api/curiosidades — públicas (el frontend decide cuáles mostrar según la distancia)
    async listar(req, res) {
        try {
            const result = await pool.query(`
                SELECT id, titulo, descripcion, imagen_url, latitud, longitud
                FROM curiosidades WHERE activo = true ORDER BY id
            `);
            res.json({ success: true, curiosidades: result.rows });
        } catch (error) {
            console.error('Error al listar curiosidades:', error);
            res.status(500).json({ error: 'Error al obtener curiosidades' });
        }
    },

    // GET /api/curiosidades/admin — todas, incluidas las inactivas
    async listarAdmin(req, res) {
        try {
            const result = await pool.query('SELECT * FROM curiosidades ORDER BY created_at DESC');
            res.json({ success: true, curiosidades: result.rows });
        } catch (error) {
            console.error('Error al listar curiosidades (admin):', error);
            res.status(500).json({ error: 'Error al obtener curiosidades' });
        }
    },

    async crear(req, res) {
        try {
            const { campos, error } = leerCampos(req.body);
            if (error) return res.status(400).json({ error });

            const imagenUrl = req.file ? (await subirImagen(req.file.buffer)).secure_url : null;
            const result = await pool.query(`
                INSERT INTO curiosidades (titulo, descripcion, imagen_url, latitud, longitud, creado_por)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `, [campos.titulo, campos.descripcion, imagenUrl, campos.latitud, campos.longitud, req.user.id]);

            res.status(201).json({ success: true, curiosidad: result.rows[0] });
        } catch (error) {
            console.error('Error al crear curiosidad:', error);
            res.status(500).json({ error: 'Error al crear la curiosidad' });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const actual = await pool.query('SELECT imagen_url FROM curiosidades WHERE id = $1', [id]);
            if (actual.rows.length === 0) return res.status(404).json({ error: 'Curiosidad no encontrada' });

            const { campos, error } = leerCampos(req.body);
            if (error) return res.status(400).json({ error });

            let imagenUrl = actual.rows[0].imagen_url;
            if (req.file) imagenUrl = (await subirImagen(req.file.buffer)).secure_url;
            else if (req.body.quitar_imagen === 'true') imagenUrl = null;

            const activo = req.body.activo === undefined ? true : req.body.activo !== 'false';

            const result = await pool.query(`
                UPDATE curiosidades
                SET titulo = $1, descripcion = $2, imagen_url = $3, latitud = $4, longitud = $5,
                    activo = $6, updated_at = NOW()
                WHERE id = $7 RETURNING *
            `, [campos.titulo, campos.descripcion, imagenUrl, campos.latitud, campos.longitud, activo, id]);

            res.json({ success: true, curiosidad: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar curiosidad:', error);
            res.status(500).json({ error: 'Error al actualizar la curiosidad' });
        }
    },

    async eliminar(req, res) {
        try {
            const result = await pool.query('DELETE FROM curiosidades WHERE id = $1 RETURNING id', [req.params.id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Curiosidad no encontrada' });
            res.json({ success: true });
        } catch (error) {
            console.error('Error al eliminar curiosidad:', error);
            res.status(500).json({ error: 'Error al eliminar la curiosidad' });
        }
    },
};

module.exports = curiosidadController;
