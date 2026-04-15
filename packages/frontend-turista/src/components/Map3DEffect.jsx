// components/Map3DEffect.jsx
import { useEffect } from 'react';
import { useMap } from 'react-map-gl';

export default function Map3DEffect() {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const add3D = () => {
      try {
        // Verificar si la capa ya existe
        if (map.getLayer('3d-buildings')) return;

        map.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 14,
          'paint': {
            'fill-extrusion-color': '#d4c9a6',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.9
          }
        });
        console.log('✅ Edificios 3D activados');
      } catch (err) {
        console.log('Error adding 3D:', err);
      }
    };

    // Esperar a que el mapa esté listo
    if (map.isStyleLoaded()) {
      add3D();
    } else {
      map.on('load', add3D);
      map.on('styledata', add3D);
    }

    return () => {
      if (map && map.getLayer && map.getLayer('3d-buildings')) {
        map.removeLayer('3d-buildings');
      }
    };
  }, [map]);

  return null;
}