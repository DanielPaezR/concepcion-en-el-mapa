// models/Insignia.js
const pool = require('../config/database');

const Insignia = {
    // Obtener todas las insignias (solo las vigentes)
    async obtenerTodas() {
        const query = `
            SELECT * FROM insignias 
            WHERE (es_temporal = false OR (es_temporal = true AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)))
            ORDER BY tipo, lugares_requeridos NULLS FIRST, nivel_requerido NULLS FIRST
        `;
        const result = await pool.query(query);
        return result.rows;
    },
    
    // Obtener insignias temporales activas
    async obtenerTemporalesActivas() {
        const query = `
            SELECT * FROM insignias 
            WHERE es_temporal = true 
                AND fecha_inicio <= CURRENT_DATE 
                AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // Obtener insignias de un usuario
    async obtenerPorUsuario(usuarioId) {
        const query = `
            SELECT i.*, ui.fecha_obtenida
            FROM insignias i
            JOIN usuarios_insignias ui ON i.id = ui.insignia_id
            WHERE ui.usuario_id = $1
            ORDER BY ui.fecha_obtenida DESC
        `;
        const result = await pool.query(query, [usuarioId]);
        return result.rows;
    },
    
    // Verificar si una insignia sigue vigente (para temporales)
    async estaVigente(insigniaId) {
        const query = `
            SELECT es_temporal, fecha_fin FROM insignias WHERE id = $1
        `;
        const result = await pool.query(query, [insigniaId]);
        if (result.rows.length === 0) return false;
        
        const insignia = result.rows[0];
        if (!insignia.es_temporal) return true;
        if (!insignia.fecha_fin) return true;
        
        return new Date() <= new Date(insignia.fecha_fin);
    },

    // Verificar y otorgar insignias (VERSIÓN COMPLETA)
    async verificarYOtorgar(usuarioId, metricas) {
        const {
            nivel,
            lugaresDescubiertos,
            totalLugares,
            eventosCompletados,
            fotosSubidas,
            guardianesAnclados,
            rachaActual,
            eventosTemporalesCompletados
        } = metricas;

        // Las 7 consultas son independientes entre sí (cada una revisa una
        // categoría distinta de insignia) — antes se ejecutaban una detrás
        // de otra; ahora corren en paralelo con Promise.all, lo que reduce
        // el tiempo total de esta función a el de la consulta más lenta en
        // vez de la suma de las 7.
        const nombresCategorias = ['nivel', 'lugares', 'eventos', 'fotos', 'guardianes', 'racha', 'temporales'];

        const resultados = await Promise.allSettled([
            pool.query(`
                SELECT * FROM insignias
                WHERE tipo = 'nivel'
                    AND nivel_requerido IS NOT NULL
                    AND nivel_requerido <= $1
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [nivel, usuarioId]),
            pool.query(`
                SELECT * FROM insignias
                WHERE tipo = 'lugares'
                    AND lugares_requeridos IS NOT NULL
                    AND lugares_requeridos <= $1
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [lugaresDescubiertos, usuarioId]),
            pool.query(`
                SELECT * FROM insignias
                WHERE tipo IN ('eventos', 'evento')
                    AND lugares_requeridos IS NOT NULL
                    AND lugares_requeridos <= $1
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [eventosCompletados, usuarioId]),
            pool.query(`
                SELECT * FROM insignias
                WHERE tipo IN ('fotos', 'foto')
                    AND lugares_requeridos IS NOT NULL
                    AND lugares_requeridos <= $1
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [fotosSubidas, usuarioId]),
            pool.query(`
                SELECT * FROM insignias
                WHERE tipo IN ('guardianes', 'guardian')
                    AND lugares_requeridos IS NOT NULL
                    AND lugares_requeridos <= $1
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [guardianesAnclados, usuarioId]),
            pool.query(`
                SELECT * FROM insignias
                WHERE tipo = 'racha'
                    AND lugares_requeridos IS NOT NULL
                    AND lugares_requeridos <= $1
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [rachaActual, usuarioId]),
            pool.query(`
                SELECT * FROM insignias
                WHERE es_temporal = true
                    AND tipo = 'temporal'
                    AND lugares_requeridos IS NOT NULL
                    AND lugares_requeridos <= $1
                    AND fecha_inicio <= CURRENT_DATE
                    AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
                    AND NOT EXISTS (
                        SELECT 1 FROM usuarios_insignias
                        WHERE usuario_id = $2 AND insignia_id = insignias.id
                    )
            `, [eventosTemporalesCompletados || 0, usuarioId])
        ]);

        // Con allSettled, si una categoría falla (ej. por drift de esquema)
        // las demás igual se otorgan — antes con Promise.all, una sola
        // consulta fallida hacía que NINGUNA de las 7 categorías se
        // otorgara esa vez. Los rechazos se loguean para poder detectarlos,
        // pero no interrumpen el resto.
        const [
            insigniasNivel,
            insigniasLugares,
            insigniasEventos,
            insigniasFotos,
            insigniasGuardianes,
            insigniasRacha,
            insigniasTemporales
        ] = resultados.map((r, i) => {
            if (r.status === 'rejected') {
                console.error(`⚠️ Falló la consulta de insignias de categoría "${nombresCategorias[i]}":`, r.reason?.message || r.reason);
                return { rows: [] };
            }
            return r.value;
        });

        const insigniasObtenidas = [];

        for (const insignia of insigniasNivel.rows) {
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        for (const insignia of insigniasLugares.rows) {
            // Caso especial: "todos los lugares"
            if (insignia.lugares_requeridos === 999 || insignia.nombre.includes('Conquistador')) {
                if (lugaresDescubiertos < totalLugares) continue;
            }
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        for (const insignia of insigniasEventos.rows) {
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        for (const insignia of insigniasFotos.rows) {
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        for (const insignia of insigniasGuardianes.rows) {
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        for (const insignia of insigniasRacha.rows) {
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        for (const insignia of insigniasTemporales.rows) {
            if (await this._otorgarInsignia(usuarioId, insignia)) insigniasObtenidas.push(insignia);
        }

        return insigniasObtenidas;
    },

    // Método privado para otorgar insignia y guardar notificación
    async _otorgarInsignia(usuarioId, insignia) {
        // ON CONFLICT DO NOTHING usa la restricción UNIQUE(usuario_id, insignia_id)
        // que ya existe en la tabla — antes esto era un SELECT de verificación
        // seguido de un INSERT separado (2 consultas, con una ventana de
        // condición de carrera); ahora es una sola operación atómica.
        const resultado = await pool.query(`
            INSERT INTO usuarios_insignias (usuario_id, insignia_id)
            VALUES ($1, $2)
            ON CONFLICT (usuario_id, insignia_id) DO NOTHING
            RETURNING id
        `, [usuarioId, insignia.id]);

        // Si no se insertó ninguna fila, ya la tenía — no hay nada más que hacer.
        if (resultado.rows.length === 0) return false;

        const mensajeNotificacion = `🎉 ¡NUEVA INSIGNIA! ${insignia.nombre}\n${insignia.descripcion || '¡Logro desbloqueado!'}`;

        await pool.query(`
            INSERT INTO notificaciones_insignias (usuario_id, insignia_id, mensaje, leida)
            VALUES ($1, $2, $3, false)
        `, [usuarioId, insignia.id, mensajeNotificacion]);

        console.log(`🏅 [${new Date().toISOString()}] Usuario ${usuarioId} obtuvo: ${insignia.nombre}`);
        return true;
    }
};

module.exports = Insignia;
