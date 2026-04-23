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
    ('admin@concepcion.cl', 'Administrador Municipal', 'admin', true),
    ('guia1@concepcion.cl', 'Juan Pérez', 'guia', true),
    ('guia2@concepcion.cl', 'María González', 'guia', true);

INSERT INTO lugares (nombre, descripcion, tipo, latitud, longitud, direccion) VALUES
    ('Plaza de la Independencia', 'Corazón de Concepción, lugar histórico', 'historico', -36.8269, -73.0502, 'Plaza de Armas'),
    ('Catedral de Concepción', 'Imponente catedral metropolitana', 'cultural', -36.8265, -73.0505, 'Calle Barros Arana'),
    ('Parque Ecuador', 'Pulmón verde de la ciudad', 'natural', -36.8247, -73.0528, 'Av. Simón Bolívar'),
    ('Mercado Central', 'Gastronomía típica penquista', 'gastronomico', -36.8273, -73.0489, 'Calle Caupolicán');

COMMIT;