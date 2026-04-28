// controllers/encuestaController.js
const Encuesta = require('../models/Encuesta');
const Reserva = require('../models/Reserva');

const encuestaController = {
    // Crear una nueva encuesta
    async create(req, res) {
        try {
            const { 
                reserva_id, 
                calificacion_guia, 
                calificacion_experiencia, 
                comentarios, 
                sugerencias, 
                origen_turista 
            } = req.body;

            // Validar que la reserva existe y pertenece al usuario
            const reserva = await Reserva.findById(reserva_id);
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el usuario es el turista de la reserva
            if (reserva.turista_id !== req.user.id) {
                return res.status(403).json({ error: 'No autorizado para encuestar esta reserva' });
            }

            // Validar calificaciones
            if (calificacion_guia < 1 || calificacion_guia > 5 || 
                calificacion_experiencia < 1 || calificacion_experiencia > 5) {
                return res.status(400).json({ error: 'Las calificaciones deben ser entre 1 y 5' });
            }

            // Verificar si ya existe una encuesta para esta reserva
            const encuestaExistente = await Encuesta.findByReservaId(reserva_id);
            if (encuestaExistente) {
                return res.status(400).json({ error: 'Ya existe una encuesta para esta reserva' });
            }

            const encuesta = await Encuesta.create({
                reserva_id,
                calificacion_guia,
                calificacion_experiencia,
                comentarios,
                sugerencias,
                origen_turista
            });

            res.status(201).json({
                message: 'Encuesta enviada exitosamente',
                encuesta
            });
        } catch (error) {
            console.error('Error al crear encuesta:', error);
            res.status(500).json({ error: 'Error al enviar la encuesta' });
        }
    },

    // Obtener encuestas (con filtros para admin)
    async getAll(req, res) {
        try {
            if (req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'Solo administradores pueden ver todas las encuestas' });
            }

            const { guia_id, fecha_inicio, fecha_fin } = req.query;
            const filtros = {};

            if (guia_id) filtros.guia_id = guia_id;
            if (fecha_inicio && fecha_fin) {
                filtros.fecha_inicio = fecha_inicio;
                filtros.fecha_fin = fecha_fin;
            }

            const encuestas = await Encuesta.findAll(filtros);
            res.json(encuestas);
        } catch (error) {
            console.error('Error al obtener encuestas:', error);
            res.status(500).json({ error: 'Error al obtener las encuestas' });
        }
    },

    // Obtener encuesta por reserva (para el turista)
    async getByReserva(req, res) {
        try {
            const { reserva_id } = req.params;
            const usuarioId = req.user.id;
            
            console.log(`🔍 Buscando reserva ${reserva_id} para usuario ${usuarioId}`);
            
            // Primero, buscar la reserva directamente con SQL para depurar
            const reserva = await pool.query(
                'SELECT * FROM reservas_guia WHERE id = $1',
                [reserva_id]
            );
            
            console.log('Reserva encontrada:', reserva.rows[0]);
            
            if (reserva.rows.length === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            
            const reservaData = reserva.rows[0];
            
            // Verificar permisos
            if (req.user.rol !== 'admin' && 
                reservaData.turista_id !== usuarioId && 
                reservaData.guia_id !== usuarioId) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            
            const encuesta = await Encuesta.findByReservaId(reserva_id);
            
            if (!encuesta) {
                return res.json({ success: true, encuesta: null });
            }
            
            res.json({ success: true, encuesta });
        } catch (error) {
            console.error('Error al obtener encuesta:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener estadísticas de encuestas (para dashboard)
    async getEstadisticas(req, res) {
        try {
            if (req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'Solo administradores pueden ver estadísticas' });
            }

            const { fecha_inicio, fecha_fin } = req.query;
            const filtros = {};

            if (fecha_inicio && fecha_fin) {
                filtros.fecha_inicio = fecha_inicio;
                filtros.fecha_fin = fecha_fin;
            }

            const estadisticas = await Encuesta.getEstadisticas(filtros);
            
            // Calcular promedios generales
            const promedios = await Encuesta.getEstadisticasGenerales(filtros);

            res.json({
                detallado: estadisticas,
                general: promedios
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    }
};

module.exports = encuestaController;