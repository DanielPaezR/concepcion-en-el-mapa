// models/Galeria.js
const pool = require('../config/database');

const Galeria = {
    // Subir una foto a la galería
    async subirFoto(usuarioId, lugarEspecialId, imagenUrl, mensaje) {
        const query = `
            INSERT INTO galeria_fotos (usuario_id, lugar_especial_id, imagen_url, mensaje)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [usuarioId, lugarEspecialId, imagenUrl, mensaje || null];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Obtener todas las fotos de la galería
    async obtenerFotos(limite = 20, offset = 0) {
        const query = `
            SELECT 
                g.*,
                u.nombre as usuario_nombre,
                u.email as usuario_email,
                COUNT(DISTINCT c.id) as comentarios_count
            FROM galeria_fotos g
            LEFT JOIN usuarios u ON g.usuario_id = u.id
            LEFT JOIN comentarios_fotos c ON g.id = c.foto_id
            WHERE g.estado = 'activo'
            GROUP BY g.id, u.nombre, u.email
            ORDER BY g.fecha_subida DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limite, offset]);
        return result.rows;
    },

    // Obtener una foto específica
    async obtenerFotoPorId(fotoId) {
        const query = `
            SELECT 
                g.*,
                u.nombre as usuario_nombre,
                u.email as usuario_email
            FROM galeria_fotos g
            LEFT JOIN usuarios u ON g.usuario_id = u.id
            WHERE g.id = $1 AND g.estado = 'activo'
        `;
        const result = await pool.query(query, [fotoId]);
        return result.rows[0];
    },

    // Dar like a una foto
    async darLike(fotoId) {
        const query = `
            UPDATE galeria_fotos 
            SET likes = likes + 1 
            WHERE id = $1 
            RETURNING likes
        `;
        const result = await pool.query(query, [fotoId]);
        return result.rows[0];
    },

    // Comentar una foto
    async comentarFoto(fotoId, usuarioId, comentario) {
        const query = `
            INSERT INTO comentarios_fotos (foto_id, usuario_id, comentario)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [fotoId, usuarioId, comentario]);
        return result.rows[0];
    },

    // Obtener comentarios de una foto
    async obtenerComentarios(fotoId) {
        const query = `
            SELECT 
                c.*,
                u.nombre as usuario_nombre
            FROM comentarios_fotos c
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.foto_id = $1
            ORDER BY c.fecha_comentario DESC
        `;
        const result = await pool.query(query, [fotoId]);
        return result.rows;
    }
};

module.exports = Galeria;