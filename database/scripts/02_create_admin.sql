-- Crear usuario admin (contraseña: admin123)
INSERT INTO usuarios (email, nombre, rol, password_hash, disponible)
VALUES (
  'admin@concepcion.cl',
  'Administrador',
  'admin',
  '$2a$10$XFEoRQVvqJpCwj5kZzXZxO9Q7kL8mN3YpQwRrTtUuVvWwXxYyZzAaBb', -- admin123
  true
) ON CONFLICT (email) DO NOTHING;

-- Crear guía de prueba
INSERT INTO usuarios (email, nombre, rol, password_hash, disponible, calificacion_promedio)
VALUES (
  'guia1@concepcion.cl',
  'Juan Pérez',
  'guia',
  '$2a$10$XFEoRQVvqJpCwj5kZzXZxO9Q7kL8mN3YpQwRrTtUuVvWwXxYyZzAaBb', -- admin123
  true,
  4.5
) ON CONFLICT (email) DO NOTHING;