// models/PushSubscription.js
const pool = require('../config/database');

const PushSubscription = {
    // Crear o actualizar suscripción
    async subscribe(usuarioId, rol, subscription) {
        const { endpoint, keys } = subscription;
        
        const query = `
            INSERT INTO push_subscriptions (usuario_id, rol, endpoint, p256dh, auth, suscrito)
            VALUES ($1, $2, $3, $4, $5, true)
            ON CONFLICT (endpoint) DO UPDATE
            SET usuario_id = $1, rol = $2, p256dh = $4, auth = $5, suscrito = true, fecha_actualizacion = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        const values = [usuarioId, rol, endpoint, keys.p256dh, keys.auth];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Desuscribirse
    async unsubscribe(endpoint) {
        const query = `
            UPDATE push_subscriptions 
            SET suscrito = false, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE endpoint = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [endpoint]);
        return result.rows[0];
    },

    // Eliminar suscripción por endpoint
    async removeByEndpoint(endpoint) {
        const query = `DELETE FROM push_subscriptions WHERE endpoint = $1`;
        await pool.query(query, [endpoint]);
    },

    // Obtener todas las suscripciones activas de un usuario
    async getByUsuarioId(usuarioId) {
        const query = `
            SELECT * FROM push_subscriptions 
            WHERE usuario_id = $1 AND suscrito = true
            ORDER BY fecha_suscripcion DESC
        `;
        
        const result = await pool.query(query, [usuarioId]);
        return result.rows;
    },

    // Obtener todas las suscripciones activas de un rol
    async getByRol(rol) {
        const query = `
            SELECT ps.*, u.email
            FROM push_subscriptions ps
            JOIN usuarios u ON ps.usuario_id = u.id
            WHERE ps.rol = $1 AND ps.suscrito = true
            ORDER BY ps.fecha_suscripcion DESC
        `;
        
        const result = await pool.query(query, [rol]);
        return result.rows;
    },

    // Obtener todas las suscripciones activas
    async getAll() {
        const query = `
            SELECT ps.*, u.email
            FROM push_subscriptions ps
            JOIN usuarios u ON ps.usuario_id = u.id
            WHERE ps.suscrito = true
            ORDER BY ps.fecha_suscripcion DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    },

    // Registrar notificación enviada
    async logNotification(usuarioId, titulo, cuerpo, tipo, relacionadoId = null, estado = 'enviada', razonFallo = null) {
        const query = `
            INSERT INTO push_notifications_log (usuario_id, titulo, cuerpo, tipo, relacionado_id, estado, razon_fallo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [usuarioId, titulo, cuerpo, tipo, relacionadoId, estado, razonFallo];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Obtener historial de notificaciones
    async getNotificationHistory(usuarioId, limit = 50) {
        const query = `
            SELECT * FROM push_notifications_log
            WHERE usuario_id = $1
            ORDER BY fecha_envio DESC
            LIMIT $2
        `;
        
        const result = await pool.query(query, [usuarioId, limit]);
        return result.rows;
    }
};

module.exports = PushSubscription;
