// controllers/lugarController.js
const pool = require('../config/database');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
            const { nombre, descripcion, tipo, latitud, longitud, direccion, horario, imagen_url_actual } = req.body;
            
            let imagen_url = null;
            
            // Subir imagen a Cloudinary si existe
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'concepcion_lugares', transformation: [{ width: 800, height: 600, crop: 'limit' }] },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                imagen_url = result.secure_url;
            }
            
            const query = `
                INSERT INTO lugares (nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url];
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
            
            let imagen_url = imagen_url_actual;
            
            // Subir nueva imagen a Cloudinary si existe
            if (req.file) {
                // Si había imagen anterior, la eliminamos de Cloudinary
                if (imagen_url && imagen_url.includes('cloudinary')) {
                    const publicId = imagen_url.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`concepcion_lugares/${publicId}`);
                }
                
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'concepcion_lugares', transformation: [{ width: 800, height: 600, crop: 'limit' }] },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                imagen_url = result.secure_url;
            }
            
            const query = `
                UPDATE lugares 
                SET nombre = $1, descripcion = $2, tipo = $3, latitud = $4, longitud = $5, 
                    direccion = $6, imagen_url = $7, fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING *
            `;
            const values = [nombre, descripcion, tipo, latitud, longitud, direccion, imagen_url, id];
            const result = await pool.query(query, values);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Lugar no encontrado' });
            }
            
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