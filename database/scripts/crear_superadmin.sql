-- crear_superadmin.sql
-- Crea tu cuenta de superadmin (o convierte en superadmin una cuenta que ya
-- exista con ese correo). Ejecútalo una sola vez en la base de datos de
-- producción, por ejemplo desde Railway → servicio Postgres → pestaña "Data"
-- → "Query", o con psql.
--
-- ANTES DE EJECUTAR: cambia las 3 líneas marcadas con <-- por tus datos.
-- La contraseña se guarda cifrada (bcrypt), nunca en texto plano.
-- Después ingresa por el panel de administración con ese correo y contraseña.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (email, nombre, password_hash, rol, anonimo, email_verificado)
VALUES (
    'tu-correo@gmail.com',                         -- <-- tu correo
    'Tu Nombre',                                   -- <-- tu nombre
    crypt('CambiaEstaContraseña', gen_salt('bf', 10)), -- <-- tu contraseña
    'superadmin', false, true
)
ON CONFLICT (email) DO UPDATE SET
    rol = 'superadmin',
    password_hash = EXCLUDED.password_hash,
    anonimo = false,
    email_verificado = true;

-- Comprobación: debe mostrar tu correo con rol superadmin
SELECT id, email, nombre, rol FROM usuarios WHERE rol = 'superadmin';
