// controllers/metricasController.js
const pool = require('../config/database');

const metricasController = {
    // Obtener estadísticas generales
    async getEstadisticas(req, res) {
        try {
            // Total de lugares
            const lugaresResult = await pool.query('SELECT COUNT(*) FROM lugares WHERE activo = true');
            
            // Total de lugares visitados (descubiertos por usuarios)
            const visitadosResult = await pool.query(`
                SELECT COUNT(DISTINCT lugar_id) FROM reservas_guia 
                WHERE estado IN ('confirmada', 'completada')
            `);
            
            // Total de reservas
            const reservasResult = await pool.query('SELECT COUNT(*) FROM reservas_guia');
            
            // Reservas pendientes
            const pendientesResult = await pool.query(
                "SELECT COUNT(*) FROM reservas_guia WHERE estado = 'pendiente'"
            );
            
            // Total de guías activos
            const guiasResult = await pool.query(
                "SELECT COUNT(*) FROM usuarios WHERE rol = 'guia' AND disponible = true"
            );
            
            // Total de encuestas respondidas
            const encuestasResult = await pool.query('SELECT COUNT(*) FROM encuestas');
            
            // Calificación promedio general
            const calificacionResult = await pool.query(`
                SELECT AVG(calificacion_guia) as promedio FROM encuestas
            `);
            
            res.json({
                success: true,
                data: {
                    totalLugares: parseInt(lugaresResult.rows[0].count),
                    lugaresVisitados: parseInt(visitadosResult.rows[0].count),
                    totalReservas: parseInt(reservasResult.rows[0].count),
                    reservasPendientes: parseInt(pendientesResult.rows[0].count),
                    guiasActivos: parseInt(guiasResult.rows[0].count),
                    totalEncuestas: parseInt(encuestasResult.rows[0].count),
                    calificacionPromedio: parseFloat(calificacionResult.rows[0].promedio || 0)
                }
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    // Reservas por mes (últimos 6 meses)
    async getReservasPorMes(req, res) {
        try {
            const query = `
                SELECT 
                    DATE_TRUNC('month', fecha_encuentro) as mes,
                    COUNT(*) as total
                FROM reservas_guia
                WHERE fecha_encuentro >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', fecha_encuentro)
                ORDER BY mes DESC
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener reservas por mes' });
        }
    },

    // Lugares más visitados
    async getLugaresTop(req, res) {
        try {
            const query = `
                SELECT 
                    l.nombre,
                    COUNT(r.id) as visitas
                FROM lugares l
                LEFT JOIN reservas_guia r ON l.id = r.lugar_id
                WHERE r.estado IN ('confirmada', 'completada')
                GROUP BY l.id, l.nombre
                ORDER BY visitas DESC
                LIMIT 5
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener lugares top' });
        }
    },

    // Origen de turistas (ciudades/países)
    async getOrigenTuristas(req, res) {
        try {
            const query = `
                SELECT 
                    origen_turista,
                    COUNT(*) as total
                FROM encuestas
                WHERE origen_turista IS NOT NULL
                GROUP BY origen_turista
                ORDER BY total DESC
                LIMIT 5
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener origen de turistas' });
        }
    },

    // Calificaciones por mes
    async getCalificacionesPorMes(req, res) {
        try {
            const query = `
                SELECT 
                    DATE_TRUNC('month', e.created_at) as mes,
                    AVG(e.calificacion_guia) as promedio_guia,
                    AVG(e.calificacion_experiencia) as promedio_experiencia
                FROM encuestas e
                WHERE e.created_at >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', e.created_at)
                ORDER BY mes DESC
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener calificaciones' });
        }
    },

    // Actividad reciente
    async getActividadReciente(req, res) {
        try {
            const query = `
                SELECT 
                    'reserva' as tipo,
                    r.id as id,
                    u.nombre as usuario,
                    l.nombre as lugar,
                    r.fecha_encuentro as fecha,
                    r.estado as estado
                FROM reservas_guia r
                LEFT JOIN usuarios u ON r.turista_id = u.id
                LEFT JOIN lugares l ON r.lugar_id = l.id
                UNION ALL
                SELECT 
                    'encuesta' as tipo,
                    e.id as id,
                    u.nombre as usuario,
                    'Encuesta' as lugar,
                    e.created_at as fecha,
                    e.calificacion_guia::text as estado
                FROM encuestas e
                LEFT JOIN reservas_guia r ON e.reserva_id = r.id
                LEFT JOIN usuarios u ON r.turista_id = u.id
                ORDER BY fecha DESC
                LIMIT 10
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al obtener actividad reciente' });
        }
    }
};

module.exports = metricasController;