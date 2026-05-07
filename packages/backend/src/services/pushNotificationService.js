const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
require('dotenv').config();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('⚠️ VAPID keys no configuradas. Genera VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en .env');
} else {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:example@example.com',
        vapidPublicKey,
        vapidPrivateKey
    );
}

const pushNotificationService = {
    async sendToUser(usuarioId, notificationData) {
        const suscripciones = await PushSubscription.getByUsuarioId(usuarioId);

        if (!suscripciones.length) {
            return { enviadas: 0, fallidas: 0, total: 0 };
        }

        let enviadas = 0;
        let fallidas = 0;

        for (const suscripcion of suscripciones) {
            const pushSubscription = {
                endpoint: suscripcion.endpoint,
                keys: {
                    p256dh: suscripcion.p256dh,
                    auth: suscripcion.auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(notificationData));
                enviadas++;
                await PushSubscription.logNotification(
                    usuarioId,
                    notificationData.title,
                    notificationData.body,
                    notificationData.tipo || 'general',
                    notificationData.relacionadoId || null,
                    'enviada'
                );
            } catch (error) {
                fallidas++;
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.removeByEndpoint(suscripcion.endpoint);
                }
                await PushSubscription.logNotification(
                    usuarioId,
                    notificationData.title,
                    notificationData.body,
                    notificationData.tipo || 'general',
                    notificationData.relacionadoId || null,
                    'fallida',
                    error.message
                );
            }
        }

        return { enviadas, fallidas, total: suscripciones.length };
    },

    async sendToRole(rol, notificationData) {
        const suscripciones = await PushSubscription.getByRol(rol);

        if (!suscripciones.length) {
            return { enviadas: 0, fallidas: 0, total: 0 };
        }

        let enviadas = 0;
        let fallidas = 0;

        for (const suscripcion of suscripciones) {
            const pushSubscription = {
                endpoint: suscripcion.endpoint,
                keys: {
                    p256dh: suscripcion.p256dh,
                    auth: suscripcion.auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(notificationData));
                enviadas++;
                await PushSubscription.logNotification(
                    suscripcion.usuario_id,
                    notificationData.title,
                    notificationData.body,
                    notificationData.tipo || 'general',
                    notificationData.relacionadoId || null,
                    'enviada'
                );
            } catch (error) {
                fallidas++;
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.removeByEndpoint(suscripcion.endpoint);
                }
                await PushSubscription.logNotification(
                    suscripcion.usuario_id,
                    notificationData.title,
                    notificationData.body,
                    notificationData.tipo || 'general',
                    notificationData.relacionadoId || null,
                    'fallida',
                    error.message
                );
            }
        }

        return { enviadas, fallidas, total: suscripciones.length };
    },

    async sendToAll(notificationData) {
        const suscripciones = await PushSubscription.getAll();

        if (!suscripciones.length) {
            return { enviadas: 0, fallidas: 0, total: 0 };
        }

        let enviadas = 0;
        let fallidas = 0;

        for (const suscripcion of suscripciones) {
            const pushSubscription = {
                endpoint: suscripcion.endpoint,
                keys: {
                    p256dh: suscripcion.p256dh,
                    auth: suscripcion.auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(notificationData));
                enviadas++;
                await PushSubscription.logNotification(
                    suscripcion.usuario_id,
                    notificationData.title,
                    notificationData.body,
                    notificationData.tipo || 'general',
                    notificationData.relacionadoId || null,
                    'enviada'
                );
            } catch (error) {
                fallidas++;
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.removeByEndpoint(suscripcion.endpoint);
                }
                await PushSubscription.logNotification(
                    suscripcion.usuario_id,
                    notificationData.title,
                    notificationData.body,
                    notificationData.tipo || 'general',
                    notificationData.relacionadoId || null,
                    'fallida',
                    error.message
                );
            }
        }

        return { enviadas, fallidas, total: suscripciones.length };
    },

    getPublicKey() {
        return vapidPublicKey;
    }
};

module.exports = pushNotificationService;
