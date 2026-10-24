// components/MapaAmbiente.jsx
// Ambiente del mapa: relieve 3D del terreno, cielo con atmósfera y, en el
// estilo "aventura", una paleta de colores tipo videojuego.
// Se vuelve a aplicar cada vez que carga el estilo (style.load).
//
// Sin niebla (setFog) a propósito: en mapbox-gl 2.x los marcadores consultan
// la niebla antes de que esté inicializada y lanzan "Cannot read properties
// of undefined (reading 'get')". El cielo ya da el efecto de horizonte.
import { useEffect } from 'react';
import { useMap } from 'react-map-gl';

const FUENTE_RELIEVE = 'relieve-dem';

// Pinta las capas del estilo base con la paleta (solo cambia colores, no datos)
function aplicarPaleta(map, p) {
  for (const capa of map.getStyle().layers || []) {
    const { id, type } = capa;
    try {
      if (type === 'background') {
        map.setPaintProperty(id, 'background-color', p.tierra);
      } else if (type === 'fill') {
        if (/water/.test(id)) map.setPaintProperty(id, 'fill-color', p.agua);
        else if (/wood|forest|national-park/.test(id)) map.setPaintProperty(id, 'fill-color', p.bosque);
        else if (/park|grass|scrub|landcover|pitch/.test(id)) map.setPaintProperty(id, 'fill-color', p.vegetacion);
        else if (/building/.test(id)) map.setPaintProperty(id, 'fill-color', p.edificio);
        else if (/land/.test(id)) map.setPaintProperty(id, 'fill-color', p.tierra);
      } else if (type === 'line') {
        if (/waterway/.test(id)) map.setPaintProperty(id, 'line-color', p.rio);
        else if (/contour/.test(id)) map.setLayoutProperty(id, 'visibility', 'none');
        else if (/road|street|path|bridge|tunnel|track|steps/.test(id)) {
          map.setPaintProperty(id, 'line-color', /case|casing/.test(id) ? p.viaBorde : p.via);
        }
      } else if (type === 'symbol' && /contour/.test(id)) {
        // Las etiquetas de altitud ("2000 m") ensucian la vista de juego
        map.setLayoutProperty(id, 'visibility', 'none');
      } else if (type === 'symbol' && capa.layout?.['text-field']) {
        map.setPaintProperty(id, 'text-color', p.texto);
        map.setPaintProperty(id, 'text-halo-color', p.halo);
      } else if (type === 'hillshade') {
        // Sombras de montaña más marcadas, tipo maqueta
        map.setPaintProperty(id, 'hillshade-exaggeration', 0.7);
        map.setPaintProperty(id, 'hillshade-shadow-color', '#3f6b2f');
        map.setPaintProperty(id, 'hillshade-highlight-color', '#f4ffd9');
      }
    } catch {
      // Algunas capas no admiten la propiedad: se dejan como vienen
    }
  }
}

function aplicarAmbiente(map, estilo) {
  // Relieve 3D real del terreno (Concepción es montañosa). El clásico no lo
  // lleva: es lo que más carga el teléfono.
  if (!estilo.exageracionRelieve) {
    if (map.getTerrain()) map.setTerrain(null);
  } else {
    if (!map.getSource(FUENTE_RELIEVE)) {
      map.addSource(FUENTE_RELIEVE, {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
    }
    map.setTerrain({ source: FUENTE_RELIEVE, exaggeration: estilo.exageracionRelieve });
  }

  if (estilo.cielo && !map.getLayer('cielo')) {
    map.addLayer({
      id: 'cielo',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': estilo.cielo.sol,
        'sky-atmosphere-sun-intensity': 12,
        'sky-atmosphere-color': estilo.cielo.color,
        'sky-atmosphere-halo-color': estilo.cielo.horizonte,
      },
    });
  }

  if (estilo.paleta) aplicarPaleta(map, estilo.paleta);
}

export default function MapaAmbiente({ estilo }) {
  const { current } = useMap();

  useEffect(() => {
    const map = current?.getMap?.();
    if (!map || !estilo) return;
    if (import.meta.env.DEV) window.__mapa = map; // para inspeccionar en desarrollo

    const aplicar = () => {
      try {
        aplicarAmbiente(map, estilo);
      } catch (error) {
        console.warn('No se pudo aplicar el ambiente del mapa:', error.message);
      }
    };

    if (map.isStyleLoaded()) aplicar();
    map.on('style.load', aplicar);
    return () => map.off('style.load', aplicar);
  }, [current, estilo]);

  return null;
}
