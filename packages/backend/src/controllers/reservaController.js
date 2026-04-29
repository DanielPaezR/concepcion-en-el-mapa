// controllers/reservaController.js
const Reserva = require('../models/Reserva');
const pool = require('../config/database');

const reservaController = {
    // Crear una nueva solicitud de guía
    async create(req, res) {
        try {
            const { lugar_id, fecha_encuentro, numero_personas, intereses, punto_encuentro, turista_id } = req.body;
            
            // Usar turista_id del body si existe, sino del token, sino null
            const turistaId = turista_id || req.user?.id || null;

            console.log('📝 Creando reserva:', { lugar_id, fecha_encuentro, numero_personas, turista_id: turistaId });

            // Validar campos requeridos
            if (!lugar_id || !fecha_encuentro || !numero_personas) {
                return res.status(400).json({ 
                    error: 'Faltan campos requeridos',
                    details: 'lugar_id, fecha_encuentro y numero_personas son obligatorios'
                });
            }

            // Buscar un guía disponible automáticamente
            const guiaDisponible = await pool.query(`
                SELECT id FROM usuarios 
                WHERE rol = 'guia' AND disponible = true 
                ORDER BY RANDOM() 
                LIMIT 1
            `);

            const guia_id = guiaDisponible.rows[0]?.id || null;

            const query = `
                INSERT INTO reservas_guia 
                (turista_id, lugar_id, guia_id, fecha_encuentro, numero_personas, intereses, punto_encuentro, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
                RETURNING *
            `;
            const values = [turistaId, lugar_id, guia_id, fecha_encuentro, numero_personas, intereses, punto_encuentro];
            const result = await pool.query(query, values);

            res.status(201).json({
                success: true,
                message: 'Solicitud de guía creada exitosamente',
                reserva: result.rows[0]
            });
        } catch (error) {
            console.error('❌ Error al crear reserva:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener todas las reservas (con filtros)
    async getAll(req, res) {
        try {
            const { estado, guia_id, turista_id } = req.query;
            const filtros = {};

            // Filtros según rol
            if (req.user.rol === 'guia') {
                filtros.guia_id = req.user.id;
            } else if (req.user.rol === 'turista') {
                filtros.turista_id = req.user.id;
            } else if (req.user.rol === 'admin') {
                if (estado) filtros.estado = estado;
                if (guia_id) filtros.guia_id = guia_id;
                if (turista_id) filtros.turista_id = turista_id;
            }

            const reservas = await Reserva.findAll(filtros);
            res.json(reservas);
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            res.status(500).json({ error: 'Error al obtener las reservas' });
        }
    },

    // Obtener una reserva por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const reserva = await Reserva.findById(id);

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar permisos
            if (req.user.rol !== 'admin' && 
                reserva.turista_id !== req.user.id && 
                reserva.guia_id !== req.user.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            res.json(reserva);
        } catch (error) {
            console.error('Error al obtener reserva:', error);
            res.status(500).json({ error: 'Error al obtener la reserva' });
        }
    },

    // Asignar guía a una reserva (solo admin)
    async asignarGuia(req, res) {
        try {
            const { id } = req.params;
            const { guia_id } = req.body;

            if (req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'Solo administradores pueden asignar guías' });
            }

            const reserva = await Reserva.asignarGuia(id, guia_id);
            
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Aquí podrías notificar al turista y al guía
            // notificarAsignacion(reserva);

            res.json({
                message: 'Guía asignado exitosamente',
                reserva
            });
        } catch (error) {
            console.error('Error al asignar guía:', error);
            res.status(500).json({ error: 'Error al asignar el guía' });
        }
    },

    // Actualizar estado de reserva
    async updateEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const usuarioId = req.user.id;
            const usuarioRol = req.user.rol;

            // Obtener reserva
            const reserva = await pool.query(
                'SELECT guia_id, estado FROM reservas_guia WHERE id = $1',
                [id]
            );

            if (reserva.rows.length === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            const reservaActual = reserva.rows[0];

            // Verificar permisos
            if (usuarioRol === 'guia') {
                if (reservaActual.guia_id !== usuarioId) {
                    return res.status(403).json({ error: 'No puedes modificar reservas que no te pertenecen' });
                }
            } else if (usuarioRol !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para esta acción' });
            }

            // Actualizar
            const result = await pool.query(
                'UPDATE reservas_guia SET estado = $1, fecha_actualizacion = NOW() WHERE id = $2 RETURNING *',
                [estado, id]
            );

            res.json({ success: true, reserva: result.rows[0] });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    },

    // Obtener guías disponibles
    async getGuiasDisponibles(req, res) {
        try {
            const { fecha } = req.query;
            
            let guias;
            if (fecha) {
                guias = await Reserva.verificarDisponibilidad(fecha);
            } else {
                guias = await Reserva.getGuiasDisponibles();
            }

            res.json(guias);
        } catch (error) {
            console.error('Error al obtener guías disponibles:', error);
            res.status(500).json({ error: 'Error al obtener guías disponibles' });
        }
    },

    async getGuiasDisponiblesPublic(req, res) {
        try {
            // Versión pública que no requiere autenticación
            const guias = await Reserva.getGuiasDisponibles();
            res.json(guias);
        } catch (error) {
            console.error('Error al obtener guías disponibles:', error);
            res.status(500).json({ error: 'Error al obtener guías disponibles' });
        }
    }
};

module.exports = reservaController;