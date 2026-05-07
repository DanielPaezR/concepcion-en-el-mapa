const pool = require('../config/database');
const Insignia = require('../models/Insignia');

async function obtenerMetricasUsuario(usuarioId) {
    const [
        usuarioResult,
        lugaresResult,
        totalLugaresResult,
        eventosResult,
        fotosResult,
        guardianesResult,
        temporalesResult
    ] = await Promise.all([
        pool.query('SELECT COALESCE(nivel, 1) AS nivel FROM usuarios WHERE id = $1', [usuarioId]),
        pool.query('SELECT COUNT(DISTINCT lugar_id) AS total FROM descubrimientos WHERE usuario_id = $1', [usuarioId]),
        pool.query('SELECT COUNT(*) AS total FROM lugares WHERE activo = true', []),
        pool.query(`
            SELECT
                COALESCE(total_completados, 0) AS total_completados,
                COALESCE(racha_actual, 0) AS racha_actual
            FROM estadisticas_eventos
            WHERE usuario_id = $1
        `, [usuarioId]),
        pool.query('SELECT COUNT(*) AS total FROM galeria_fotos WHERE usuario_id = $1', [usuarioId]),
        pool.query('SELECT COUNT(*) AS total FROM guardianes_anclados WHERE usuario_id = $1', [usuarioId]),
        pool.query(`
            SELECT COUNT(*) AS total
            FROM progreso_eventos pe
            JOIN eventos_diarios ed ON pe.evento_id = ed.id
            WHERE pe.usuario_id = $1
                AND pe.completado = true
                AND ed.es_temporal = true
        `, [usuarioId])
    ]);

    const eventos = eventosResult.rows[0] || {};

    return {
        nivel: parseInt(usuarioResult.rows[0]?.nivel || 1),
        lugaresDescubiertos: parseInt(lugaresResult.rows[0]?.total || 0),
        totalLugares: parseInt(totalLugaresResult.rows[0]?.total || 0),
        eventosCompletados: parseInt(eventos.total_completados || 0),
        fotosSubidas: parseInt(fotosResult.rows[0]?.total || 0),
        guardianesAnclados: parseInt(guardianesResult.rows[0]?.total || 0),
        rachaActual: parseInt(eventos.racha_actual || 0),
        eventosTemporalesCompletados: parseInt(temporalesResult.rows[0]?.total || 0)
    };
}

async function verificarYOtorgarInsignias(usuarioId) {
    try {
        const metricas = await obtenerMetricasUsuario(usuarioId);
        return await Insignia.verificarYOtorgar(usuarioId, metricas);
    } catch (error) {
        console.error('Error al verificar insignias:', error);
        return [];
    }
}

async function obtenerNuevasInsignias(usuarioId) {
    const result = await pool.query(`
        SELECT i.*, ni.mensaje, ni.created_at, ni.leida
        FROM notificaciones_insignias ni
        JOIN insignias i ON ni.insignia_id = i.id
        WHERE ni.usuario_id = $1 AND ni.leida = false
        ORDER BY ni.created_at DESC
    `, [usuarioId]);

    if (result.rows.length > 0) {
        await pool.query(`
            UPDATE notificaciones_insignias
            SET leida = true
            WHERE usuario_id = $1 AND leida = false
        `, [usuarioId]);
    }

    return result.rows;
}

module.exports = {
    obtenerMetricasUsuario,
    verificarYOtorgarInsignias,
    obtenerNuevasInsignias
};
