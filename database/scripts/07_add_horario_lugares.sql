-- Add horario (hours of operation) to lugares
ALTER TABLE lugares
    ADD COLUMN IF NOT EXISTS horario VARCHAR(255) DEFAULT '9:00 AM - 5:00 PM';

COMMIT;
