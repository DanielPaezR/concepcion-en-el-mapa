// models/Reserva.js
const pool = require('../config/database');

const Reserva = {
    // Crear una nueva reserva
    async create(reservaData) {
        const { turista_id, lugar_id, fecha_encuentro, numero_personas, intereses, punto_encuentro } = reservaData;
        
        // Permitir turista_id NULL para visitantes anónimos
        const query = `
            INSERT INTO reservas_guia 
            (turista_id, lugar_id, fecha_encuentro, numero_personas, intereses, punto_encuentro, estado, fecha_solicitud)
            VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [turista_id, lugar_id, fecha_encuentro, numero_personas, intereses, punto_encuentro];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Obtener todas las reservas con filtros opcionales
    async findAll(filtros = {}) {
        let query = `
            SELECT r.*, 
                   u.nombre as turista_nombre, u.email as turista_email,
                   g.nombre as guia_nombre, g.email as guia_email,
                   l.nombre as lugar_nombre, l.direccion as lugar_direccion
            FROM reservas_guia r
            LEFT JOIN usuarios u ON r.turista_id = u.id
            LEFT JOIN usuarios g ON r.guia_id = g.id
            LEFT JOIN lugares l ON r.lugar_id = l.id
            WHERE 1=1
        `;
        const values = [];
        let paramIndex = 1;

        if (filtros.estado) {
            query += ` AND r.estado = $${paramIndex}`;
            values.push(filtros.estado);
            paramIndex++;
        }

        if (filtros.guia_id) {
            query += ` AND r.guia_id = $${paramIndex}`;
            values.push(filtros.guia_id);
            paramIndex++;
        }

        if (filtros.turista_id) {
            query += ` AND r.turista_id = $${paramIndex}`;
            values.push(filtros.turista_id);
            paramIndex++;
        }

        query += ` ORDER BY r.fecha_encuentro ASC`;
        
        const result = await pool.query(query, values);
        return result.rows;
    },

    // Obtener una reserva por ID
    async findById(id) {
        const query = `
            SELECT r.*, 
                   u.nombre as turista_nombre, u.email as turista_email,
                   g.nombre as guia_nombre, g.email as guia_email,
                   l.nombre as lugar_nombre
            FROM reservas_guia r
            LEFT JOIN usuarios u ON r.turista_id = u.id
            LEFT JOIN usuarios g ON r.guia_id = g.id
            LEFT JOIN lugares l ON r.lugar_id = l.id
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // Asignar un guía a una reserva
    async asignarGuia(id, guia_id) {
        const query = `
            UPDATE reservas_guia 
            SET guia_id = $1, estado = 'confirmada', fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [guia_id, id]);
        return result.rows[0];
    },

    // Actualizar estado de la reserva
    async updateEstado(id, estado, motivo = null) {
        const query = `
            UPDATE reservas_guia 
            SET estado = $1, 
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [estado, id]);
        return result.rows[0];
    },

    // Obtener guías disponibles
    async getGuiasDisponibles() {
        const query = `
            SELECT id, nombre, email, telefono, calificacion_promedio
            FROM usuarios
            WHERE rol = 'guia' AND disponible = true
            ORDER BY calificacion_promedio DESC NULLS LAST
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // Verificar disponibilidad de guías para una fecha
    async verificarDisponibilidad(fecha_encuentro) {
        const query = `
            SELECT u.*
            FROM usuarios u
            WHERE u.rol = 'guia' 
              AND u.disponible = true
              AND u.id NOT IN (
                  SELECT guia_id 
                  FROM reservas_guia 
                  WHERE fecha_encuentro = $1 
                    AND estado IN ('confirmada', 'pendiente')
              )
        `;
        const result = await pool.query(query, [fecha_encuentro]);
        return result.rows;
    }
};

module.exports = Reserva;