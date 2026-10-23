const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const { verificarYOtorgarInsignias } = require('../services/insigniaService');

// Compara respuestas sin importar mayúsculas, tildes, signos ni espacios extra:
// "Córdova" = "cordova" = " CORDOVA. "
const normalizar = (texto) => String(texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Holgura (m) sobre el radio del punto de encuentro por la imprecisión del GPS
const HOLGURA_GPS_M = 20;

const distanciaMetros = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const rad = (g) => (g * Math.PI) / 180;
    const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

// La respuesta correcta puede traer alternativas separadas por "|":
// "José María Córdova|Córdova|Cordoba"
const esRespuestaCorrecta = (respuesta, correcta) => String(correcta || "")
    .split("|")
    .map(normalizar)
    .filter(Boolean)
    .includes(normalizar(respuesta));

// Ruta pública: si viene un token válido se marca qué retos ya completó el usuario
const usuarioOpcional = (req) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        return token ? jwt.verify(token, process.env.JWT_SECRET) : null;
    } catch {
        return null;
    }
};

const eventoController = {
    async getEventosActivos(req, res) {
        try {
            const usuario = usuarioOpcional(req);
            // La respuesta NO se envía: antes cualquiera la veía en la red
            const result = await pool.query(`
                SELECT
                    e.id, e.titulo, e.xp_recompensa, e.fecha_expiracion, e.es_temporal,
                    e.fecha_inicio, e.fecha_fin,
                    COALESCE(p.tipo, 'pregunta') AS tipo,
                    p.pregunta, p.pistas, p.evento_temporal_tipo,
                    u.nombre as ubicacion_nombre,
                    u.latitud,
                    u.longitud,
                    COALESCE(u.radio, 50) AS radio,
                    ${usuario ? `EXISTS (
                        SELECT 1 FROM progreso_eventos pe
                        WHERE pe.evento_id = e.id AND pe.usuario_id = $1 AND pe.completado = true
                    )` : 'false'} AS completado
                FROM eventos_diarios e
                JOIN bancos_preguntas p ON e.pregunta_id = p.id
                JOIN bancos_ubicaciones u ON e.ubicacion_id = u.id
                WHERE e.activo = true
                AND e.fecha_expiracion > NOW()
                ORDER BY e.es_temporal DESC, e.id
            `, usuario ? [usuario.id] : []);
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

    async completarEvento(req, res) {
        try {
            const { eventoId, respuesta, latitud, longitud } = req.body;
            const usuarioId = req.user.id;

            const yaCompleto = await pool.query(
                'SELECT id FROM progreso_eventos WHERE usuario_id = $1 AND evento_id = $2 AND completado = true',
                [usuarioId, eventoId]
            );

            if (yaCompleto.rows.length > 0) {
                return res.status(400).json({ error: 'Ya completaste este reto' });
            }

            const evento = await pool.query(`
                SELECT e.*, COALESCE(p.tipo, 'pregunta') AS tipo, p.respuesta AS respuesta_correcta,
                       u.latitud AS ubicacion_lat, u.longitud AS ubicacion_lng, COALESCE(u.radio, 50) AS radio
                FROM eventos_diarios e
                JOIN bancos_preguntas p ON p.id = e.pregunta_id
                LEFT JOIN bancos_ubicaciones u ON u.id = e.ubicacion_id
                WHERE e.id = $1 AND e.activo = true AND e.fecha_expiracion > NOW()
            `, [eventoId]);

            if (evento.rows.length === 0) {
                return res.status(404).json({ error: 'Este reto ya no está disponible' });
            }

            const eventoData = evento.rows[0];

            // Los retos de pregunta se responden desde cualquier parte del
            // pueblo. Los puntos de encuentro ("reunion") consisten justamente
            // en llegar al lugar, así que esos sí verifican la distancia.
            if (eventoData.tipo === 'reunion' && eventoData.ubicacion_lat != null) {
                const lat = parseFloat(latitud);
                const lng = parseFloat(longitud);
                if (isNaN(lat) || isNaN(lng)) {
                    return res.status(400).json({ error: '📍 Activa tu ubicación para marcar tu llegada' });
                }
                const distancia = distanciaMetros(lat, lng, parseFloat(eventoData.ubicacion_lat), parseFloat(eventoData.ubicacion_lng));
                if (distancia > eventoData.radio + HOLGURA_GPS_M) {
                    return res.status(400).json({ error: `🚶 Llega al punto de encuentro (estás a ${Math.round(distancia)} m)` });
                }
            }

            // El resto exige la respuesta (antes una respuesta vacía completaba el reto)
            if (eventoData.tipo !== 'reunion') {
                if (!normalizar(respuesta)) {
                    return res.status(400).json({ error: 'Escribe una respuesta', codigo: 'SIN_RESPUESTA' });
                }
                if (!esRespuestaCorrecta(respuesta, eventoData.respuesta_correcta)) {
                    return res.status(400).json({ error: '❌ Respuesta incorrecta', codigo: 'INCORRECTA' });
                }
            }

            await pool.query(
                `INSERT INTO progreso_eventos (usuario_id, evento_id, completado, fecha_completado)
                VALUES ($1, $2, true, NOW())`,
                [usuarioId, eventoId]
            );

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
            const xpGanada = eventoData.xp_recompensa || 50;
            const nivelResult = await pool.query(`
                UPDATE usuarios
                SET xp_total = COALESCE(xp_total, 0) + $1,
                    nivel = LEAST(FLOOR((COALESCE(xp_total, 0) + $1) / 100) + 1, 5)
                WHERE id = $2
                RETURNING nivel, xp_total
            `, [xpGanada, usuarioId]);

            const nivelActual = nivelResult.rows[0]?.nivel || 1;
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
                    imagen_url: i.imagen_url
                }))
            });
        } catch (error) {
            console.error('Error en completarEvento:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = eventoController;
