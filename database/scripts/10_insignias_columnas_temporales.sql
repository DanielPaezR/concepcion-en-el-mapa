-- La tabla insignias se creó originalmente sin estas columnas; el script
-- 04_insignias.sql usa CREATE TABLE IF NOT EXISTS, así que nunca las agregó
-- de verdad si la tabla ya existía de antes. ADD COLUMN IF NOT EXISTS es
-- seguro de correr sin importar el estado previo.
ALTER TABLE insignias ADD COLUMN IF NOT EXISTS evento_id INTEGER;
ALTER TABLE insignias ADD COLUMN IF NOT EXISTS es_temporal BOOLEAN DEFAULT false;
ALTER TABLE insignias ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
ALTER TABLE insignias ADD COLUMN IF NOT EXISTS fecha_fin DATE;
