-- 15_contenido_curiosidades_y_retos.sql
-- Contenido inicial sobre Concepción (Antioquia): curiosidades del pueblo y un
-- banco de retos para que el generador diario tenga preguntas.
--
-- Fuentes consultadas (oct. 2026): Turismo Antioquia, Oriente Antioqueño,
-- El Colombiano, Semana, Infobae, Radio Nacional, Las2orillas y la reseña
-- histórica municipal. Lo que viene de la tradición oral del pueblo (el dedo
-- de bronce, los burros) se presenta como "cuentan en el pueblo".
--
-- Las coordenadas son aproximadas alrededor del parque principal; se pueden
-- ajustar desde el panel admin. Idempotente: no duplica si se corre de nuevo.

-- ---------------------------------------------------------------
-- Curiosidades
-- ---------------------------------------------------------------
INSERT INTO curiosidades (titulo, descripcion, latitud, longitud, activo)
SELECT v.titulo, v.descripcion, v.latitud, v.longitud, v.activo
FROM (VALUES
  ('La estatua que vino de París',
   'La estatua del general José María Córdova que preside el parque fue elaborada en París y fue un regalo de la República del Ecuador, en tiempos del presidente Eloy Alfaro. Se inauguró en 1907.' || E'\n\n' ||
   'Cuentan en el pueblo que antes de la estatua llegó un dedo de bronce, enviado para calcular el tamaño del pedestal, y que la figura llegó por partes, cargada a lomo de burro por los caminos de herradura del oriente antioqueño.',
   6.39534940, -75.25928020, true),

  ('Un pueblo sin Plaza de Bolívar',
   'Casi todos los pueblos de Colombia tienen una Plaza de Bolívar. Concepción no: aquí el pedestal es para su hijo, José María Córdova, héroe de la batalla de Ayacucho (1824).' || E'\n\n' ||
   'Muchos en el pueblo todavía creen que Bolívar tuvo que ver con la muerte de Córdova en 1829, y por eso el parque lleva el nombre del general.',
   6.39525000, -75.25915000, true),

  ('El pueblo que le puso una demanda a Dios',
   'Para restaurar la iglesia, el Ministerio de Cultura pidió demostrar quién era el dueño del templo... y en los papeles figuraban Dios y las ánimas del purgatorio.' || E'\n\n' ||
   'Hace poco más de una década, un abogado del pueblo presentó una demanda de pertenencia ante un juzgado de Rionegro. Como los "demandados" nunca se presentaron, se les nombró un curador, y la parroquia logró legalizar el templo para poder restaurarlo.',
   6.39560000, -75.25925000, true),

  ('¿Por qué se llama Concepción?',
   'El pueblo nació en el siglo XVIII como un asentamiento minero. Los mineros llegados desde Santa Fe de Antioquia bautizaron varias minas en honor a la Virgen de la Inmaculada Concepción, y de ahí tomó su nombre.' || E'\n\n' ||
   'Su fundación se cuenta desde el 8 de septiembre de 1771, y fue erigido municipio en 1773.',
   6.39555000, -75.25945000, true),

  ('¿Por qué les dicen "conchudos"?',
   'A Concepción le dicen cariñosamente "La Concha", y a su gente, "conchudos". Aquí el apodo no es un insulto: es un orgullo de pueblo. También la llaman "Tierra de los Córdovas".',
   6.39510000, -75.25935000, true),

  ('Cuna de dos generales',
   'En una casa colonial a pocas cuadras del parque nació en 1799 José María Córdova, uno de los generales más jóvenes de la Independencia y héroe de Ayacucho. Su hermano, José Salvador Córdova, también fue general de la causa patriota.' || E'\n\n' ||
   'Hoy la casa natal funciona como casa de la cultura del pueblo.',
   6.39500000, -75.25990000, true),

  ('Un pueblo que es patrimonio de la Nación',
   'Sus calles empedradas y sus casas de tapia y bahareque, con techos de teja de barro y balcones de madera, se conservan casi como en los siglos XVIII y XIX.' || E'\n\n' ||
   'Por eso Concepción fue declarado patrimonio histórico del departamento en 1989 y Bien de Interés Cultural de la Nación en 1999.',
   6.39480000, -75.25890000, true),

  -- Borradores ocultos: falta la explicación (tradición oral del pueblo).
  -- Completar la descripción desde el panel admin y marcarlas como visibles.
  ('Las casas de dos pisos del parque',
   '[POR COMPLETAR] ¿Por qué las casas de un costado del parque son de dos pisos y las del frente no? Escribe aquí la explicación que cuentan en el pueblo.',
   6.39540000, -75.25900000, false),

  ('Cuando la iglesia estaba en la cabecera del pueblo',
   '[POR COMPLETAR] Hasta hace poco la iglesia estaba en la cabecera del pueblo. Escribe aquí por qué estaba allí y qué cambió.',
   6.39565000, -75.25910000, false)
) AS v(titulo, descripcion, latitud, longitud, activo)
WHERE NOT EXISTS (SELECT 1 FROM curiosidades c WHERE c.titulo = v.titulo);

