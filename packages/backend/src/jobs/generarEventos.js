// jobs/generarEventos.js
// Genera los retos del día (eventos_diarios) a partir del banco de preguntas
// y de ubicaciones. Se ejecuta todos los días a las 6:00 a. m. (hora de
// Colombia), al arrancar el servidor si no hay retos vigentes, y a pedido
// desde el panel admin (POST /api/admin/eventos/generar).
const cron = require('node-cron');
const pool = require('../config/database'); // { query, pool }

const RETOS_DIARIOS = 3;
const ZONA = 'America/Bogota';

// Ubicación del reto: la que el admin le asignó a la pregunta si sigue activa;
// si no, una al azar que no se haya usado ya hoy.
async function elegirUbicacion(client, pregunta, usadas) {
    if (pregunta.ubicacion_id) {
        const r = await client.query('SELECT * FROM bancos_ubicaciones WHERE id = $1 AND activo = true', [pregunta.ubicacion_id]);
        if (r.rows[0]) return r.rows[0];
    }
    const r = await client.query(
        'SELECT * FROM bancos_ubicaciones WHERE activo = true AND NOT (id = ANY($1::int[])) ORDER BY RANDOM() LIMIT 1',
        [usadas]
    );
    if (r.rows[0]) return r.rows[0];
    // Si ya se usaron todas, se permite repetir
    const cualquiera = await client.query('SELECT * FROM bancos_ubicaciones WHERE activo = true ORDER BY RANDOM() LIMIT 1');
    return cualquiera.rows[0] || null;
}

const xpDe = (p) => p.puntos || (50 + (p.dificultad || 1) * 10);

// Título del reto en el mapa según su tipo
const tituloDe = (p, ubicacion) => {
    const lugar = ubicacion.nombre || 'Concepción';
    if (p.tipo === 'opcion') {
        const verdadOMito = Array.isArray(p.opciones) && p.opciones.length === 2
            && p.opciones.map((o) => String(o).toLowerCase()).sort().join('|') === 'falso|verdadero';
        return verdadOMito ? `🤔 ¿Verdad o mito?: ${lugar}` : `🧠 Quiz: ${lugar}`;
    }
    return `🎯 Reto: ${lugar}`;
};

async function generarEventosDiarios() {
    const client = await pool.pool.connect();
    try {
        await client.query('BEGIN');

        // 1) Retos diarios: se reemplazan los del día anterior
        await client.query('UPDATE eventos_diarios SET activo = false WHERE activo = true AND COALESCE(es_temporal, false) = false');

        const preguntas = await client.query(`
            SELECT * FROM bancos_preguntas
            WHERE activo = true AND COALESCE(es_temporal, false) = false
            ORDER BY RANDOM() LIMIT $1
        `, [RETOS_DIARIOS]);

        const usadas = [];
        let creados = 0;
        for (const pregunta of preguntas.rows) {
            const ubicacion = await elegirUbicacion(client, pregunta, usadas);
            if (!ubicacion) break;
            usadas.push(ubicacion.id);
            await client.query(`
                INSERT INTO eventos_diarios (pregunta_id, ubicacion_id, titulo, xp_recompensa, fecha_expiracion)
                VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours')
            `, [pregunta.id, ubicacion.id, tituloDe(pregunta, ubicacion), xpDe(pregunta)]);
            creados++;
        }

        // 2) Eventos temporales (navidad, fiestas...): activos mientras dure su
        //    rango de fechas, independientes de los retos diarios
        await client.query(`
            UPDATE eventos_diarios SET activo = false
            WHERE activo = true AND es_temporal = true AND fecha_fin < (NOW() AT TIME ZONE '${ZONA}')::date
        `);
        const temporales = await client.query(`
            SELECT p.* FROM bancos_preguntas p
            WHERE p.activo = true AND p.es_temporal = true
              AND (NOW() AT TIME ZONE '${ZONA}')::date BETWEEN p.fecha_inicio AND p.fecha_fin
              AND NOT EXISTS (
                  SELECT 1 FROM eventos_diarios e WHERE e.pregunta_id = p.id AND e.activo = true
              )
        `);
        let temporalesCreados = 0;
        for (const pregunta of temporales.rows) {
            const ubicacion = await elegirUbicacion(client, pregunta, usadas);
            if (!ubicacion) break;
            usadas.push(ubicacion.id);
            await client.query(`
                INSERT INTO eventos_diarios
                    (pregunta_id, ubicacion_id, titulo, xp_recompensa, fecha_expiracion, es_temporal, fecha_inicio, fecha_fin)
                VALUES ($1, $2, $3, $4, ($5::date + INTERVAL '1 day') AT TIME ZONE '${ZONA}', true, $6, $5)
            `, [pregunta.id, ubicacion.id, `🎪 Evento especial: ${ubicacion.nombre || 'Concepción'}`, xpDe(pregunta),
                pregunta.fecha_fin, pregunta.fecha_inicio]);
            temporalesCreados++;
        }

        await client.query('COMMIT');
        console.log(`✅ Retos generados: ${creados} diarios, ${temporalesCreados} temporales`);
        return { diarios: creados, temporales: temporalesCreados };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error generando retos:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Al arrancar: si no hay retos vigentes (servidor recién desplegado o el cron
// no corrió), se generan para que el mapa no quede vacío.
async function generarSiNoHay() {
    try {
        const r = await pool.query('SELECT COUNT(*)::int AS n FROM eventos_diarios WHERE activo = true AND fecha_expiracion > NOW()');
        if (r.rows[0].n === 0) await generarEventosDiarios();
    } catch (error) {
        console.error('❌ Error revisando retos vigentes:', error.message);
    }
}

function iniciarCronRetos() {
    cron.schedule('0 6 * * *', () => generarEventosDiarios().catch(() => {}), { timezone: ZONA });
    console.log('⏰ Retos diarios programados (6:00 a. m., hora de Colombia)');
    generarSiNoHay();
}

module.exports = { generarEventosDiarios, iniciarCronRetos };
