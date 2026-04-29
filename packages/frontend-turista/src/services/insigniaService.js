// services/insigniaService.js
const pool = require('../config/database');
const Insignia = require('../models/Insignia');

async function verificarYOtorgarInsignias(usuarioId) {
    try {
        // Obtener todas las métricas del usuario
        const metricas = await obtenerMetricasUsuario(usuarioId);
        
        // Verificar y otorgar insignias
        const nuevasInsignias = await Insignia.verificarYOtorgar(usuarioId, metricas);
        
        return nuevasInsignias;
    } catch (error) {
        console.error('Error al verificar insignias:', error);
        return [];
    }
}

async function obtenerMetricasUsuario(usuarioId) {
    const queries = {
        nivel: pool.query('SELECT nivel FROM usuarios WHERE id = $1', [usuarioId]),
        lugaresDescubiertos: pool.query('SELECT COUNT(DISTINCT lugar_id) as total FROM descubrimientos WHERE usuario_id = $1', [usuarioId]),
        totalLugares: pool.query('SELECT COUNT(*) as total FROM lugares WHERE activo = true', []),
        eventosCompletados: pool.query('SELECT COALESCE(SUM(completado), 0) as total FROM estadisticas_eventos WHERE usuario_id = $1', [usuarioId]),
        fotosSubidas: pool.query('SELECT COUNT(*) as total FROM galeria_fotos WHERE usuario_id = $1', [usuarioId]),
        guardianesAnclados: pool.query('SELECT COUNT(*) as total FROM guardianes_anclados WHERE usuario_id = $1', [usuarioId]),
        rachaActual: pool.query('SELECT racha_actual FROM estadisticas_eventos WHERE usuario_id = $1', [usuarioId]),
        // Eventos temporales completados
        eventosTemporalesCompletados: pool.query(`
            SELECT COUNT(*) as total 
            FROM progreso_eventos pe
            JOIN eventos_diarios ed ON pe.evento_id = ed.id
            WHERE pe.usuario_id = $1 
                AND pe.completado = true
                AND ed.es_temporal = true
        `, [usuarioId])
    };
    
    const results = await Promise.all(Object.values(queries));
    
    return {
        nivel: results[0].rows[0]?.nivel || 1,
        lugaresDescubiertos: parseInt(results[1].rows[0]?.total || 0),
        totalLugares: parseInt(results[2].rows[0]?.total || 0),
        eventosCompletados: parseInt(results[3].rows[0]?.total || 0),
        fotosSubidas: parseInt(results[4].rows[0]?.total || 0),
        guardianesAnclados: parseInt(results[5].rows[0]?.total || 0),
        rachaActual: parseInt(results[6].rows[0]?.racha_actual || 0),
        eventosTemporalesCompletados: parseInt(results[7].rows[0]?.total || 0)
    };
}

// Endpoint para que el frontend consulte nuevas insignias
async function obtenerNuevasInsignias(usuarioId) {
    const result = await pool.query(`
        SELECT i.*, ni.mensaje, ni.created_at, ni.leida
        FROM notificaciones_insignias ni
        JOIN insignias i ON ni.insignia_id = i.id
        WHERE ni.usuario_id = $1 AND ni.leida = false
        ORDER BY ni.created_at DESC
    `, [usuarioId]);
    
    // Marcar como leídas
    if (result.rows.length > 0) {
        await pool.query(`
            UPDATE notificaciones_insignias 
            SET leida = true 
            WHERE usuario_id = $1 AND leida = false
        `, [usuarioId]);
    }
    
    return result.rows;
}

module.exports = { verificarYOtorgarInsignias, obtenerMetricasUsuario, obtenerNuevasInsignias };