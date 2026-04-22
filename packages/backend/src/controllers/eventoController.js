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
            
            // Obtener pregunta y verificar respuesta
            const pregunta = await pool.query(
                'SELECT respuesta FROM bancos_preguntas WHERE id = $1',
                [evento.rows[0].pregunta_id]
            );
            
            const esCorrecto = pregunta.rows[0]?.respuesta === respuesta;
            
            if (!esCorrecto) {
                return res.status(400).json({ error: 'Respuesta incorrecta' });
            }
            
            // Registrar progreso
            await pool.query(
                `INSERT INTO progreso_eventos (usuario_id, evento_id, completado, fecha_completado)
                VALUES ($1, $2, true, NOW())`,
                [usuarioId, eventoId]
            );
            
            // Actualizar estadísticas
            await pool.query(`
                INSERT INTO estadisticas_eventos (usuario_id, total_completados, racha_actual, racha_maxima)
                VALUES ($1, 1, 1, 1)
                ON CONFLICT (usuario_id) DO UPDATE SET
                    total_completados = estadisticas_eventos.total_completados + 1,
                    racha_actual = estadisticas_eventos.racha_actual + 1,
                    racha_maxima = GREATEST(estadisticas_eventos.racha_maxima, estadisticas_eventos.racha_actual + 1),
                    ultimo_evento = NOW()
            `, [usuarioId]);
            
            // Otorgar XP
            await pool.query(
                'UPDATE usuarios SET xp_total = COALESCE(xp_total, 0) + $1 WHERE id = $2',
                [evento.rows[0].xp_recompensa, usuarioId]
            );
            
            res.json({ 
                success: true, 
                message: '¡Evento completado!',
                xp_ganada: evento.rows[0].xp_recompensa
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = eventoController;