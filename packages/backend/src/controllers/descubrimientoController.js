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

    // Resumen de hoy (hora de Colombia) para "Mi día en Concepción"
    async getResumenHoy(req, res) {
        try {
            const DESDE = `date_trunc('day', NOW() AT TIME ZONE 'America/Bogota') AT TIME ZONE 'America/Bogota'`;
            const [lugares, retos, usuario, cupones] = await Promise.all([
                pool.query(`
                    SELECT l.nombre FROM descubrimientos d JOIN lugares l ON l.id = d.lugar_id
                    WHERE d.usuario_id = $1 AND d.fecha_descubrimiento >= ${DESDE}
                    ORDER BY d.fecha_descubrimiento`, [req.user.id]),
                pool.query(`
                    SELECT COUNT(*)::int AS n, COALESCE(SUM(e.xp_recompensa), 0)::int AS xp
                    FROM progreso_eventos pe JOIN eventos_diarios e ON e.id = pe.evento_id
                    WHERE pe.usuario_id = $1 AND pe.completado = true AND pe.fecha_completado >= ${DESDE}`, [req.user.id]),
                pool.query('SELECT nombre, COALESCE(nivel, 1) AS nivel, COALESCE(xp_total, 0) AS xp_total FROM usuarios WHERE id = $1', [req.user.id]),
                pool.query(`SELECT COUNT(*)::int AS n FROM codigos_descuento WHERE usuario_id = $1 AND fecha_creacion >= ${DESDE}`, [req.user.id]),
            ]);
            res.json({
                lugares: lugares.rows.map((r) => r.nombre),
                retos: retos.rows[0].n,
                // 50 XP por lugar descubierto + lo de los retos
                xp: lugares.rows.length * 50 + retos.rows[0].xp,
                cupones: cupones.rows[0].n,
                nivel: usuario.rows[0]?.nivel || 1,
                xp_total: usuario.rows[0]?.xp_total || 0,
            });
        } catch (error) {
            console.error('Error en resumen de hoy:', error);
            res.status(500).json({ error: 'No se pudo armar tu resumen' });
        }
    },

    // Cupones de descuento del turista (antes no había cómo verlos: el
    // código se generaba pero la app nunca se lo mostraba)
    async getMisCodigos(req, res) {
        try {
            res.json({ codigos: await CodigoDescuento.delUsuario(req.user.id) });
        } catch (error) {
            console.error('Error al obtener cupones:', error);
            res.status(500).json({ error: 'Error al obtener tus cupones' });
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
            const codigosDescuento = await CodigoDescuento.otorgarPorNivel(usuarioId, nivelAnterior, nivelNuevo, lugar_id);

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
