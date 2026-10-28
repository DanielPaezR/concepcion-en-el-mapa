// controllers/lugarController.js
const pool = require('../config/database');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fotos de un lugar: la portada (imagen_url) + hasta 4 extra (imagenes_extra)
const MAX_IMAGENES_EXTRA = 4;

const subirImagen = (archivo) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'concepcion_lugares', transformation: [{ width: 1600, height: 1200, crop: 'limit' }] },
        (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    uploadStream.end(archivo.buffer);
});

// Borrar de Cloudinary es un extra: si falla, igual se guarda el lugar
const borrarImagen = async (url) => {
    if (!url || !url.includes('cloudinary')) return;
    try {
        const publicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`concepcion_lugares/${publicId}`);
    } catch (error) {
        console.error('No se pudo borrar la imagen de Cloudinary:', error.message);
    }
};

// Lista de URLs que el formulario dice conservar (solo URLs de verdad)
const leerExtrasActuales = (texto) => {
    try {
        const lista = JSON.parse(texto || '[]');
        return Array.isArray(lista) ? lista.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)) : [];
    } catch {
        return [];
    }
};

const lugarController = {
    // Obtener todos los lugares
    async getAll(req, res) {
        try {
            const result = await pool.query('SELECT * FROM lugares WHERE activo = true ORDER BY id');
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener lugares' });
        }
    },

    // Obtener un lugar por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM lugares WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Lugar no encontrado' });
            }
            
            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener lugar' });
        }
    },

    // Crear lugar (con imagen opcional)
    async create(req, res) {
        try {
            const { nombre, descripcion, tipo, latitud, longitud, direccion, horario } = req.body;
            const nuevasExtra = req.files?.imagenes || [];
            if (nuevasExtra.length > MAX_IMAGENES_EXTRA) {
                return res.status(400).json({ error: `Máximo ${MAX_IMAGENES_EXTRA + 1} fotos por lugar (portada + ${MAX_IMAGENES_EXTRA})` });
            }

            const portada = req.files?.imagen?.[0];
            const imagen_url = portada ? await subirImagen(portada) : null;
            const imagenes_extra = await Promise.all(nuevasExtra.map(subirImagen));

            const query = `
                INSERT INTO lugares (nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url, horario, imagenes_extra)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const values = [nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url, horario || null, JSON.stringify(imagenes_extra)];
            const result = await pool.query(query, values);
            
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al crear lugar:', error);
            res.status(500).json({ error: 'Error al crear lugar' });
        }
    },

    // Actualizar lugar (con imagen opcional)
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, tipo, latitud, longitud, direccion, horario, imagen_url_actual } = req.body;

            const actual = await pool.query('SELECT imagen_url, imagenes_extra FROM lugares WHERE id = $1', [id]);
            if (actual.rows.length === 0) {
                return res.status(404).json({ error: 'Lugar no encontrado' });
            }
            const antes = actual.rows[0];

            // Fotos extra: las que el formulario conserva (en su orden) + las nuevas
            const anterioresExtra = Array.isArray(antes.imagenes_extra) ? antes.imagenes_extra : [];
            const conservadas = req.body.imagenes_extra_actuales !== undefined
                ? leerExtrasActuales(req.body.imagenes_extra_actuales).filter((u) => anterioresExtra.includes(u))
                : anterioresExtra;
            const nuevasExtra = req.files?.imagenes || [];
            if (conservadas.length + nuevasExtra.length > MAX_IMAGENES_EXTRA) {
                return res.status(400).json({ error: `Máximo ${MAX_IMAGENES_EXTRA + 1} fotos por lugar (portada + ${MAX_IMAGENES_EXTRA})` });
            }

            let imagen_url = imagen_url_actual;
            const portada = req.files?.imagen?.[0];
            if (portada) imagen_url = await subirImagen(portada);
            const imagenes_extra = [...conservadas, ...(await Promise.all(nuevasExtra.map(subirImagen)))];

            const query = `
                UPDATE lugares
                SET nombre = $1, descripcion = $2, tipo = $3, latitud = $4, longitud = $5,
                    direccion = $6, imagen_url = $7, horario = $8, imagenes_extra = $9,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $10
                RETURNING *
            `;
            const values = [nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url, horario || null, JSON.stringify(imagenes_extra), id];
            const result = await pool.query(query, values);

            // Ya guardado: se borran de Cloudinary las fotos que se quitaron
            const quitadas = anterioresExtra.filter((u) => !imagenes_extra.includes(u));
            if (antes.imagen_url && antes.imagen_url !== imagen_url) quitadas.push(antes.imagen_url);
            await Promise.all(quitadas.map(borrarImagen));

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar lugar:', error);
            res.status(500).json({ error: 'Error al actualizar lugar' });
        }
    },

    // Eliminar lugar (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const query = 'UPDATE lugares SET activo = false WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Lugar no encontrado' });
            }
            
            res.json({ success: true, message: 'Lugar eliminado' });
        } catch (error) {
            console.error('Error al eliminar lugar:', error);
            res.status(500).json({ error: 'Error al eliminar lugar' });
        }
    }
};

module.exports = lugarController;