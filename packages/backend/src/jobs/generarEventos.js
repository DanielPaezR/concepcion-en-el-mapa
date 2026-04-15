const cron = require('node-cron');
const pool = require('../config/database');

async function generarEventosDiarios() {
    console.log('🔄 Generando eventos aleatorios...');
    
    try {
        // Desactivar eventos anteriores
        await pool.query('UPDATE eventos_diarios SET activo = false WHERE activo = true');
        
        // Obtener 3 preguntas activas aleatorias
        const preguntas = await pool.query(
            'SELECT * FROM bancos_preguntas WHERE activo = true ORDER BY RANDOM() LIMIT 3'
        );
        
        // Obtener 3 ubicaciones activas aleatorias
        const ubicaciones = await pool.query(
            'SELECT * FROM bancos_ubicaciones WHERE activo = true ORDER BY RANDOM() LIMIT 3'
        );
        
        // Combinar preguntas y ubicaciones
        for (let i = 0; i < 3; i++) {
            const pregunta = preguntas.rows[i];
            const ubicacion = ubicaciones.rows[i];
            
            if (pregunta && ubicacion) {
                const xp = 50 + (pregunta.dificultad * 10);
                await pool.query(`
                    INSERT INTO eventos_diarios (pregunta_id, ubicacion_id, titulo, xp_recompensa, fecha_expiracion)
                    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')
                `, [pregunta.id, ubicacion.id, `🎯 Reto: ${ubicacion.nombre}`, xp]);
            }
        }
        
        console.log('✅ 3 eventos aleatorios generados');
    } catch (error) {
        console.error('❌ Error generando eventos:', error);
    }
}

// Ejecutar todos los días a las 6:00 AM
cron.schedule('0 6 * * *', generarEventosDiarios);

console.log('⏰ Cron job de eventos diarios iniciado (6:00 AM)');

module.exports = { generarEventosDiarios };