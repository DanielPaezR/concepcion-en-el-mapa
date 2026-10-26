-- 18_dinamicas_retos_y_eventos.sql
-- Dinámicas nuevas del juego:
--   1. Retos de opción múltiple y "¿Verdad o mito?" (tipo = 'opcion'): las
--      opciones se guardan en bancos_preguntas.opciones y la respuesta
--      correcta en "respuesta" (el texto de una de las opciones). Tienen un
--      solo intento: un fallo queda en progreso_eventos con completado = false.
--   2. "¡Voy!" en los eventos del pueblo: quién piensa asistir (uno por
--      persona), para mostrar cuántos van.
-- Se puede correr más de una vez sin problema.

ALTER TABLE bancos_preguntas ADD COLUMN IF NOT EXISTS opciones JSONB;

CREATE TABLE IF NOT EXISTS asistencias_evento_comunidad (
    evento_id INTEGER NOT NULL REFERENCES eventos_comunidad(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (evento_id, usuario_id)
);

-- Para contar rápido los retos de la semana (meta del pueblo)
CREATE INDEX IF NOT EXISTS idx_progreso_eventos_fecha
    ON progreso_eventos (fecha_completado) WHERE completado = true;
