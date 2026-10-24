// config/estilosMapa.js
// Estilos del mapa del turista. "clasico" es el mapa liviano de siempre (sin
// relieve ni edificios 3D) y es el que carga por defecto: el relieve 3D pesa
// mucho en teléfonos. Los demás parten de un estilo base de Mapbox y
// MapaAmbiente les agrega relieve 3D, cielo y (en "aventura") una paleta de
// colores tipo videojuego. exageracionRelieve: null = sin relieve.
//
// Estilo propio de Mapbox Studio: define VITE_MAPBOX_STYLE en el .env de la
// app del turista (y en Vercel). Acepta cualquiera de estos formatos:
//   mapbox://styles/usuario/idDelEstilo
//   https://api.mapbox.com/styles/v1/usuario/idDelEstilo.html?...  (enlace "Share")
//   https://studio.mapbox.com/styles/usuario/idDelEstilo/edit/...   (editor)
// El estilo debe estar PUBLICADO y ser de la misma cuenta que el token
// VITE_MAPBOX_TOKEN (o estar marcado como público en Studio).

// Convierte cualquiera de los formatos anteriores a mapbox://styles/usuario/id
export const normalizarEstiloMapbox = (url) => {
  const texto = String(url || '').trim();
  if (!texto) return null;
  if (texto.startsWith('mapbox://styles/')) return texto;
  const m = texto.match(/(?:api\.mapbox\.com\/styles\/v1|studio\.mapbox\.com\/styles)\/([^/?#]+)\/([^/?#.]+)/);
  return m ? `mapbox://styles/${m[1]}/${m[2]}` : null;
};

const ESTILO_PROPIO = normalizarEstiloMapbox(import.meta.env.VITE_MAPBOX_STYLE);

// Paleta "aventura": colores vivos y planos, como los mapas de juegos de exploración
export const PALETA_AVENTURA = {
  tierra: '#a8dd7c',
  vegetacion: '#7cc86a',
  bosque: '#5fb35a',
  agua: '#3fb8f0',
  rio: '#3fb8f0',
  via: '#fff4c9',
  viaBorde: '#d99a4e',
  edificio: '#ffd9a0',
  edificio3d: '#ffc979',
  texto: '#3b2a14',
  halo: '#fffaf0',
};

export const ESTILOS_MAPA = {
  clasico: {
    nombre: 'Clásico',
    emoji: '⚡',
    url: 'mapbox://styles/mapbox/dark-v11',
    exageracionRelieve: null,
    cielo: null,
    paleta: null,
    colorEdificios3d: null,
  },
  aventura: {
    nombre: 'Aventura 3D',
    emoji: '🗺️',
    url: 'mapbox://styles/mapbox/outdoors-v12',
    exageracionRelieve: 1.6,
    cielo: { color: '#7ec8ff', horizonte: '#ffe7b3', sol: [0, 75] },
    paleta: PALETA_AVENTURA,
    colorEdificios3d: PALETA_AVENTURA.edificio3d,
  },
  noche: {
    nombre: 'Noche 3D',
    emoji: '🌙',
    url: 'mapbox://styles/mapbox/dark-v11',
    exageracionRelieve: 1.4,
    cielo: { color: '#0b1230', horizonte: '#2b2f6b', sol: [0, 90] },
    paleta: null,
    colorEdificios3d: '#3d4a7a',
  },
  satelite: {
    nombre: 'Satélite 3D',
    emoji: '🛰️',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    exageracionRelieve: 1.5,
    cielo: { color: '#86c5ff', horizonte: '#fff1d0', sol: [0, 70] },
    paleta: null,
    colorEdificios3d: '#e8dcc4',
  },
  ...(ESTILO_PROPIO ? {
    propio: {
      nombre: 'Mi estilo',
      emoji: '🎨',
      url: ESTILO_PROPIO,
      exageracionRelieve: 1.4,
      cielo: null, // se respeta lo que traiga el estilo de Studio
      paleta: null,
      colorEdificios3d: null,
    },
  } : {}),
};

export const ESTILO_POR_DEFECTO = 'clasico';
