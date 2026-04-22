const pool = require('../config/database');

const guardianController = {
    // Obtener perfil de guardián
    async getPerfil(req, res) {
        try {
            const { usuarioId } = req.params;
            
            // Obtener perfil
            const perfilResult = await pool.query(`
                SELECT 
                    p.*,
                    u.nombre as email_nombre,
                    u.nivel,
                    u.xp_total,
                    COALESCE(
                        (SELECT COUNT(DISTINCT lugar_id) FROM descubrimientos WHERE usuario_id = u.id),
                        0
                    ) as lugares_descubiertos
                FROM perfiles_guardian p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.usuario_id = $1 AND p.visible = true
            `, [usuarioId]);
            
            if (perfilResult.rows.length === 0) {
                return res.status(404).json({ error: 'Perfil no encontrado' });
            }
            
            const perfil = perfilResult.rows[0];
            
            // Calcular título según nivel
            const nivel = perfil.nivel || 1;
            let titulo = '🌱 Principiante';
            if (nivel >= 5) titulo = '👑 Leyenda de Concepción';
            else if (nivel >= 4) titulo = '🛡️ Guardián del Pueblo';
            else if (nivel >= 3) titulo = '⭐ Aventurero';
            else if (nivel >= 2) titulo = '🌟 Explorador';
            
            perfil.titulo = titulo;
            
            // Obtener insignias del usuario
            const insigniasResult = await pool.query(`
                SELECT i.*, ui.fecha_obtenida
                FROM usuario_insignias ui
                JOIN insignias i ON ui.insignia_id = i.id
                WHERE ui.usuario_id = $1
                ORDER BY ui.fecha_obtenida DESC
            `, [usuarioId]);
            
            // Obtener estadísticas de eventos
            const eventosStats = await pool.query(`
                SELECT total_completados, racha_actual, racha_maxima 
                FROM estadisticas_eventos 
                WHERE usuario_id = $1
            `, [usuarioId]);
            
            const eventos = eventosStats.rows[0] || { total_completados: 0, racha_actual: 0, racha_maxima: 0 };
            
            // Calcular título de eventos
            let tituloEventos = '🧳 Visitante';
            if (eventos.total_completados >= 50) tituloEventos = '🏆 Leyenda Local';
            else if (eventos.total_completados >= 30) tituloEventos = '🛡️ Guardián del Pueblo';
            else if (eventos.total_completados >= 15) tituloEventos = '⭐ Explorador Local';
            else if (eventos.total_completados >= 5) tituloEventos = '🌱 Aprendiz';
            
            // Obtener guardián activo
            const guardianResult = await pool.query(`
                SELECT * FROM guardianes_anclados 
                WHERE usuario_id = $1 AND activo = true AND fecha_fin > NOW()
            `, [usuarioId]);
            
            res.json({
                success: true,
                perfil: perfil,
                insignias: insigniasResult.rows,
                guardian_activo: guardianResult.rows[0] || null,
                eventos: {
                    total_completados: parseInt(eventos.total_completados),
                    racha_actual: parseInt(eventos.racha_actual),
                    racha_maxima: parseInt(eventos.racha_maxima),
                    titulo: tituloEventos,
                    progreso: Math.min((eventos.total_completados / 50) * 100, 100)
                }
            });
        } catch (error) {
            console.error('Error en getPerfil:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Actualizar perfil de guardián
    async updatePerfil(req, res) {
        try {
            const { nombre_publico, ciudad_origen, biografia, foto_perfil_url, visible } = req.body;
            const usuarioId = req.user.id;
            
            const result = await pool.query(`
                INSERT INTO perfiles_guardian (usuario_id, nombre_publico, ciudad_origen, biografia, foto_perfil_url, visible)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (usuario_id) DO UPDATE SET
                    nombre_publico = EXCLUDED.nombre_publico,
                    ciudad_origen = EXCLUDED.ciudad_origen,
                    biografia = EXCLUDED.biografia,
                    foto_perfil_url = EXCLUDED.foto_perfil_url,
                    visible = EXCLUDED.visible,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                RETURNING *
            `, [usuarioId, nombre_publico, ciudad_origen, biografia, foto_perfil_url, visible]);
            
            res.json({ success: true, perfil: result.rows[0] });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al actualizar perfil' });
        }
    },
    
    // Anclar guardián en un lugar
    async anclarGuardian(req, res) {
        try {
            const { latitud, longitud, mensaje } = req.body;
            const usuarioId = req.user.id;
            
            // Verificar si ya tiene un guardián activo
            const activo = await pool.query(`
                SELECT * FROM guardianes_anclados 
                WHERE usuario_id = $1 AND activo = true AND fecha_fin > NOW()
            `, [usuarioId]);
            
            if (activo.rows.length > 0) {
                return res.status(400).json({ error: 'Ya tienes un guardián activo' });
            }
            
            // Verificar si completó todos los lugares
            const totalLugares = await pool.query('SELECT COUNT(*) FROM lugares WHERE activo = true');
            const lugaresDescubiertos = await pool.query(`
                SELECT COUNT(DISTINCT lugar_id) as total
                FROM descubrimientos
                WHERE usuario_id = $1
            `, [usuarioId]);
            
            if (lugaresDescubiertos.rows[0].total < totalLugares.rows[0].count) {
                return res.status(400).json({ error: 'Debes descubrir todos los lugares primero' });
            }
            
            // Anclar guardián
            const result = await pool.query(`
                INSERT INTO guardianes_anclados (usuario_id, latitud, longitud, mensaje)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [usuarioId, latitud, longitud, mensaje]);
            
            // Otorgar insignia de guardián si no la tiene
            const insigniaGuardian = await pool.query(
                "SELECT id FROM insignias WHERE nombre LIKE '%Guardián%' LIMIT 1"
            );
            
            if (insigniaGuardian.rows[0]) {
                await pool.query(`
                    INSERT INTO usuario_insignias (usuario_id, insignia_id)
                    VALUES ($1, $2)
                    ON CONFLICT (usuario_id, insignia_id) DO NOTHING
                `, [usuarioId, insigniaGuardian.rows[0].id]);
            }
            
            res.json({ success: true, guardian: result.rows[0] });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al anclar guardián' });
        }
    },
    
    // Obtener guardianes cercanos (visible en el mapa)
    async getGuardianesCercanos(req, res) {
        try {
            const { lat, lng, radio = 0.02 } = req.query;s
            
            const result = await pool.query(`
                SELECT 
                    g.*,
                    p.nombre_publico,
                    p.foto_perfil_url,
                    u.id as usuario_id,
                    u.nombre as usuario_nombre
                FROM guardianes_anclados g
                JOIN perfiles_guardian p ON g.usuario_id = p.usuario_id
                JOIN usuarios u ON g.usuario_id = u.id
                WHERE g.activo = true 
                    AND g.fecha_fin > NOW()
                    AND ABS(g.latitud - $1) < $3
                    AND ABS(g.longitud - $2) < $3
            `, [lat, lng, radio]);
            
            // Calcular nivel para cada guardián (según lugares descubiertos)
            const guardianesConNivel = await Promise.all(result.rows.map(async (guardian) => {
                const lugaresDescubiertos = await pool.query(`
                    SELECT COUNT(DISTINCT lugar_id) as total
                    FROM descubrimientos
                    WHERE usuario_id = $1
                `, [guardian.usuario_id]);
                
                // Calcular nivel (cada 3 lugares = 1 nivel, máx 5)
                const nivel = Math.min(Math.floor((lugaresDescubiertos.rows[0]?.total || 0) / 3) + 1, 5);
                
                return {
                    ...guardian,
                    nivel
                };
            }));
            
            res.json({ success: true, guardianes: guardianesConNivel });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener guardianes' });
        }
    },
    
    // Registrar visita a un guardián
    async visitarGuardian(req, res) {
        try {
            const { guardianId } = req.params;
            const visitanteId = req.user.id;
            
            // Registrar notificación para el guardián
            const result = await pool.query(`
                INSERT INTO notificaciones_guardian (guardian_id, visitante_id, mensaje)
                VALUES ($1, $2, 'Alguien visitó tu lugar apadrinado')
                RETURNING *
            `, [guardianId, visitanteId]);
            
            res.json({ success: true, notificacion: result.rows[0] });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al registrar visita' });
        }
    },
    
    // Obtener insignias del usuario
    async getInsignias(req, res) {
        try {
            const usuarioId = req.user.id;
            
            const result = await pool.query(`
                SELECT i.*, ui.fecha_obtenida
                FROM usuario_insignias ui
                JOIN insignias i ON ui.insignia_id = i.id
                WHERE ui.usuario_id = $1
                ORDER BY ui.fecha_obtenida DESC
            `, [usuarioId]);
            
            res.json({ success: true, insignias: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener insignias' });
        }
    }
};

module.exports = guardianController;