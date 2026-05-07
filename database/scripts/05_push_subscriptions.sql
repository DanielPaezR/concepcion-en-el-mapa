-- Script para crear tabla de suscripciones de notificaciones push
-- Ejecutar con: psql -U usuario -d concepcion -f 05_push_subscriptions.sql

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'turista' o 'guia'
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    suscrito BOOLEAN DEFAULT true,
    fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_push_subscriptions_usuario_id ON push_subscriptions(usuario_id);
CREATE INDEX idx_push_subscriptions_rol ON push_subscriptions(rol);
CREATE INDEX idx_push_subscriptions_suscrito ON push_subscriptions(suscrito);

-- Tabla de auditoría para notificaciones enviadas
CREATE TABLE IF NOT EXISTS push_notifications_log (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    tipo VARCHAR(50), -- 'reserva_creada', 'reserva_confirmada', 'reserva_completada', etc.
    relacionado_id INTEGER, -- ID de la reserva u otra entidad relacionada
    estado VARCHAR(20) DEFAULT 'enviada', -- 'enviada', 'fallida', 'rechazada'
    razon_fallo TEXT,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_push_notifications_log_usuario_id ON push_notifications_log(usuario_id);
CREATE INDEX idx_push_notifications_log_tipo ON push_notifications_log(tipo);
CREATE INDEX idx_push_notifications_log_fecha_envio ON push_notifications_log(fecha_envio);
