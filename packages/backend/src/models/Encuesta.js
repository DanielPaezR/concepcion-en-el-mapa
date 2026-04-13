// models/Encuesta.js
const pool = require('../config/database');

const Encuesta = {
    // Crear una nueva encuesta
    async create(encuestaData) {
        const { 
            reserva_id, 
            calificacion_guia, 
            calificacion_experiencia, 
            comentarios, 
            sugerencias, 
            origen_turista 
        } = encuestaData;

        const query = `
            INSERT INTO encuestas 
            (reserva_id, calificacion_guia, calificacion_experiencia, comentarios, sugerencias, origen_turista)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [reserva_id, calificacion_guia, calificacion_experiencia, comentarios, sugerencias, origen_turista];
        const result = await pool.query(query, values);
        
        // Actualizar calificación promedio del guía
        await this.actualizarCalificacionGuia(reserva_id);
        
        return result.rows[0];
    },

    // Obtener encuestas por reserva
    async findByReservaId(reserva_id) {
        const query = 'SELECT * FROM encuestas WHERE reserva_id = $1';
        const result = await pool.query(query, [reserva_id]);
        return result.rows[0];
    },

    // Obtener todas las encuestas con filtros
    async findAll(filtros = {}) {
        let query = `
            SELECT e.*, 
                   r.guia_id, r.turista_id,
                   u.nombre as turista_nombre,
                   g.nombre as guia_nombre,
                   l.nombre as lugar_nombre
            FROM encuestas e
            JOIN reservas_guia r ON e.reserva_id = r.id
            JOIN usuarios u ON r.turista_id = u.id
            JOIN usuarios g ON r.guia_id = g.id
            JOIN lugares l ON r.lugar_id = l.id
            WHERE 1=1
        `;
        const values = [];
        let paramIndex = 1;

        if (filtros.guia_id) {
            query += ` AND r.guia_id = $${paramIndex}`;
            values.push(filtros.guia_id);
            paramIndex++;
        }

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ` AND e.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            values.push(filtros.fecha_inicio, filtros.fecha_fin);
            paramIndex += 2;
        }

        query += ` ORDER BY e.created_at DESC`;
        
        const result = await pool.query(query, values);
        return result.rows;
    },

    // Obtener estadísticas de encuestas
    async getEstadisticas(filtros = {}) {
        let query = `
            SELECT 
                AVG(calificacion_guia) as promedio_calificacion_guia,
                AVG(calificacion_experiencia) as promedio_calificacion_experiencia,
                COUNT(*) as total_encuestas,
                origen_turista,
                DATE(created_at) as fecha
            FROM encuestas e
            JOIN reservas_guia r ON e.reserva_id = r.id
            WHERE 1=1
        `;
        const values = [];
        let paramIndex = 1;

        if (filtros.fecha_inicio && filtros.fecha_fin) {
            query += ` AND e.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            values.push(filtros.fecha_inicio, filtros.fecha_fin);
            paramIndex += 2;
        }

        query += ` GROUP BY origen_turista, DATE(created_at)`;
        
        const result = await pool.query(query, values);
        return result.rows;
    },

    // Actualizar calificación promedio del guía
    async actualizarCalificacionGuia(reserva_id) {
        // Obtener el guía de la reserva
        const reservaQuery = 'SELECT guia_id FROM reservas_guia WHERE id = $1';
        const reservaResult = await pool.query(reservaQuery, [reserva_id]);
        
        if (reservaResult.rows[0]?.guia_id) {
            const guia_id = reservaResult.rows[0].guia_id;
            
            // Calcular nuevo promedio
            const promedioQuery = `
                UPDATE usuarios 
                SET calificacion_promedio = (
                    SELECT AVG(calificacion_guia)::DECIMAL(3,2)
                    FROM encuestas e
                    JOIN reservas_guia r ON e.reserva_id = r.id
                    WHERE r.guia_id = $1
                )
                WHERE id = $1
                RETURNING *
            `;
            await pool.query(promedioQuery, [guia_id]);
        }
    }
};

module.exports = Encuesta;