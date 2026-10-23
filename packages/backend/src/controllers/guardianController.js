// controllers/guardianController.js
const pool = require('../config/database');
const { verificarYOtorgarInsignias } = require('../services/insigniaService');

// Distancia máxima (en metros) a la que otros exploradores ven un guardián
const RADIO_VISIBILIDAD_M = 300;

const guardianController = {
    // Obtener perfil de guardián
    async getPerfil(req, res) {
        try {
            const { usuarioId } = req.params;
            
            // Primero verificar si existe el perfil, si no crearlo
            let perfilResult = await pool.query(`
                SELECT p.*, u.nivel, u.xp_total,
                       COALESCE((SELECT COUNT(DISTINCT lugar_id) FROM descubrimientos WHERE usuario_id = u.id), 0) as lugares_descubiertos
                FROM perfiles_guardian p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.usuario_id = $1`, [usuarioId]);
            
            // Si no existe perfil, crearlo automáticamente
            if (perfilResult.rows.length === 0) {
                await pool.query(`
                    INSERT INTO perfiles_guardian (usuario_id, nombre_publico, visible)
                    VALUES ($1, $2, true)
                    ON CONFLICT (usuario_id) DO NOTHING
                `, [usuarioId, null]);
                
                // Volver a obtener el perfil
                perfilResult = await pool.query(`
                    SELECT p.*, u.nivel, u.xp_total,
                           COALESCE((SELECT COUNT(DISTINCT lugar_id) FROM descubrimientos WHERE usuario_id = u.id), 0) as lugares_descubiertos
                    FROM perfiles_guardian p
                    JOIN usuarios u ON p.usuario_id = u.id
                    WHERE p.usuario_id = $1`, [usuarioId]);
            }
            
            // Obtener insignias
            const insigniasResult = await pool.query(`
                SELECT i.*, ui.fecha_obtenida 
                FROM usuarios_insignias ui 
                JOIN insignias i ON ui.insignia_id = i.id 
                WHERE ui.usuario_id = $1 
                ORDER BY ui.fecha_obtenida DESC`, [usuarioId]);
            
            // Obtener estadísticas de eventos
            const eventosStats = await pool.query(`
                SELECT total_completados, racha_actual, racha_maxima 
                FROM estadisticas_eventos 
                WHERE usuario_id = $1`, [usuarioId]);
            
            // Obtener guardián anclado
            const guardianResult = await pool.query(`
                SELECT * FROM guardianes_anclados 
                WHERE usuario_id = $1 AND activo = true AND fecha_fin > NOW()`, [usuarioId]);
            
            if (perfilResult.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado', success: false });
            }
            
            const perfil = perfilResult.rows[0];
            
            // Calcular título según nivel
            const titulos = { 5: '👑 Leyenda de Concepción', 4: '🛡️ Guardián del Pueblo', 3: '⭐ Aventurero', 2: '🌟 Explorador' };
            perfil.titulo = titulos[perfil.nivel] || '🌱 Principiante';
            
            const eventos = eventosStats.rows[0] || { total_completados: 0, racha_actual: 0, racha_maxima: 0 };
            
            // Calcular título de eventos
            let tituloEventos = '🧳 Visitante';
            if (eventos.total_completados >= 50) tituloEventos = '🏆 Leyenda Local';
            else if (eventos.total_completados >= 30) tituloEventos = '🛡️ Guardián del Pueblo';
            else if (eventos.total_completados >= 15) tituloEventos = '⭐ Explorador Local';
            else if (eventos.total_completados >= 5) tituloEventos = '🌱 Aprendiz';
            
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
            res.status(500).json({ error: error.message, success: false });
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
            
            // ✅ VERIFICAR NIVEL DESDE LA TABLA usuarios
            const usuarioInfo = await pool.query(`
                SELECT nivel FROM usuarios WHERE id = $1
            `, [usuarioId]);
            
            const nivelUsuario = usuarioInfo.rows[0]?.nivel || 1;
            const NIVEL_REQUERIDO = 5;
            
            if (nivelUsuario < NIVEL_REQUERIDO) {
                return res.status(400).json({ 
                    error: `Debes alcanzar el nivel ${NIVEL_REQUERIDO} para anclar un guardián. Tu nivel actual es ${nivelUsuario}` 
                });
            }
            
            // Anclar guardián
            const result = await pool.query(`
                INSERT INTO guardianes_anclados (usuario_id, latitud, longitud, mensaje)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [usuarioId, latitud, longitud, mensaje]);
            
            const nuevasInsignias = await verificarYOtorgarInsignias(usuarioId);
            
            res.json({ success: true, guardian: result.rows[0], nuevas_insignias: nuevasInsignias });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al anclar guardián' });
        }
    },
    
    // Obtener guardianes cercanos (visible en el mapa).
    // radio en metros (por defecto 300 m, máximo 1000 m); la distancia se
    // calcula con la fórmula de Haversine sobre el radio terrestre.
    async getGuardianesCercanos(req, res) {
        try {
            const lat = parseFloat(req.query.lat);
            const lng = parseFloat(req.query.lng);
            const radio = Math.min(parseFloat(req.query.radio) || RADIO_VISIBILIDAD_M, 1000);

            if (isNaN(lat) || isNaN(lng)) {
                return res.status(400).json({ error: 'lat y lng son requeridos' });
            }

            const result = await pool.query(`
                SELECT * FROM (
                    SELECT
                        g.id, g.usuario_id, g.latitud, g.longitud, g.mensaje,
                        g.fecha_inicio, g.fecha_fin,
                        p.nombre_publico,
                        p.foto_perfil_url,
                        u.nombre as usuario_nombre,
                        COALESCE(u.nivel, 1) as nivel,
                        6371000 * 2 * ASIN(SQRT(
                            POWER(SIN(RADIANS(g.latitud - $1) / 2), 2) +
                            COS(RADIANS($1)) * COS(RADIANS(g.latitud)) *
                            POWER(SIN(RADIANS(g.longitud - $2) / 2), 2)
                        )) as distancia_m
                    FROM guardianes_anclados g
                    JOIN usuarios u ON g.usuario_id = u.id
                    LEFT JOIN perfiles_guardian p ON g.usuario_id = p.usuario_id
                    WHERE g.activo = true
                        AND g.fecha_fin > NOW()
                        AND COALESCE(p.visible, true) = true
                ) cercanos
                WHERE distancia_m <= $3
                ORDER BY distancia_m
            `, [lat, lng, radio]);

            res.json({ success: true, guardianes: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener guardianes' });
        }
    },

    // Guardián activo del usuario autenticado (para mostrarlo siempre en su mapa)
    async getMiGuardian(req, res) {
        try {
            const result = await pool.query(`
                SELECT g.id, g.usuario_id, g.latitud, g.longitud, g.mensaje,
                       g.fecha_inicio, g.fecha_fin,
                       p.nombre_publico, p.foto_perfil_url,
                       u.nombre as usuario_nombre, COALESCE(u.nivel, 1) as nivel,
                       (SELECT COUNT(*) FROM notificaciones_guardian n WHERE n.guardian_id = g.id) as visitas
                FROM guardianes_anclados g
                JOIN usuarios u ON g.usuario_id = u.id
                LEFT JOIN perfiles_guardian p ON g.usuario_id = p.usuario_id
                WHERE g.usuario_id = $1 AND g.activo = true AND g.fecha_fin > NOW()
                ORDER BY g.fecha_inicio DESC
                LIMIT 1
            `, [req.user.id]);

            res.json({ success: true, guardian: result.rows[0] || null });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener tu guardián' });
        }
    },

    // Retirar el guardián activo (para poder anclarlo en otro lugar)
    async retirarGuardian(req, res) {
        try {
            const result = await pool.query(`
                UPDATE guardianes_anclados SET activo = false
                WHERE usuario_id = $1 AND activo = true
                RETURNING id
            `, [req.user.id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'No tienes un guardián activo' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al retirar el guardián' });
        }
    },

    // Registrar visita a un guardián
    async visitarGuardian(req, res) {
        try {
            const { guardianId } = req.params;
            const visitanteId = req.user.id;

            const guardian = await pool.query(
                'SELECT usuario_id FROM guardianes_anclados WHERE id = $1 AND activo = true AND fecha_fin > NOW()',
                [guardianId]
            );
            if (guardian.rows.length === 0) {
                return res.status(404).json({ error: 'Guardián no encontrado' });
            }
            if (guardian.rows[0].usuario_id === visitanteId) {
                return res.status(400).json({ error: 'No puedes visitar tu propio guardián' });
            }

            // Una visita por persona y día, para que no se infle el contador
            const yaVisito = await pool.query(`
                SELECT id FROM notificaciones_guardian
                WHERE guardian_id = $1 AND visitante_id = $2 AND created_at::date = CURRENT_DATE
            `, [guardianId, visitanteId]);
            if (yaVisito.rows.length > 0) {
                return res.json({ success: true, ya_visitado: true });
            }

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
                FROM usuarios_insignias ui
                JOIN insignias i ON ui.insignia_id = i.id
                WHERE ui.usuario_id = $1
                ORDER BY ui.fecha_obtenida DESC
            `, [usuarioId]);
            
            res.json({ success: true, insignias: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener insignias' });
        }
    },

    async subirFoto(req, res) {
        try {
            const usuarioId = req.user.id;
            
            // multer con upload.single() pone el archivo en req.file (singular)
            if (!req.file) {
                return res.status(400).json({ error: 'No se envió ninguna foto', success: false });
            }
            
            const foto = req.file;
            
            // Subir a Cloudinary o guardar localmente
            const cloudinary = require('cloudinary').v2;
            
            const result = await cloudinary.uploader.upload(foto.path, {
                folder: `perfiles_guardian/${usuarioId}`,
                width: 300,
                height: 300,
                crop: 'fill'
            });
            
            // Actualizar perfil con la nueva foto
            await pool.query(`
                UPDATE perfiles_guardian 
                SET foto_perfil_url = $1, fecha_actualizacion = NOW()
                WHERE usuario_id = $2
            `, [result.secure_url, usuarioId]);
            
            res.json({ success: true, url: result.secure_url });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al subir foto', success: false });
        }
    }
};

module.exports = guardianController;