-- ---------------------------------------------------------------
-- Ubicaciones de los retos
-- ---------------------------------------------------------------
INSERT INTO bancos_ubicaciones (nombre, latitud, longitud, radio)
SELECT v.nombre, v.latitud, v.longitud, v.radio
FROM (VALUES
  ('Parque Principal José María Córdova', 6.39534940, -75.25928020, 60),
  ('Iglesia de la Inmaculada Concepción', 6.39560000, -75.25925000, 50),
  ('Casa natal de José María Córdova', 6.39500000, -75.25990000, 40),
  ('Calles empedradas del centro', 6.39480000, -75.25890000, 60)
) AS v(nombre, latitud, longitud, radio)
WHERE NOT EXISTS (SELECT 1 FROM bancos_ubicaciones u WHERE u.nombre = v.nombre);

-- ---------------------------------------------------------------
-- Banco de retos (respuestas alternativas separadas por "|";
-- la comparación ignora mayúsculas y tildes)
-- ---------------------------------------------------------------
INSERT INTO bancos_preguntas (tipo, pregunta, respuesta, dificultad, puntos, ubicacion_id)
SELECT v.tipo, v.pregunta, v.respuesta, v.dificultad, v.puntos,
       (SELECT id FROM bancos_ubicaciones u WHERE u.nombre = v.ubicacion ORDER BY id LIMIT 1)
FROM (VALUES
  ('pregunta', '¿Qué general de la Independencia nació en Concepción?',
   'José María Córdova|Córdova|José María Córdoba|Córdoba|José Córdova', 1, 50, 'Casa natal de José María Córdova'),
  ('pregunta', '¿En qué año nació José María Córdova?',
   '1799', 2, 70, 'Casa natal de José María Córdova'),
  ('pregunta', '¿Cómo se llamaba el hermano de José María Córdova que también fue general?',
   'José Salvador Córdova|José Salvador|Salvador Córdova|Salvador|José Salvador Córdoba', 3, 80, 'Casa natal de José María Córdova'),
  ('pregunta', '¿En qué batalla de 1824 se hizo famoso José María Córdova?',
   'Ayacucho|Batalla de Ayacucho|La batalla de Ayacucho', 2, 70, 'Parque Principal José María Córdova'),
  ('pregunta', '¿Qué país le regaló al pueblo la estatua de Córdova que está en el parque?',
   'Ecuador|República del Ecuador|El Ecuador', 2, 70, 'Parque Principal José María Córdova'),
  ('pregunta', '¿En qué ciudad fue elaborada la estatua de Córdova del parque?',
   'París|Paris|París Francia|Francia', 2, 70, 'Parque Principal José María Córdova'),
  ('pregunta', '¿Cómo les dicen cariñosamente a los habitantes de Concepción?',
   'Conchudos|Conchudo|Conchudas|Los conchudos', 1, 50, 'Parque Principal José María Córdova'),
  ('pregunta', 'Para poder restaurar la iglesia, el pueblo tuvo que demandar a sus "dueños". ¿A quién demandaron?',
   'Dios|A Dios|Las ánimas|Las ánimas del purgatorio|Ánimas del purgatorio|Dios y las ánimas|Dios y las ánimas del purgatorio', 2, 70, 'Iglesia de la Inmaculada Concepción'),
  ('pregunta', '¿A qué advocación de la Virgen está dedicada la iglesia del pueblo?',
   'Inmaculada Concepción|La Inmaculada Concepción|Inmaculada|Nuestra Señora de la Concepción|La Concepción|Concepción', 1, 50, 'Iglesia de la Inmaculada Concepción'),
  ('pregunta', '¿En qué año fue declarado Concepción Bien de Interés Cultural de la Nación?',
   '1999', 3, 80, 'Calles empedradas del centro'),
  ('pregunta', '¿De qué material son las gruesas paredes de las casas coloniales del centro?',
   'Tapia|Tapia pisada|Tapia y bahareque|Bahareque|Barro', 1, 50, 'Calles empedradas del centro'),
  ('reunion', 'Punto de encuentro: llega al Parque Principal José María Córdova, el corazón de La Concha, y marca tu llegada.',
   'asistencia', 1, 40, 'Parque Principal José María Córdova')
) AS v(tipo, pregunta, respuesta, dificultad, puntos, ubicacion)
WHERE NOT EXISTS (SELECT 1 FROM bancos_preguntas p WHERE p.pregunta = v.pregunta);
