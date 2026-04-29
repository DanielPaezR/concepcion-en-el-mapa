const pool = require('../config/database');

const eventoController = {
    // Obtener eventos activos del día
    async getEventosActivos(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    e.*, 
                    p.pregunta,
                    p.respuesta,
                    u.nombre as ubicacion_nombre, 
                    u.latitud, 
                    u.longitud
                FROM eventos_diarios e
                JOIN bancos_preguntas p ON e.pregunta_id = p.id
                JOIN bancos_ubicaciones u ON e.ubicacion_id = u.id
                WHERE e.activo = true 
                AND e.fecha_expiracion > NOW()
            `);
            res.json({ success: true, eventos: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener eventos' });
        }
    },

    async getMisEstadisticas(req, res) {
        try {
            const usuarioId = req.user.id;
            
            const result = await pool.query(
                'SELECT * FROM estadisticas_eventos WHERE usuario_id = $1',
                [usuarioId]
            );
            
            const totalEventos = result.rows[0]?.total_completados || 0;
            let titulo = 'Visitante';
            if (totalEventos >= 50) titulo = '🏆 Leyenda Local';
            else if (totalEventos >= 30) titulo = '🛡️ Guardián del Pueblo';
            else if (totalEventos >= 15) titulo = '⭐ Explorador Local';
            else if (totalEventos >= 5) titulo = '🌱 Aprendiz';
            
            res.json({
                success: true,
                estadisticas: result.rows[0] || { total_completados: 0, racha_actual: 0, racha_maxima: 0 },
                titulo
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async getMisEstadisticas(req, res) {
        try {
            const usuarioId = req.user.id;
            
            const result = await pool.query(
                'SELECT * FROM estadisticas_eventos WHERE usuario_id = $1',
                [usuarioId]
            );
            
            const totalEventos = result.rows[0]?.total_completados || 0;
            let titulo = 'Visitante';
            if (totalEventos >= 50) titulo = '🏆 Leyenda Local';
            else if (totalEventos >= 30) titulo = '🛡️ Guardián del Pueblo';
            else if (totalEventos >= 15) titulo = '⭐ Explorador Local';
            else if (totalEventos >= 5) titulo = '🌱 Aprendiz';
            
            res.json({
                success: true,
                estadisticas: result.rows[0] || { total_completados: 0, racha_actual: 0, racha_maxima: 0 },
                titulo
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async completarEvento(req, res) {
        try {
            const { eventoId, respuesta } = req.body;
            const usuarioId = req.user.id;
            
            // Verificar si ya lo completó
            const yaCompleto = await pool.query(
                'SELECT id FROM progreso_eventos WHERE usuario_id = $1 AND evento_id = $2 AND completado = true',
                [usuarioId, eventoId]
            );
            
            if (yaCompleto.rows.length > 0) {
                return res.status(400).json({ error: 'Ya completaste este evento' });
            }
            
            // Obtener evento
            const evento = await pool.query(
                'SELECT * FROM eventos_diarios WHERE id = $1 AND activo = true AND fecha_expiracion > NOW()',
                [eventoId]
            );
            
            if (evento.rows.length === 0) {
                return res.status(404).json({ error: 'Evento no disponible' });
            }
            
            const eventoData = evento.rows[0];
            
            // 🔥 VALIDACIÓN PARA EVENTOS TEMPORALES
            if (eventoData.es_temporal === true) {
                const fechaActual = new Date();
                const fechaInicio = new Date(eventoData.fecha_inicio);
                const fechaFin = new Date(eventoData.fecha_fin);
                
                if (fechaActual < fechaInicio) {
                    return res.status(400).json({ 
                        error: `⏰ Este evento comienza el ${fechaInicio.toLocaleDateString()}. ¡Vuelve pronto!` 
                    });
                }
                
                if (fechaActual > fechaFin) {
                    return res.status(400).json({ 
                        error: `📅 Este evento terminó el ${fechaFin.toLocaleDateString()}. ¡Espera la próxima temporada!` 
                    });
                }
            }
            
            // Verificar respuesta (si aplica)
            if (respuesta && eventoData.pregunta_id) {
                const pregunta = await pool.query(
                    'SELECT respuesta FROM bancos_preguntas WHERE id = $1',
                    [eventoData.pregunta_id]
                );
                
                const esCorrecto = pregunta.rows[0]?.respuesta === respuesta;
                
                if (!esCorrecto) {
                    return res.status(400).json({ error: '❌ Respuesta incorrecta' });
                }
            }
            
            // Registrar progreso
            await pool.query(
                `INSERT INTO progreso_eventos (usuario_id, evento_id, completado, fecha_completado)
                VALUES ($1, $2, true, NOW())`,
                [usuarioId, eventoId]
            );
            
            // Actualizar estadísticas del evento
            const statsResult = await pool.query(`
                INSERT INTO estadisticas_eventos (usuario_id, total_completados, racha_actual, racha_maxima, ultimo_evento)
                VALUES ($1, 1, 1, 1, NOW())
                ON CONFLICT (usuario_id) DO UPDATE SET
                    total_completados = estadisticas_eventos.total_completados + 1,
                    racha_actual = CASE 
                        WHEN estadisticas_eventos.ultimo_evento >= NOW() - INTERVAL '1 day' 
                        THEN estadisticas_eventos.racha_actual + 1 
                        ELSE 1 
                    END,
                    racha_maxima = GREATEST(
                        estadisticas_eventos.racha_maxima, 
                        CASE 
                            WHEN estadisticas_eventos.ultimo_evento >= NOW() - INTERVAL '1 day' 
                            THEN estadisticas_eventos.racha_actual + 1 
                            ELSE 1 
                        END
                    ),
                    ultimo_evento = NOW()
                RETURNING total_completados, racha_actual, racha_maxima
            `, [usuarioId]);
            
            const stats = statsResult.rows[0];
            
            // Otorgar XP
            const xpGanada = eventoData.xp_recompensa || 50;
            const nivelResult = await pool.query(`
                UPDATE usuarios 
                SET xp_total = COALESCE(xp_total, 0) + $1,
                    nivel = FLOOR((COALESCE(xp_total, 0) + $1) / 100) + 1
                WHERE id = $2
                RETURNING nivel, xp_total
            `, [xpGanada, usuarioId]);
            
            const nivelActual = nivelResult.rows[0]?.nivel || 1;
            
            // 🔥 VERIFICAR INSIGNIAS
            const { verificarYOtorgarInsignias } = require('../services/insigniaService');
            const nuevasInsignias = await verificarYOtorgarInsignias(usuarioId);
            
            res.json({ 
                success: true, 
                message: '🎉 ¡Evento completado!',
                xp_ganada: xpGanada,
                nivel_actual: nivelActual,
                estadisticas: {
                    total_completados: parseInt(stats.total_completados),
                    racha_actual: parseInt(stats.racha_actual),
                    racha_maxima: parseInt(stats.racha_maxima)
                },
                nuevas_insignias: nuevasInsignias.map(i => ({
                    id: i.id,
                    nombre: i.nombre,
                    descripcion: i.descripcion,
                    icono: i.icono || '🏅'
                }))
            });
        } catch (error) {
            console.error('Error en completarEvento:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = eventoController;