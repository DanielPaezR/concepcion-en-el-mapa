// controllers/reservaController.js
const Reserva = require('../models/Reserva');

const reservaController = {
    // Crear una nueva solicitud de guía
    async create(req, res) {
        try {
            const { lugar_id, fecha_encuentro, numero_personas, intereses, punto_encuentro } = req.body;
            
            // Validar campos requeridos
            if (!lugar_id || !fecha_encuentro || !numero_personas) {
                return res.status(400).json({ 
                    error: 'Faltan campos requeridos',
                    details: 'lugar_id, fecha_encuentro y numero_personas son obligatorios'
                });
            }

            // Crear reserva sin usuario (turista anónimo)
            // O puedes asignar un usuario por defecto para turistas
            const reserva = await Reserva.create({
                turista_id: null, // O un ID de turista genérico
                lugar_id,
                fecha_encuentro,
                numero_personas,
                intereses,
                punto_encuentro
            });

            res.status(201).json({
                message: 'Solicitud de guía creada exitosamente',
                reserva
            });
        } catch (error) {
            console.error('Error al crear reserva:', error);
            res.status(500).json({ error: 'Error al crear la solicitud de guía' });
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

            const reserva = await Reserva.findById(id);

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar permisos según el estado
            if (estado === 'cancelada') {
                // Puede cancelar el turista, el guía o el admin
                if (req.user.rol !== 'admin' && 
                    reserva.turista_id !== req.user.id && 
                    reserva.guia_id !== req.user.id) {
                    return res.status(403).json({ error: 'No autorizado para cancelar' });
                }
            } else if (estado === 'confirmada') {
                // Solo el guía o admin pueden confirmar
                if (req.user.rol !== 'admin' && reserva.guia_id !== req.user.id) {
                    return res.status(403).json({ error: 'No autorizado para confirmar' });
                }
            } else if (estado === 'completada') {
                // Solo admin puede marcar como completada
                if (req.user.rol !== 'admin') {
                    return res.status(403).json({ error: 'Solo admin puede completar reservas' });
                }
            }

            const reservaActualizada = await Reserva.updateEstado(id, estado);

            res.json({
                message: 'Estado actualizado exitosamente',
                reserva: reservaActualizada
            });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({ error: 'Error al actualizar el estado' });
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