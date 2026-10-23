-- 14_eventos_comunidad_y_curiosidades.sql
-- Nuevos tipos de marcador en el mapa del turista:
--   * eventos_comunidad: eventos del pueblo (ferias, conciertos, mercados...).
--     Los crean el admin, los guías con puede_gestionar_eventos (en cualquier
--     punto) y los comercios (solo en la ubicación de su negocio).
--     No confundir con bancos_preguntas/eventos_diarios, que son los retos.
--   * curiosidades: datos curiosos con foto que aparecen solo al pasar cerca.
--     No forman parte del recorrido ni dan XP. Las gestiona el admin.
-- Idempotente: se puede correr varias veces.

CREATE TABLE IF NOT EXISTS eventos_comunidad (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    latitud NUMERIC(10,8) NOT NULL,
    longitud NUMERIC(11,8) NOT NULL,
    lugar_texto VARCHAR(255),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    creado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    comercio_id INTEGER REFERENCES comercios(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_eventos_comunidad_fechas ON eventos_comunidad(activo, fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_eventos_comunidad_creador ON eventos_comunidad(creado_por);

CREATE TABLE IF NOT EXISTS curiosidades (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen_url VARCHAR(500),
    latitud NUMERIC(10,8) NOT NULL,
    longitud NUMERIC(11,8) NOT NULL,
    activo BOOLEAN DEFAULT true,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_curiosidades_activo ON curiosidades(activo);

-- La galería guarda lugar_especial_id del lugar activo de la tabla
-- lugar_especial (models/LugarEspecial.js), pero la llave foránea apuntaba a la
-- tabla vieja lugares_especiales: subir fotos fallaba cuando los ids no
-- coincidían. Se redirige a lugar_especial. NOT VALID para no revalidar fotos
-- antiguas que apuntan a ids de la tabla vieja.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON t.oid = c.confrelid
               WHERE c.conname = 'galeria_fotos_lugar_especial_id_fkey' AND t.relname = 'lugares_especiales') THEN
        ALTER TABLE galeria_fotos DROP CONSTRAINT galeria_fotos_lugar_especial_id_fkey;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'galeria_fotos_lugar_especial_id_fkey') THEN
        ALTER TABLE galeria_fotos
            ADD CONSTRAINT galeria_fotos_lugar_especial_id_fkey
            FOREIGN KEY (lugar_especial_id) REFERENCES lugar_especial(id) ON DELETE CASCADE NOT VALID;
    END IF;
END $$;
