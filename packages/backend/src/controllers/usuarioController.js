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

    // Asegúrate que obtenerPorId devuelva nivel y xp_total
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const query = `
                SELECT 
                    id, 
                    nombre, 
                    email, 
                    telefono, 
                    rol, 
                    disponible, 
                    calificacion_promedio,
                    COALESCE(nivel, 1) as nivel,
                    COALESCE(xp_total, 0) as xp_total,
                    created_at 
                FROM usuarios 
                WHERE id = $1
            `;
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
    },
    async crearGuia(req, res) {
        try {
            const { nombre, email, telefono, password } = req.body;
            
            // Verificar si ya existe
            const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
            if (existe.rows.length > 0) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            
            // Hash de contraseña
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password || 'guiadefault123', 10);
            
            const result = await pool.query(
                `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol, disponible) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [nombre, email, telefono, hashedPassword, 'guia', true]
            );
            
            // Crear perfil de guardián automáticamente
            await pool.query(
                `INSERT INTO perfiles_guardian (usuario_id, nombre_publico, visible) 
                 VALUES ($1, $2, true) ON CONFLICT (usuario_id) DO NOTHING`,
                [result.rows[0].id, nombre]
            );
            
            res.status(201).json({ success: true, guia: result.rows[0] });
        } catch (error) {
            console.error('Error al crear guía:', error);
            res.status(500).json({ error: 'Error al crear guía' });
        }
    },

    // Actualizar guía
    async actualizarGuia(req, res) {
        try {
            const { id } = req.params;
            const { nombre, email, telefono, disponible } = req.body;
            
            const result = await pool.query(
                `UPDATE usuarios 
                 SET nombre = COALESCE($1, nombre),
                     email = COALESCE($2, email),
                     telefono = COALESCE($3, telefono),
                     disponible = COALESCE($4, disponible)
                 WHERE id = $5 AND rol = 'guia'
                 RETURNING *`,
                [nombre, email, telefono, disponible, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Guía no encontrado' });
            }
            
            res.json({ success: true, guia: result.rows[0] });
        } catch (error) {
            console.error('Error al actualizar guía:', error);
            res.status(500).json({ error: 'Error al actualizar guía' });
        }
    },

    // Eliminar guía
    async eliminarGuia(req, res) {
        try {
            const { id } = req.params;
            
            const result = await pool.query(
                'DELETE FROM usuarios WHERE id = $1 AND rol = $2 RETURNING id',
                [id, 'guia']
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Guía no encontrado' });
            }
            
            res.json({ success: true, message: 'Guía eliminado' });
        } catch (error) {
            console.error('Error al eliminar guía:', error);
            res.status(500).json({ error: 'Error al eliminar guía' });
        }
    },

    // =============================================
    // SEGUIMIENTO DE HORAS
    // =============================================

    // Iniciar sesión de trabajo
    async iniciarSesion(req, res) {
        try {
            const guiaId = req.user.id;
            const hoy = new Date().toISOString().split('T')[0];
            const ahora = new Date().toTimeString().split(' ')[0];
            
            // Verificar si ya tiene una sesión activa hoy
            const activa = await pool.query(
                'SELECT id FROM sesiones_guias WHERE guia_id = $1 AND fecha = $2 AND activa = true',
                [guiaId, hoy]
            );
            
            if (activa.rows.length > 0) {
                return res.status(400).json({ error: 'Ya tienes una sesión activa hoy' });
            }
            
            const result = await pool.query(
                `INSERT INTO sesiones_guias (guia_id, fecha, hora_inicio, activa)
                 VALUES ($1, $2, $3, true) RETURNING *`,
                [guiaId, hoy, ahora]
            );
            
            res.json({ success: true, sesion: result.rows[0] });
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },

    // Finalizar sesión de trabajo
    async finalizarSesion(req, res) {
        try {
            const guiaId = req.user.id;
            const hoy = new Date().toISOString().split('T')[0];
            const ahora = new Date().toTimeString().split(' ')[0];
            
            const result = await pool.query(
                `UPDATE sesiones_guias 
                 SET hora_fin = $1, 
                     duracion_minutos = EXTRACT(EPOCH FROM ($1::time - hora_inicio))/60,
                     activa = false,
                     updated_at = NOW()
                 WHERE guia_id = $2 AND fecha = $3 AND activa = true
                 RETURNING *`,
                [ahora, guiaId, hoy]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'No se encontró sesión activa' });
            }
            
            res.json({ success: true, sesion: result.rows[0] });
        } catch (error) {
            console.error('Error al finalizar sesión:', error);
            res.status(500).json({ error: 'Error al finalizar sesión' });
        }
    },

    // Obtener estadísticas de horas por guía
    async estadisticasSesiones(req, res) {
        try {
            const { guiaId, fechaInicio, fechaFin } = req.query;
            
            let query = `
                SELECT 
                    u.id,
                    u.nombre,
                    COALESCE(SUM(s.duracion_minutos), 0) as total_minutos,
                    COUNT(s.id) as dias_trabajados,
                    ROUND(COALESCE(AVG(s.duracion_minutos), 0)) as promedio_minutos
                FROM usuarios u
                LEFT JOIN sesiones_guias s ON u.id = s.guia_id
                WHERE u.rol = 'guia'
            `;
            const params = [];
            let paramIndex = 1;
            
            if (guiaId) {
                query += ` AND u.id = $${paramIndex++}`;
                params.push(guiaId);
            }
            if (fechaInicio) {
                query += ` AND s.fecha >= $${paramIndex++}`;
                params.push(fechaInicio);
            }
            if (fechaFin) {
                query += ` AND s.fecha <= $${paramIndex++}`;
                params.push(fechaFin);
            }
            
            query += ` GROUP BY u.id, u.nombre ORDER BY total_minutos DESC`;
            
            const result = await pool.query(query, params);
            res.json({ success: true, estadisticas: result.rows });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    // Obtener detalle de sesiones por guía
    async detalleSesiones(req, res) {
        try {
            const { guiaId } = req.params;
            const { fechaInicio, fechaFin } = req.query;
            
            let query = `
                SELECT 
                    s.*,
                    u.nombre as guia_nombre
                FROM sesiones_guias s
                JOIN usuarios u ON s.guia_id = u.id
                WHERE s.guia_id = $1
            `;
            const params = [guiaId];
            let paramIndex = 2;
            
            if (fechaInicio) {
                query += ` AND s.fecha >= $${paramIndex++}`;
                params.push(fechaInicio);
            }
            if (fechaFin) {
                query += ` AND s.fecha <= $${paramIndex++}`;
                params.push(fechaFin);
            }
            
            query += ` ORDER BY s.fecha DESC, s.hora_inicio DESC`;
            
            const result = await pool.query(query, params);
            res.json({ success: true, sesiones: result.rows });
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            res.status(500).json({ error: 'Error al obtener detalle' });
        }
    }
};

module.exports = usuarioController;