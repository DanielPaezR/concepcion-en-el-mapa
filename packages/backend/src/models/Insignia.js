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
        const insigniasObtenidas = [];
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
        
        // 1. Insignias por NIVEL
        const insigniasNivel = await pool.query(`
            SELECT * FROM insignias 
            WHERE tipo = 'nivel' 
                AND nivel_requerido IS NOT NULL 
                AND nivel_requerido <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM usuarios_insignias 
                    WHERE usuario_id = $2 AND insignia_id = insignias.id
                )
        `, [nivel, usuarioId]);
        
        for (const insignia of insigniasNivel.rows) {
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        // 2. Insignias por LUGARES
        const insigniasLugares = await pool.query(`
            SELECT * FROM insignias 
            WHERE tipo = 'lugares' 
                AND lugares_requeridos IS NOT NULL 
                AND lugares_requeridos <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM usuarios_insignias 
                    WHERE usuario_id = $2 AND insignia_id = insignias.id
                )
        `, [lugaresDescubiertos, usuarioId]);
        
        for (const insignia of insigniasLugares.rows) {
            // Caso especial: "todos los lugares"
            if (insignia.lugares_requeridos === 999 || insignia.nombre.includes('Conquistador')) {
                if (lugaresDescubiertos < totalLugares) continue;
            }
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        // 3. Insignias por EVENTOS
        const insigniasEventos = await pool.query(`
            SELECT * FROM insignias 
            WHERE tipo = 'eventos' 
                AND lugares_requeridos IS NOT NULL 
                AND lugares_requeridos <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM usuarios_insignias 
                    WHERE usuario_id = $2 AND insignia_id = insignias.id
                )
        `, [eventosCompletados, usuarioId]);
        
        for (const insignia of insigniasEventos.rows) {
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        // 4. Insignias por FOTOS
        const insigniasFotos = await pool.query(`
            SELECT * FROM insignias 
            WHERE tipo = 'fotos' 
                AND lugares_requeridos IS NOT NULL 
                AND lugares_requeridos <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM usuarios_insignias 
                    WHERE usuario_id = $2 AND insignia_id = insignias.id
                )
        `, [fotosSubidas, usuarioId]);
        
        for (const insignia of insigniasFotos.rows) {
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        // 5. Insignias por GUARDIANES
        const insigniasGuardianes = await pool.query(`
            SELECT * FROM insignias 
            WHERE tipo = 'guardianes' 
                AND lugares_requeridos IS NOT NULL 
                AND lugares_requeridos <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM usuarios_insignias 
                    WHERE usuario_id = $2 AND insignia_id = insignias.id
                )
        `, [guardianesAnclados, usuarioId]);
        
        for (const insignia of insigniasGuardianes.rows) {
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        // 6. Insignias por RACHA
        const insigniasRacha = await pool.query(`
            SELECT * FROM insignias 
            WHERE tipo = 'racha' 
                AND lugares_requeridos IS NOT NULL 
                AND lugares_requeridos <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM usuarios_insignias 
                    WHERE usuario_id = $2 AND insignia_id = insignias.id
                )
        `, [rachaActual, usuarioId]);
        
        for (const insignia of insigniasRacha.rows) {
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        // 7. Insignias TEMPORALES
        const insigniasTemporales = await pool.query(`
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
        `, [eventosTemporalesCompletados || 0, usuarioId]);
        
        for (const insignia of insigniasTemporales.rows) {
            await this._otorgarInsignia(usuarioId, insignia);
            insigniasObtenidas.push(insignia);
        }
        
        return insigniasObtenidas;
    },
    
    // Método privado para otorgar insignia y guardar notificación
    async _otorgarInsignia(usuarioId, insignia) {
        // Otorgar insignia
        await pool.query(
            'INSERT INTO usuarios_insignias (usuario_id, insignia_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [usuarioId, insignia.id]
        );
        
        // Guardar notificación
        await pool.query(`
            INSERT INTO notificaciones_insignias (usuario_id, insignia_id, mensaje, leida)
            VALUES ($1, $2, $3, false)
        `, [usuarioId, insignia.id, `🎉 ¡NUEVA INSIGNIA! ${insignia.nombre}\n${insignia.descripcion || '¡Logro desbloqueado!'}`]);
        
        console.log(`🏅 [${new Date().toISOString()}] Usuario ${usuarioId} obtuvo: ${insignia.nombre}`);
    }
};

module.exports = Insignia;