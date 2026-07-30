-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE concepcion_mapa;

\c concepcion_mapa;

-- Tabla PRINCIPAL: Lugares / Puntos de Interés (POIs)
CREATE TABLE IF NOT EXISTS lugares (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('historico', 'natural', 'cultural', 'gastronomico', 'evento')),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion VARCHAR(500),
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    lugar_id INTEGER REFERENCES lugares(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    precio DECIMAL(10, 2),
    max_participantes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Usuarios (Turistas, Guías, Administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL DEFAULT 'turista' CHECK (rol IN ('turista', 'guia', 'admin')),
    password_hash VARCHAR(255),
    estudiante_id INTEGER,
    disponible BOOLEAN DEFAULT true,
    calificacion_promedio DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Solicitudes/Reservas de Guía
CREATE TABLE IF NOT EXISTS reservas_guia (
    id SERIAL PRIMARY KEY,
    turista_id INTEGER REFERENCES usuarios(id),
    guia_id INTEGER REFERENCES usuarios(id),
    lugar_id INTEGER REFERENCES lugares(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_encuentro TIMESTAMP NOT NULL,
    numero_personas INTEGER NOT NULL CHECK (numero_personas > 0),
    intereses TEXT,
    punto_encuentro VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Encuestas de Satisfacción
CREATE TABLE IF NOT EXISTS encuestas (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER REFERENCES reservas_guia(id),
    calificacion_guia INTEGER CHECK (calificacion_guia >= 1 AND calificacion_guia <= 5),
    calificacion_experiencia INTEGER CHECK (calificacion_experiencia >= 1 AND calificacion_experiencia <= 5),
    comentarios TEXT,
    sugerencias TEXT,
    origen_turista VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_reserva_encuesta UNIQUE (reserva_id)
);

-- Tabla: Escaneos QR / Registro de Visitas
CREATE TABLE IF NOT EXISTS escaneos_qr (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Estadísticas de Acceso (Para el Dashboard)
CREATE TABLE IF NOT EXISTS metricas_acceso (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('qr_escaneado', 'vista_lugar', 'click_guia')),
    lugar_id INTEGER REFERENCES lugares(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_lugares_tipo ON lugares(tipo);
CREATE INDEX idx_lugares_activo ON lugares(activo);
CREATE INDEX idx_lugares_coordenadas ON lugares(latitud, longitud);
CREATE INDEX idx_reservas_fecha ON reservas_guia(fecha_encuentro);
CREATE INDEX idx_reservas_estado ON reservas_guia(estado);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lugares
    BEFORE UPDATE ON lugares
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- Insertar datos de ejemplo (seed data)
INSERT INTO usuarios (email, nombre, rol, disponible) VALUES
    ('admin@concepcionenelmapa.co', 'Administrador Municipal', 'admin', true),
    ('guia1@concepcionenelmapa.co', 'Guía Local 1', 'guia', true),
    ('guia2@concepcionenelmapa.co', 'Guía Local 2', 'guia', true);

-- NOTA: nombres, descripciones y coordenadas exactas de "lugares" son
-- PLACEHOLDERS de ejemplo para levantar una base de datos de desarrollo
-- vacía. Deben reemplazarse por los lugares reales y curados de Concepción,
-- Antioquia (los que ya existen o se cargan vía el panel admin en
-- producción) antes de usarse como semilla real.
INSERT INTO lugares (nombre, descripcion, tipo, latitud, longitud, direccion) VALUES
    ('Parque Principal de Concepción', 'Corazón del municipio, punto de encuentro histórico', 'historico', 6.3953494, -75.2592802, 'Parque Principal'),
    ('Casa de la Cultura', 'Lugar de nacimiento del General José María Córdova', 'historico', 6.3956000, -75.2590000, 'Centro histórico'),
    ('Mirador de Concepción', 'Vista panorámica del municipio y sus alrededores', 'natural', 6.3960000, -75.2585000, 'Zona alta del pueblo'),
    ('Plaza Gastronómica', 'Comida típica antioqueña', 'gastronomico', 6.3950000, -75.2595000, 'Centro del pueblo');

COMMIT;