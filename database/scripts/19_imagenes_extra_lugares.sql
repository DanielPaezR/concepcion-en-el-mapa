-- 19_imagenes_extra_lugares.sql
-- Hasta 5 fotos por lugar: la portada sigue en lugares.imagen_url y las
-- otras (máximo 4) en imagenes_extra, una lista de URLs de Cloudinary.
-- La app del turista ya mostraba la galería con esta columna, pero no existía.
-- Se puede correr más de una vez sin problema.

ALTER TABLE lugares ADD COLUMN IF NOT EXISTS imagenes_extra JSONB NOT NULL DEFAULT '[]'::jsonb;
