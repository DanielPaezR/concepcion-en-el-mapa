const pool = require('../config/database');

class Encuesta {
    static async create({ reserva_id, calificacion_guia, calificacion_experiencia, comentarios, sugerencias, origen_turista }) {
        const query = `
            INSERT INTO encuestas (reserva_id, calificacion_guia, calificacion_experiencia, comentarios, sugerencias, origen_turista)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [reserva_id, calificacion_guia, calificacion_experiencia, comentarios, sugerencias, origen_turista];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByReservaId(reserva_id) {
        const result = await pool.query('SELECT * FROM encuestas WHERE reserva_id = $1', [reserva_id]);
        return result.rows[0];
    }

    static async findAll(filtros = {}) {
        let query = `
            SELECT e.*, r.fecha_encuentro, u.nombre as guia_nombre 
            FROM encuestas e
            JOIN reservas_guia r ON e.reserva_id = r.id
            JOIN usuarios u ON r.guia_id = u.id
            WHERE 1=1
        `;
        const values = [];
        
        if (filtros.guia_id) {
            values.push(filtros.guia_id);
            query += ` AND r.guia_id = $${values.length}`;
        }
        
        return (await pool.query(query, values)).rows;
    }

    static async getEstadisticas(filtros = {}) {
        const query = `
            SELECT 
                u.nombre as guia_nombre,
                COUNT(e.id) as total_encuestas,
                AVG(e.calificacion_guia) as promedio_guia,
                AVG(e.calificacion_experiencia) as promedio_experiencia
            FROM usuarios u
            JOIN reservas_guia r ON u.id = r.guia_id
            JOIN encuestas e ON r.id = e.reserva_id
            GROUP BY u.id, u.nombre
        `;
        return (await pool.query(query)).rows;
    }

    static async getEstadisticasGenerales(filtros = {}) {
        const query = `
            SELECT 
                AVG(calificacion_guia) as promedio_guia_total,
                AVG(calificacion_experiencia) as promedio_experiencia_total,
                COUNT(*) as total_respuestas
            FROM encuestas
        `;
        const result = await pool.query(query);
        return result.rows[0];
    }
}

module.exports = Encuesta;