-- 13_sincronizar_esquema.sql
-- Sincroniza el esquema con lo que el backend realmente usa.
-- Varias tablas/columnas se crearon a mano en producción y nunca quedaron en
-- los scripts (chat, favoritos, horas de guías, ubicación de guías, escaneos
-- por lugar, eventos temporales). A la vez, el código de notificaciones push
-- usa columnas que producción no tenía.
--
-- Es idempotente (solo IF NOT EXISTS / DROP NOT NULL): se puede correr tanto
-- en una base local como en producción sin perder datos.

-- ---------------------------------------------------------------
-- Tablas faltantes
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, lugar_id)
);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_lugar ON favoritos(lugar_id);

CREATE TABLE IF NOT EXISTS lugar_especial (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    latitud NUMERIC(10,8) NOT NULL,
    longitud NUMERIC(11,8) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reservas_guia(id) ON DELETE CASCADE,
    emisor_id INTEGER NOT NULL REFERENCES usuarios(id),
    receptor_id INTEGER NOT NULL REFERENCES usuarios(id),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mensajes_reserva ON mensajes(reserva_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_emisor ON mensajes(emisor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_receptor ON mensajes(receptor_id);

CREATE TABLE IF NOT EXISTS sesiones_guias (
    id SERIAL PRIMARY KEY,
    guia_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIMESTAMP,
    hora_fin TIMESTAMP,
    duracion_minutos INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    socket_id VARCHAR(100),
    ubicacion_inicio_lat NUMERIC(10,8),
    ubicacion_inicio_lng NUMERIC(11,8),
    ultima_actividad TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sesiones_guias_guia ON sesiones_guias(guia_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_guias_fecha ON sesiones_guias(fecha);

-- ---------------------------------------------------------------
-- Columnas faltantes en tablas existentes
-- ---------------------------------------------------------------
ALTER TABLE guias_conectados
    ADD COLUMN IF NOT EXISTS conectado BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS latitud NUMERIC(10,8),
    ADD COLUMN IF NOT EXISTS longitud NUMERIC(11,8),
    ADD COLUMN IF NOT EXISTS hora_conexion TIMESTAMP,
    ADD COLUMN IF NOT EXISTS hora_desconexion TIMESTAMP,
    ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE escaneos_qr
    ADD COLUMN IF NOT EXISTS lugar_id INTEGER,
    ADD COLUMN IF NOT EXISTS fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE eventos_diarios
    ADD COLUMN IF NOT EXISTS es_temporal BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
    ADD COLUMN IF NOT EXISTS fecha_fin DATE;

ALTER TABLE bancos_preguntas
    ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS ubicacion_id INTEGER,
    ADD COLUMN IF NOT EXISTS pistas JSONB,
    ADD COLUMN IF NOT EXISTS duracion INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS es_temporal BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
    ADD COLUMN IF NOT EXISTS fecha_fin DATE,
    ADD COLUMN IF NOT EXISTS evento_temporal_tipo VARCHAR(50),
    ADD COLUMN IF NOT EXISTS requiere_visitas INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS lugares_requeridos JSONB;

-- ---------------------------------------------------------------
-- Notificaciones push: columnas que usa models/PushSubscription.js
-- (producción tenía una versión distinta de estas tablas)
-- ---------------------------------------------------------------
ALTER TABLE push_subscriptions
    ADD COLUMN IF NOT EXISTS rol VARCHAR(20),
    ADD COLUMN IF NOT EXISTS suscrito BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE push_notifications_log
    ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS titulo TEXT,
    ADD COLUMN IF NOT EXISTS cuerpo TEXT,
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(50),
    ADD COLUMN IF NOT EXISTS relacionado_id INTEGER,
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'enviada',
    ADD COLUMN IF NOT EXISTS razon_fallo TEXT,
    ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- En producción existían title/body NOT NULL que el código nunca llena.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'push_notifications_log' AND column_name = 'title') THEN
        ALTER TABLE push_notifications_log ALTER COLUMN title DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'push_notifications_log' AND column_name = 'body') THEN
        ALTER TABLE push_notifications_log ALTER COLUMN body DROP NOT NULL;
    END IF;
END $$;
