UPDATE usuarios SET password_hash = '$2a$10$XFEoRQVvqJpCwj5kZzXZxO9Q7kL8mN3YpQwRrTtUuVvWwXxYyZzAaBb' WHERE email = 'admin@concepcion.cl';
UPDATE usuarios SET password_hash = '$2a$10$XFEoRQVvqJpCwj5kZzXZxO9Q7kL8mN3YpQwRrTtUuVvWwXxYyZzAaBb' WHERE email = 'guia1@concepcion.cl';
UPDATE usuarios SET password_hash = '$2a$10$XFEoRQVvqJpCwj5kZzXZxO9Q7kL8mN3YpQwRrTtUuVvWwXxYyZzAaBb' WHERE email = 'guia2@concepcion.cl';

-- Verificar
SELECT id, email, 
       length(password_hash) as hash_length,
       password_hash
FROM usuarios;