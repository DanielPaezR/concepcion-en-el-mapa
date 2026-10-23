// data/dialogosMascota.js
// Diálogos del Pato de Torrentes, el compañero del explorador en Concepción
// (Antioquia). Cada situación tiene varias frases y se elige una al azar para
// que la mascota no repita siempre lo mismo. Mantener las frases cortas: la
// burbuja mide ~220 px y se cierra a los 8 segundos.

const elegir = (opciones) => opciones[Math.floor(Math.random() * opciones.length)];

const momentoDelDia = () => {
  const h = new Date().getHours();
  if (h < 12) return 'manana';
  if (h < 18) return 'tarde';
  return 'noche';
};

// Datos y consejos que cuenta al tocar la mascota
export const DATOS_CONCEPCION = [
  '📜 Aquí nació José María Córdova en 1799, uno de los generales más jóvenes de la Independencia y héroe de la batalla de Ayacucho.',
  '🗽 La estatua de Córdova del parque se hizo en París y fue un regalo del Ecuador. Cuentan que primero mandaron un dedo de bronce para medir el pedestal.',
  '⚖️ ¿Sabías que el pueblo le puso una demanda a Dios? En los papeles, la iglesia era de Dios y de las ánimas del purgatorio. ¡Y el pueblo ganó!',
  '🇨🇴 Aquí no hay Plaza de Bolívar: el parque y su estatua son para Córdova, el hijo del pueblo.',
  '😄 A Concepción le dicen "La Concha" y a su gente "conchudos". ¡Aquí eso es un orgullo!',
  '🏛️ Desde 1999 Concepción es Bien de Interés Cultural de la Nación por sus calles empedradas y casas coloniales.',
  '🏘️ Mira las casas: paredes de tapia, balcones de madera y aleros anchos. Así se construía en la Antioquia de la Colonia.',
  '⛪ El pueblo lleva el nombre de la Inmaculada Concepción, su patrona. La iglesia del parque es su corazón.',
  '🐴 Por estas montañas del oriente antioqueño pasaban los arrieros con sus mulas, cargando café, panela y noticias.',
  '🦆 ¿Sabías que los patos de torrentes nadamos contra la corriente? Vivimos en ríos de montaña limpios como los de aquí.',
  '☕ Pregunta por un tinto en cualquier esquina: el café de estas lomas tiene fama de buen aroma.',
  '🌄 Sube al Mirador Alto de la Virgen al atardecer: desde allá se ve todo el pueblo entre las montañas.',
  '💧 El Charco El Salto y la Cascada La Honda son de agua fría de montaña. ¡Lleva ropa de cambio!',
  '🏛️ En el Museo Comunitario guardan objetos y fotos que las familias del pueblo han conservado por generaciones.',
  '🚶 Las calles empedradas del centro se recorren mejor a pie y sin afán. Así es como se descubren los secretos.',
  '🗺️ Cada lugar que descubres te da XP. Al nivel 3 y al nivel 5 ganas un código de descuento para los comercios aliados.',
  '🛡️ Al llegar a nivel 5 puedes anclar tu guardián en tu rincón favorito para que otros exploradores lo encuentren.',
];

