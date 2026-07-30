-- Add flags for public avatar and event management to usuarios
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS mostrar_avatar_publico BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS puede_gestionar_eventos BOOLEAN DEFAULT false;

-- Ensure existing seed guides get defaults
UPDATE usuarios SET mostrar_avatar_publico = false WHERE mostrar_avatar_publico IS NULL;
UPDATE usuarios SET puede_gestionar_eventos = false WHERE puede_gestionar_eventos IS NULL;

COMMIT;
