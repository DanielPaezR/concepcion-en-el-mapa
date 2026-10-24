// components/Map3DEffect.jsx
import { useEffect } from 'react';
import { useMap } from 'react-map-gl';

// Edificios en 3D. color: color de los volúmenes (depende del estilo del mapa).
// Solo funciona con estilos que tengan la fuente "composite" de Mapbox.
export default function Map3DEffect({ color = '#d4c9a6' }) {
  // useMap().current es el mapa que contiene este componente (antes se
  // buscaba un mapa con id "map" que no existe, y los edificios nunca salían)
  const { current } = useMap();

  useEffect(() => {
    const map = current?.getMap?.();
    if (!map) return;

    const add3D = () => {
      try {
        // Si ya existe solo se ajusta el color cuando cambia. Antes se
        // pintaba en cada "styledata", y pintar dispara otro "styledata":
        // el mapa se redibujaba sin parar en los estilos 3D.
        if (map.getLayer('3d-buildings')) {
          if (map.getPaintProperty('3d-buildings', 'fill-extrusion-color') !== color) {
            map.setPaintProperty('3d-buildings', 'fill-extrusion-color', color);
          }
          return;
        }
        if (!map.getSource('composite')) return; // estilo sin datos de edificios

        map.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 14,
          'paint': {
            'fill-extrusion-color': color,
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.9
          }
        });
      } catch (err) {
        console.log('Error adding 3D:', err);
      }
    };

    // Esperar a que el mapa esté listo (y volver a agregarlos al cambiar de estilo)
    if (map.isStyleLoaded()) add3D();
    map.on('load', add3D);
    map.on('styledata', add3D);

    return () => {
      map.off('load', add3D);
      map.off('styledata', add3D);
    };
  }, [current, color]);

  return null;
}
