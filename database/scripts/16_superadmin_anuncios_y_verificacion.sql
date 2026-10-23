-- 16_superadmin_anuncios_y_verificacion.sql
-- * Rol "superadmin" (solo el dueño del proyecto): da y quita permisos a
--   admins y guías, modera anuncios y ve métricas técnicas.
-- * Permisos por usuario (usuarios.permisos, JSON). NULL = valores por
--   defecto (admin: todo; guía: según puede_gestionar_eventos).
-- * Inicio de sesión con Google y verificación de correo por código.
-- * Tablero de anuncios con moderación.
-- * Registro de visitas a la app del turista.
-- Idempotente.

-- Rol superadmin
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('turista', 'guia', 'admin', 'comercio', 'superadmin'));

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS permisos JSONB,
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id) WHERE google_id IS NOT NULL;

-- Registros pendientes de verificar: el usuario solo se crea al confirmar el código
CREATE TABLE IF NOT EXISTS registros_pendientes (
    email VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    codigo_hash VARCHAR(255) NOT NULL,
    intentos INTEGER DEFAULT 0,
    expira TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anuncios (servicios, ventas, compras) moderados por el superadmin
CREATE TABLE IF NOT EXISTS anuncios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('servicio', 'venta', 'compra')),
    titulo VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    precio NUMERIC(12,0),
    imagen_url VARCHAR(500),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'completado')),
    motivo_rechazo TEXT,
    revisado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_revision TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_anuncios_estado ON anuncios(estado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anuncios_usuario ON anuncios(usuario_id);

-- Visitas a la app del turista (para las métricas del superadmin)
CREATE TABLE IF NOT EXISTS visitas_app (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    ruta VARCHAR(200),
    dispositivo VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_visitas_app_fecha ON visitas_app(created_at);
