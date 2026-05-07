-- Sistema de insignias y notificaciones

DO $$
BEGIN
    IF to_regclass('public.usuarios_insignias') IS NULL
       AND to_regclass('public.usuario_insignias') IS NOT NULL THEN
        ALTER TABLE usuario_insignias RENAME TO usuarios_insignias;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS insignias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    tipo VARCHAR(50) DEFAULT 'exploracion',
    lugares_requeridos INTEGER,
    nivel_requerido INTEGER,
    evento_id INTEGER,
    es_temporal BOOLEAN DEFAULT false,
    fecha_inicio DATE,
    fecha_fin DATE
);

CREATE TABLE IF NOT EXISTS usuarios_insignias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    insignia_id INTEGER REFERENCES insignias(id) ON DELETE CASCADE,
    fecha_obtenida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, insignia_id)
);

CREATE TABLE IF NOT EXISTS notificaciones_insignias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    insignia_id INTEGER REFERENCES insignias(id) ON DELETE CASCADE,
    mensaje TEXT,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_insignias_usuario ON usuarios_insignias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_insignias_usuario_leida ON notificaciones_insignias(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_insignias_tipo ON insignias(tipo);
