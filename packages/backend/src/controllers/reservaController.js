// controllers/reservaController.js
const Reserva = require('../models/Reserva');
const pool = require('../config/database');
const pushNotificationService = require('../services/pushNotificationService');

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

            const query = `
                INSERT INTO reservas_guia 
                (turista_id, lugar_id, guia_id, fecha_encuentro, numero_personas, intereses, punto_encuentro, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente')
                RETURNING *
            `;
            const values = [turistaId, lugar_id, null, fecha_encuentro, numero_personas, intereses, punto_encuentro];
            const result = await pool.query(query, values);
            const reservaCreada = result.rows[0];

            const notificationGuia = {
                title: 'Nueva petición de reserva',
                body: `Solicitud de reserva para ${numero_personas} personas en ${fecha_encuentro}.`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'reserva-pendiente',
                data: { url: '/guia/reservas', tipo: 'reserva_pendiente', relacionadoId: reservaCreada.id },
                tipo: 'reserva_pendiente',
                relacionadoId: reservaCreada.id
            };

            await pushNotificationService.sendToRole('guia', notificationGuia);

            res.status(201).json({
                success: true,
                message: 'Solicitud de guía creada exitosamente',
                reserva: reservaCreada
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

            // Filtros según rol
            if (req.user.rol === 'guia') {
                // Guías ven sus reservas asignadas + reservas pendientes para aceptar
                query += ` AND (r.guia_id = $${paramIndex} OR r.estado = $${paramIndex + 1})`;
                values.push(req.user.id, 'pendiente');
                paramIndex += 2;
            } else if (req.user.rol === 'turista') {
                query += ` AND r.turista_id = $${paramIndex}`;
                values.push(req.user.id);
                paramIndex++;
            } else if (req.user.rol === 'admin') {
                if (estado) {
                    query += ` AND r.estado = $${paramIndex}`;
                    values.push(estado);
                    paramIndex++;
                }
                if (guia_id) {
                    query += ` AND r.guia_id = $${paramIndex}`;
                    values.push(guia_id);
                    paramIndex++;
                }
                if (turista_id) {
                    query += ` AND r.turista_id = $${paramIndex}`;
                    values.push(turista_id);
                    paramIndex++;
                }
            }

            query += ' ORDER BY r.fecha_solicitud DESC';

            const result = await pool.query(query, values);
            res.json(result.rows);
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

            const notificationTurista = {
                title: 'Tu guía aceptó la reserva',
                body: 'Tu reserva ha sido confirmada por el guía y ya está en camino.',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'reserva-confirmada',
                data: { url: '/mis-reservas', tipo: 'reserva_confirmada', relacionadoId: reserva.id },
                tipo: 'reserva_confirmada',
                relacionadoId: reserva.id
            };

            const notificationGuia = {
                title: 'Reserva aceptada',
                body: 'Has aceptado una nueva reserva y está ahora confirmada.',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'reserva-asignada',
                data: { url: '/mis-reservas', tipo: 'reserva_asignada', relacionadoId: reserva.id },
                tipo: 'reserva_asignada',
                relacionadoId: reserva.id
            };

            await Promise.allSettled([
                pushNotificationService.sendToUser(reserva.turista_id, notificationTurista),
                pushNotificationService.sendToUser(reserva.guia_id, notificationGuia)
            ]);

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
                if (estado === 'confirmada') {
                    if (reservaActual.guia_id && reservaActual.guia_id !== usuarioId) {
                        return res.status(403).json({ error: 'No puedes confirmar reservas asignadas a otro guía' });
                    }
                } else if (reservaActual.guia_id !== usuarioId) {
                    return res.status(403).json({ error: 'No puedes modificar reservas que no te pertenecen' });
                }
            } else if (usuarioRol !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para esta acción' });
            }

            let query = 'UPDATE reservas_guia SET estado = $1, fecha_actualizacion = NOW() WHERE id = $2';
            const params = [estado, id];

            if (usuarioRol === 'guia' && estado === 'confirmada') {
                query = 'UPDATE reservas_guia SET estado = $1, guia_id = $2, fecha_actualizacion = NOW() WHERE id = $3 RETURNING *';
                params.splice(0, 2, estado, usuarioId, id);
            } else {
                query += ' RETURNING *';
            }

            const result = await pool.query(query, params);
            const reservaActualizada = result.rows[0];

            if (estado === 'confirmada') {
                const notificationTurista = {
                    title: 'Tu reserva fue aceptada',
                    body: 'Un guía aceptó y confirmó tu reserva. Revisa los detalles en tu panel.',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-192x192.png',
                    tag: 'reserva-confirmada',
                    data: { url: '/mis-reservas', tipo: 'reserva_confirmada', relacionadoId: reservaActualizada.id },
                    tipo: 'reserva_confirmada',
                    relacionadoId: reservaActualizada.id
                };

                await pushNotificationService.sendToUser(reservaActualizada.turista_id, notificationTurista);
            }

            res.json({ success: true, reserva: reservaActualizada });
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