export const dialogos = {
  bienvenida: (nombre) => {
    const quien = nombre && !/^Explorador_/.test(nombre) ? `, ${nombre.split(' ')[0]}` : '';
    return elegir({
      manana: [
        `☀️ ¡Buenos días${quien}! Bienvenido a Concepción, la tierra de José María Córdova. ¿Arrancamos?`,
        `🌄 ¡Qué buena mañana${quien}! Las calles empedradas nos esperan. ¡Camine pues!`,
      ],
      tarde: [
        `👋 ¡Buenas tardes${quien}! Bienvenido a Concepción. Tengo muchos rincones para mostrarte.`,
        `☕ ¡Eh avemaría, qué buena tarde${quien}! Perfecta para un tinto y salir a explorar.`,
      ],
      noche: [
        `🌙 ¡Buenas noches${quien}! El parque iluminado es una belleza. Explora con calma.`,
        `✨ ¡Bienvenido${quien}! De noche Concepción se pone tranquilita. Mañana también hay mucho por ver.`,
      ],
    }[momentoDelDia()]);
  },

  dato: () => elegir(DATOS_CONCEPCION),

  sinUbicacion: () => elegir([
    '📍 Activa tu ubicación y te guío por el pueblo. Sin ella ando más perdido que un pato en el desierto.',
    '📍 Necesito tu ubicación para saber qué tienes cerca. ¡Actívala y arrancamos!',
  ]),

  lejos: (nombre, metros) => elegir([
    `🚶 Te faltan unos ${metros} m para llegar a ${nombre}. ¡Ánimo, que ya casi!`,
    `🧭 ${nombre} está a ${metros} m. Acércate un poco más para descubrirlo.`,
    `👣 Todavía estás a ${metros} m de ${nombre}. Por estas calles se llega rapidito.`,
  ]),

  yaDescubierto: (nombre) => elegir([
    `📖 ${nombre} ya está en tu bitácora. ¡Vamos por el siguiente!`,
    `✅ Ya conoces ${nombre}. Mira el mapa: quedan más lugares por descubrir.`,
  ]),

  // Al abrir el detalle de un lugar, según su tipo
  lugar: (lugar) => {
    const n = lugar.nombre;
    const porTipo = {
      historico: [
        `⛪ ${n} guarda siglos de historia del pueblo. Fíjate en los detalles de su construcción.`,
        `📜 En ${n} se respira la historia de Concepción. ¡Qué belleza de lugar!`,
      ],
      natural: [
        `🌿 ${n} es pura naturaleza del oriente antioqueño. Respira profundo y disfruta.`,
        `💧 En ${n} el agua y la montaña mandan. ¡Aquí me siento como en mi río!`,
      ],
      cultural: [
        `🎭 ${n} cuenta quiénes somos los de Concepción. Pregunta, que la gente aquí es muy amable.`,
        `🏛️ En ${n} está la memoria del pueblo. ¡Vale la pena entrar con calma!`,
      ],
      gastronomico: [
        `☕ ${n}: aquí se prueba el sabor de estas montañas. ¿Un tinto o una aguapanela?`,
        `🍽️ ${n} es para antojarse. La comida de la región es de las que reconfortan.`,
      ],
    };
    return elegir(porTipo[lugar.tipo] || [`✨ ${n} es un lugar especial de Concepción. ¡Descubre su historia!`]);
  },

  descubierto: (nombre) => elegir([
    `🎉 ¡Eh avemaría! Descubriste ${nombre}. ¡Ya es parte de tu bitácora!`,
    `✨ ¡${nombre} descubierto! Concepción te va abriendo sus secretos.`,
  ]),

  subirNivel: (nivel) => ({
    2: '🌟 ¡Nivel 2! Ya no eres turista, eres explorador. ¡Las calles de Concepción te reconocen!',
    3: '⭐ ¡Nivel 3, guardabosques! Te ganaste un código de descuento para los comercios aliados.',
    4: '🏆 ¡Nivel 4! Conoces el pueblo como un arriero conoce su camino.',
    5: '👑 ¡Nivel 5, leyenda de Concepción! Nuevo código de descuento y ya puedes anclar tu guardián.',
  }[nivel] || `🎉 ¡Subiste a nivel ${nivel}!`),

  retoCorrecto: (xp) => elegir([
    `🎉 ¡Eso es! Respuesta correcta: +${xp} XP. ¡Usted sí sabe de Concepción!`,
    `🧠 ¡Correcto! +${xp} XP. Ni el más viejo del parque lo habría dicho mejor.`,
  ]),

  retoIncorrecto: () => elegir([
    '🤔 Mmm, no es esa. Pregúntale a alguien del pueblo, aquí todos se saben las historias.',
    '❌ Casi, pero no. ¡Inténtalo otra vez, que para eso es el reto!',
  ]),

  curiosidadCerca: () => elegir([
    '💡 ¡Psst! Hay una curiosidad por aquí cerca. Toca el foco para descubrirla.',
    '💡 Este rincón tiene un secreto. ¡Busca el foco en el mapa!',
  ]),

  guardianAnclado: () => '🛡️ ¡Tu guardián quedó anclado aquí! Los exploradores que pasen cerca lo van a encontrar.',
  guardianRetirado: () => '🛡️ Guardián retirado. Cuando encuentres otro rincón favorito, lo anclas allá.',
  guardianSaludado: (nombre) => `👋 ¡Saludaste al guardián de ${nombre}! Le va a llegar tu visita.`,
  guardianYaSaludado: () => '👋 Ya saludaste a este guardián hoy. ¡Mañana puedes volver!',

  galeria: (nivel) => (nivel >= 5
    ? '📸 ¡El Rincón de Recuerdos del parque! Deja una foto para los que vienen detrás.'
    : '🔒 El Rincón de Recuerdos se abre en el nivel 5. ¡Sigue descubriendo lugares!'),

  // Página de detalle del lugar
  necesitaRegistro: () => '📝 Para pedir un guía primero regístrate. ¡Es rapidito!',
  buscandoGuia: (nombre) => `🧭 ¡Buena elección! Te busco un guía de la zona para ${nombre}.`,
  enlaceCopiado: () => '🔗 ¡Enlace copiado! Compártelo para que más gente conozca Concepción.',
  solicitudEnviada: () => '✅ ¡Solicitud enviada! Un guía del pueblo te va a contactar muy pronto.',
  registroParaGuia: () => '¡Casi listo! Regístrate y te consigo un guía que conozca cada rincón de Concepción.',
  errorGenerico: () => '😕 Algo salió mal. Inténtalo de nuevo en un momentico.',
};
