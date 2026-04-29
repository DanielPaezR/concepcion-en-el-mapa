const pool = require('../config/database');

const favoritoController = {
    // Agregar o quitar favorito
    async toggle(req, res) {
        try {
            const { lugarId } = req.params;
            const usuarioId = req.user.id;

            // Verificar si ya existe
            const existe = await pool.query(
                'SELECT id FROM favoritos WHERE usuario_id = $1 AND lugar_id = $2',
                [usuarioId, lugarId]
            );

            if (existe.rows.length > 0) {
                // Eliminar favorito
                await pool.query(
                    'DELETE FROM favoritos WHERE usuario_id = $1 AND lugar_id = $2',
                    [usuarioId, lugarId]
                );
                return res.json({ success: true, favorito: false, message: 'Favorito eliminado' });
            } else {
                // Agregar favorito
                await pool.query(
                    'INSERT INTO favoritos (usuario_id, lugar_id) VALUES ($1, $2)',
                    [usuarioId, lugarId]
                );
                return res.json({ success: true, favorito: true, message: 'Favorito agregado' });
            }
        } catch (error) {
            console.error('Error en toggle favorito:', error);
            res.status(500).json({ error: 'Error al procesar favorito' });
        }
    },

    // Verificar si un lugar es favorito del usuario
    async verificar(req, res) {
        try {
            const { lugarId } = req.params;
            const usuarioId = req.user.id;

            const result = await pool.query(
                'SELECT id FROM favoritos WHERE usuario_id = $1 AND lugar_id = $2',
                [usuarioId, lugarId]
            );

            res.json({ success: true, esFavorito: result.rows.length > 0 });
        } catch (error) {
            console.error('Error al verificar favorito:', error);
            res.status(500).json({ error: 'Error al verificar favorito' });
        }
    },

    // Obtener todos los favoritos del usuario
    async getFavoritos(req, res) {
        try {
            const usuarioId = req.user.id;

            const result = await pool.query(`
                SELECT l.*, f.fecha_agregado
                FROM favoritos f
                JOIN lugares l ON f.lugar_id = l.id
                WHERE f.usuario_id = $1
                ORDER BY f.fecha_agregado DESC
            `, [usuarioId]);

            res.json({ success: true, favoritos: result.rows });
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            res.status(500).json({ error: 'Error al obtener favoritos' });
        }
    }
};

module.exports = favoritoController;