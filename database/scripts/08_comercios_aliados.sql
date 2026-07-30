-- Módulo de comercios aliados: perfil de negocio, códigos de descuento,
-- cola de recuerdos para imprimir (fase 2), y reseñas de turistas.

-- 0. Limpieza de un prototipo previo de este mismo módulo, con diseño
--    distinto y abandonado (encontrado al conectarse a la base real antes
--    de correr este script; ambas tablas estaban vacías, 0 filas):
--    - comercios_partners: sin usuario_id (no hay cuenta de login para el
--      comercio, base del diseño actual), sin categoria, con
--      descuento_ofertado INTEGER en vez de beneficio TEXT.
--    - codigos_descuento (versión vieja): codigo VARCHAR(50), sin
--      lugar_id, con fecha_expiracion, y su FK comercio_id apuntaba a
--      comercios_partners en vez de a la tabla comercios de este script.
--    Se eliminan para dejar espacio al esquema nuevo; CASCADE se lleva
--    también cualquier índice/constraint dependiente (no había datos).
DROP TABLE IF EXISTS codigos_descuento CASCADE;
DROP TABLE IF EXISTS comercios_partners CASCADE;

-- 1. Nuevo rol 'comercio', reutilizando el mismo sistema de login/JWT que
--    ya usan admin y guía.
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('turista', 'guia', 'admin', 'comercio'));

-- 2. Perfil del comercio — 1 a 1 con la cuenta de usuario que crea el admin.
CREATE TABLE IF NOT EXISTS comercios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL
        CHECK (categoria IN ('tienda', 'restaurante', 'cafe', 'artesanias', 'hospedaje', 'otro')),
    descripcion TEXT,
    beneficio TEXT NOT NULL,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    direccion VARCHAR(500),
    imagen_portada_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fotos del comercio (varias por negocio, mismo patrón de galeria_fotos:
--    una fila por foto, en vez de un array).
CREATE TABLE IF NOT EXISTS comercio_fotos (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    imagen_url VARCHAR(500) NOT NULL,
    orden INTEGER DEFAULT 0,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Códigos de descuento — se generan al descubrir un lugar, se canjean
--    una sola vez en cualquier comercio activo.
CREATE TABLE IF NOT EXISTS codigos_descuento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE SET NULL,
    comercio_id INTEGER REFERENCES comercios(id) ON DELETE SET NULL,
    usado BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP
);

-- 5. Cola de recuerdos (fotos con marco) pendientes de imprimir cuando
--    llegue la impresora. comercio_id queda NULL hasta que se asigne a un
--    punto de impresión.
CREATE TABLE IF NOT EXISTS archivos_recuerdo (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE SET NULL,
    comercio_id INTEGER REFERENCES comercios(id) ON DELETE SET NULL,
    imagen_url VARCHAR(500) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'impreso')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_impreso TIMESTAMP
);

-- 6. Reseñas — exige un código de descuento propio, de ese comercio, ya
--    usado (la validación de "usado=true" se hace en el controller, porque
--    depende de leer el estado actual del código; el UNIQUE de aquí solo
--    evita reseñas duplicadas con el mismo código).
CREATE TABLE IF NOT EXISTS resenas_comercio (
    id SERIAL PRIMARY KEY,
    comercio_id INTEGER NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_descuento_id INTEGER NOT NULL REFERENCES codigos_descuento(id),
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, comercio_id, codigo_descuento_id)
);

-- Índices para las consultas más frecuentes de este módulo
CREATE INDEX IF NOT EXISTS idx_comercios_usuario_id ON comercios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comercios_activo ON comercios(activo);
CREATE INDEX IF NOT EXISTS idx_comercio_fotos_comercio_id ON comercio_fotos(comercio_id);
CREATE INDEX IF NOT EXISTS idx_codigos_descuento_usuario_id ON codigos_descuento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_codigos_descuento_comercio_id ON codigos_descuento(comercio_id);
CREATE INDEX IF NOT EXISTS idx_codigos_descuento_usado ON codigos_descuento(usado);
CREATE INDEX IF NOT EXISTS idx_archivos_recuerdo_estado ON archivos_recuerdo(estado);
CREATE INDEX IF NOT EXISTS idx_archivos_recuerdo_comercio_id ON archivos_recuerdo(comercio_id);
CREATE INDEX IF NOT EXISTS idx_resenas_comercio_comercio_id ON resenas_comercio(comercio_id);
