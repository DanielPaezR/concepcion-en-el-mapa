const pool = require('../config/database');

const mensajesController = {
  // Obtener mensajes de una reserva (solo si el usuario es parte)
  async obtenerMensajes(req, res) {
    const { reservaId } = req.params;
    const usuarioId = req.user.id;

    try {
      // Verificar que el usuario pertenece a la reserva (turista_id o guia_id)
      const check = await pool.query(
        `SELECT id FROM reservas_guia 
         WHERE id = $1 AND (turista_id = $2 OR guia_id = $2)`,
        [reservaId, usuarioId]
      );
      if (check.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
      }

      const result = await pool.query(
        `SELECT m.*, 
                u.nombre as emisor_nombre, 
                u2.nombre as receptor_nombre
         FROM mensajes m
         JOIN usuarios u ON m.emisor_id = u.id
         JOIN usuarios u2 ON m.receptor_id = u2.id
         WHERE m.reserva_id = $1
         ORDER BY m.created_at ASC`,
        [reservaId]
      );

      // Marcar como leídos los mensajes donde el usuario es receptor
      await pool.query(
        `UPDATE mensajes SET leido = true 
         WHERE reserva_id = $1 AND receptor_id = $2 AND leido = false`,
        [reservaId, usuarioId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // Enviar nuevo mensaje
  async enviarMensaje(req, res) {
    const { reservaId, mensaje } = req.body;
    const emisorId = req.user.id;

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    try {
      // Obtener la reserva para saber quién es el receptor
      const reserva = await pool.query(
        `SELECT turista_id, guia_id FROM reservas_guia WHERE id = $1`,
        [reservaId]
      );
      if (reserva.rows.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      const { turista_id, guia_id } = reserva.rows[0];
      const receptorId = emisorId === turista_id ? guia_id : turista_id;

      if (emisorId !== turista_id && emisorId !== guia_id) {
        return res.status(403).json({ error: 'No perteneces a esta reserva' });
      }

      const result = await pool.query(
        `INSERT INTO mensajes (reserva_id, emisor_id, receptor_id, mensaje)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [reservaId, emisorId, receptorId, mensaje.trim()]
      );

      const nuevoMensaje = result.rows[0];

      // Emitir evento WebSocket
      const io = req.app.get('io');
      if (io) {
        // Enviar al receptor
        io.to(`usuario_${receptorId}`).emit('nuevo-mensaje', {
          reservaId,
          mensaje: nuevoMensaje,
          emisor: { id: emisorId, nombre: req.user.nombre }
        });
        // También al emisor para actualizar su propia UI
        io.to(`usuario_${emisorId}`).emit('mensaje-enviado', nuevoMensaje);
      }

      res.status(201).json(nuevoMensaje);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  },

  // Obtener lista de conversaciones del usuario (último mensaje por reserva)
  async obtenerConversaciones(req, res) {
    const usuarioId = req.user.id;

    try {
      const result = await pool.query(
        `SELECT DISTINCT ON (r.id) 
            r.id as reserva_id,
            r.fecha_encuentro,
            l.nombre as lugar_nombre,
            CASE 
                WHEN r.turista_id = $1 THEN (SELECT nombre FROM usuarios WHERE id = r.guia_id)
                ELSE (SELECT nombre FROM usuarios WHERE id = r.turista_id)
            END as otro_nombre,
            CASE 
                WHEN r.turista_id = $1 THEN r.guia_id
                ELSE r.turista_id
            END as otro_id,
            m.mensaje as ultimo_mensaje,
            m.created_at as ultimo_mensaje_fecha,
            (SELECT COUNT(*) FROM mensajes WHERE reserva_id = r.id AND receptor_id = $1 AND leido = false) as no_leidos
         FROM reservas_guia r
         LEFT JOIN lugares l ON r.lugar_id = l.id
         LEFT JOIN mensajes m ON m.reserva_id = r.id
         WHERE r.turista_id = $1 OR r.guia_id = $1
         ORDER BY r.id, m.created_at DESC`,
        [usuarioId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  }
};

module.exports = mensajesController;