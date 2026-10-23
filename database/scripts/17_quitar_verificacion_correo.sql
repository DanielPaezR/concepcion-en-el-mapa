-- 17_quitar_verificacion_correo.sql
-- Se descartó la verificación de correo por código (el registro vuelve a ser
-- directo). La tabla de registros pendientes ya no se usa. Idempotente.
DROP TABLE IF EXISTS registros_pendientes;
