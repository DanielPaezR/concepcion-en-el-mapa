const pool = require('../config/database');
const { verificarYOtorgarInsignias } = require('../services/insigniaService');

const descubrimientoController = {
    async getMisDescubrimientos(req, res) {
        try {
            const result = await pool.query(
                `
                    SELECT d.*, l.nombre, l.tipo, l.latitud, l.longitud, l.imagen_url
                    FROM descubrimientos d
                    JOIN lugares l ON d.lugar_id = l.id
                    WHERE d.usuario_id = $1
                    ORDER BY d.fecha_descubrimiento DESC NULLS LAST, d.id DESC
                `,
                [req.user.id]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener descubrimientos:', error);
            res.status(500).json({
                error: 'Error al obtener descubrimientos',
                details: error.message
            });
        }
    },

    async registrar(req, res) {
        try {
            const { lugar_id } = req.body;
            const usuarioId = req.user.id;

            if (!lugar_id) {
                return res.status(400).json({ error: 'lugar_id es requerido' });
            }

            const lugar = await pool.query(
                'SELECT id FROM lugares WHERE id = $1 AND activo = true',
                [lugar_id]
            );

            if (lugar.rows.length === 0) {
                return res.status(404).json({ error: 'Lugar no encontrado' });
            }

            const yaDescubrio = await pool.query(
                'SELECT id FROM descubrimientos WHERE usuario_id = $1 AND lugar_id = $2',
                [usuarioId, lugar_id]
            );

            if (yaDescubrio.rows.length > 0) {
                return res.status(400).json({ error: 'Ya descubriste este lugar' });
            }

            const result = await pool.query(`
                INSERT INTO descubrimientos (usuario_id, lugar_id)
                VALUES ($1, $2)
                RETURNING *
            `, [usuarioId, lugar_id]);

            const xpGanada = 50;
            const usuarioResult = await pool.query(`
                UPDATE usuarios
                SET xp_total = COALESCE(xp_total, 0) + $1,
                    nivel = LEAST(FLOOR((COALESCE(xp_total, 0) + $1) / 100) + 1, 5)
                WHERE id = $2
                RETURNING nivel, xp_total
            `, [xpGanada, usuarioId]);

            const nuevasInsignias = await verificarYOtorgarInsignias(usuarioId);

            res.json({
                success: true,
                descubrimiento: result.rows[0],
                xp_ganada: xpGanada,
                nivel_actual: usuarioResult.rows[0]?.nivel || 1,
                xp_total: usuarioResult.rows[0]?.xp_total || xpGanada,
                nuevas_insignias: nuevasInsignias
            });
        } catch (error) {
            console.error('Error al registrar descubrimiento:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = descubrimientoController;
