const PushSubscription = require('../models/PushSubscription');
const pushNotificationService = require('../services/pushNotificationService');

const pushNotificationController = {
    getPublicKey(req, res) {
        try {
            const publicKey = pushNotificationService.getPublicKey();
            if (!publicKey) {
                return res.status(500).json({
                    error: 'VAPID key no configurada',
                    details: 'Agrega VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en tu archivo .env'
                });
            }
            return res.json({ publicKey });
        } catch (error) {
            console.error('❌ Error getPublicKey:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    async subscribe(req, res) {
        try {
            const { subscription } = req.body;
            const usuarioId = req.user?.id;
            const rol = req.user?.rol || 'turista';

            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
                return res.status(400).json({
                    error: 'Suscripción inválida',
                    details: 'Necesitas enviar endpoint y keys (p256dh y auth)'
                });
            }

            const result = await PushSubscription.subscribe(usuarioId, rol, subscription);
            return res.json({ success: true, subscription: result });
        } catch (error) {
            console.error('❌ Error subscribe:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    async unsubscribe(req, res) {
        try {
            const { endpoint } = req.body;
            if (!endpoint) {
                return res.status(400).json({ error: 'Endpoint requerido' });
            }

            const result = await PushSubscription.unsubscribe(endpoint);
            return res.json({ success: true, subscription: result });
        } catch (error) {
            console.error('❌ Error unsubscribe:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    async getMySuscriptions(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const suscripciones = await PushSubscription.getByUsuarioId(usuarioId);
            return res.json({ success: true, suscripciones });
        } catch (error) {
            console.error('❌ Error getMySuscriptions:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    async getNotificationHistory(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const limit = parseInt(req.query.limit, 10) || 50;
            const historial = await PushSubscription.getNotificationHistory(usuarioId, limit);
            return res.json({ success: true, historial });
        } catch (error) {
            console.error('❌ Error getNotificationHistory:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    async sendTest(req, res) {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const notificationData = {
                title: 'Notificación de prueba',
                body: 'Las notificaciones push están funcionando correctamente.',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'test-notification',
                data: { url: '/' },
                tipo: 'test'
            };

            const result = await pushNotificationService.sendToUser(usuarioId, notificationData);
            return res.json({ success: true, result });
        } catch (error) {
            console.error('❌ Error sendTest:', error);
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = pushNotificationController;
