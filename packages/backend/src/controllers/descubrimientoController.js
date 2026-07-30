const pool = require('../config/database');
const { verificarYOtorgarInsignias } = require('../services/insigniaService');
const CodigoDescuento = require('../models/CodigoDescuento');

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

            // Nivel ANTES de este descubrimiento — lo necesitamos para saber
            // si este descubrimiento es el que lo hace CRUZAR a nivel 3 o 5
            // (los únicos niveles que entregan código de descuento).
            const usuarioAntes = await pool.query(
                'SELECT COALESCE(nivel, 1) AS nivel FROM usuarios WHERE id = $1',
                [usuarioId]
            );
            const nivelAnterior = usuarioAntes.rows[0]?.nivel || 1;

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

            const nivelNuevo = usuarioResult.rows[0]?.nivel || 1;

            const nuevasInsignias = await verificarYOtorgarInsignias(usuarioId);

            // Códigos de descuento: SOLO al cruzar nivel 3 o nivel 5 (no en
            // cada descubrimiento) — un turista recibe como máximo 2 códigos
            // en toda su visita, no uno por cada lugar. Se generan todos los
            // que aplique en esta llamada (por si un salto de XP cruza más
            // de un umbral de una sola vez).
            const NIVELES_CON_CODIGO = [3, 5];
            const codigosDescuento = [];
            for (const nivelUmbral of NIVELES_CON_CODIGO) {
                if (nivelAnterior < nivelUmbral && nivelNuevo >= nivelUmbral) {
                    try {
                        const codigo = await CodigoDescuento.generar(usuarioId, lugar_id);
                        codigosDescuento.push(codigo);
                    } catch (errCodigo) {
                        console.error(`⚠️ No se pudo generar código de descuento (nivel ${nivelUmbral}):`, errCodigo.message);
                    }
                }
            }

            res.json({
                success: true,
                descubrimiento: result.rows[0],
                xp_ganada: xpGanada,
                nivel_actual: nivelNuevo,
                xp_total: usuarioResult.rows[0]?.xp_total || xpGanada,
                nuevas_insignias: nuevasInsignias,
                codigos_descuento: codigosDescuento
            });
        } catch (error) {
            console.error('Error al registrar descubrimiento:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = descubrimientoController;
