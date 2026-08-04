-- Horario de atención estructurado por día (JSONB: cada día con
-- abierto/cerrado + hora de apertura/cierre). Se guarda como un solo
-- objeto en vez de una tabla aparte porque es un dato pequeño y fijo
-- (7 días), no algo que se consulte o filtre por separado.
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS horario_atencion JSONB;

-- Menú de productos: hasta 12 por comercio (se valida en el backend, no
-- aquí), cada uno con su propia foto.
CREATE TABLE IF NOT EXISTS comercio_productos (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(10, 2),
    imagen_url VARCHAR(500),
    cloudinary_public_id VARCHAR(255),
    orden INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comercio_productos_comercio_id ON comercio_productos(comercio_id);
