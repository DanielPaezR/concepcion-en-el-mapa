// controllers/usuarioController.js
const pool = require('../config/database');

const usuarioController = {
    // Listar usuarios (con filtro por rol)
    async listar(req, res) {
        try {
            const { rol } = req.query;
            let query = 'SELECT id, nombre, email, telefono, rol, disponible, calificacion_promedio, created_at FROM usuarios';
            let params = [];
            
            if (rol) {
                query += ' WHERE rol = $1';
                params.push(rol);
            }
            
            query += ' ORDER BY id DESC';
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            res.status(500).json({ error: 'Error al listar usuarios' });
        }
    },

    // Obtener un usuario por ID
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const query = 'SELECT id, nombre, email, telefono, rol, disponible, calificacion_promedio, created_at FROM usuarios WHERE id = $1';
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ error: 'Error al obtener usuario' });
        }
    },

    // Cambiar disponibilidad de un guía
    async cambiarDisponibilidad(req, res) {
        try {
            const { id } = req.params;
            const { disponible } = req.body;
            
            const query = 'UPDATE usuarios SET disponible = $1 WHERE id = $2 AND rol = $3 RETURNING *';
            const result = await pool.query(query, [disponible, id, 'guia']);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Guía no encontrado' });
            }
            
            res.json({
                message: `Guía ${disponible ? 'activado' : 'desactivado'}`,
                usuario: result.rows[0]
            });
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            res.status(500).json({ error: 'Error al cambiar disponibilidad' });
        }
    },

    // Actualizar calificación de un guía
    async actualizarCalificacion(req, res) {
        try {
            const { id } = req.params;
            const { calificacion } = req.body;
            
            const query = `
                UPDATE usuarios 
                SET calificacion_promedio = (
                    SELECT AVG(calificacion_guia) FROM encuestas 
                    JOIN reservas_guia ON encuestas.reserva_id = reservas_guia.id 
                    WHERE reservas_guia.guia_id = $1
                )
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await pool.query(query, [id]);
            res.json({ message: 'Calificación actualizada', usuario: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar calificación:', error);
            res.status(500).json({ error: 'Error al actualizar calificación' });
        }
    }
};

module.exports = usuarioController;