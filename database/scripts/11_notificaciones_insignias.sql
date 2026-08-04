-- Por si notificaciones_insignias nunca se creó correctamente en algún
-- ambiente (el script 04_insignias.sql ya la define, pero puede haberse
-- saltado en algún momento). Este script es idempotente.
CREATE TABLE IF NOT EXISTS notificaciones_insignias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    insignia_id INTEGER REFERENCES insignias(id) ON DELETE CASCADE,
    mensaje TEXT,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_insignias_usuario_leida ON notificaciones_insignias(usuario_id, leida);
