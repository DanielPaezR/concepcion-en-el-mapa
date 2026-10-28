import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Teselas del mapa. Antes eran de CARTO, que ahora exige una API key y
// devolvía cada tesela con la marca de agua "API KEY REQUIRED" encima de las
// calles. Se usan las de Mapbox con el mismo token del resto del proyecto, y
// OpenStreetMap si no hay token configurado.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const CAPA_MAPA = MAPBOX_TOKEN
  ? {
      url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}{r}?access_token=${MAPBOX_TOKEN}`,
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20,
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    };

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapaCoordenadas({ latitud, longitud, onCoordenadasChange, altura = 400 }) {
  const [position, setPosition] = useState(null);
  const [usarUbicacionActual, setUsarUbicacionActual] = useState(false);

  useEffect(() => {
    if (latitud && longitud) {
      setPosition({ lat: parseFloat(latitud), lng: parseFloat(longitud) });
    }
  }, [latitud, longitud]);

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    onCoordenadasChange(latlng.lat.toFixed(6), latlng.lng.toFixed(6));
  };

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          onCoordenadasChange(latitude.toFixed(6), longitude.toFixed(6));
          setUsarUbicacionActual(true);
          toast.success('📍 Ubicación actual cargada');
        },
        (error) => {
          console.error('Error:', error);
          toast.error('No se pudo obtener tu ubicación');
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
    }
  };

  const center = position || { lat: 6.3944, lng: -75.2581 };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={obtenerUbicacionActual}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          📍 Usar mi ubicación actual
        </button>
        <button
          type="button"
          onClick={() => {
            setPosition(null);
            onCoordenadasChange('', '');
          }}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400"
        >
          🗑️ Limpiar
        </button>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: altura, width: '100%' }}>
        <MapContainer
          center={[center.lat, center.lng]}
          // Más cerca para ubicar el punto en la calle exacta
          zoom={position ? 18 : 16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer {...CAPA_MAPA} />
          <ClickHandler onMapClick={handleMapClick} />
          {position && (
            <Marker position={[position.lat, position.lng]}>
              {/* Popup opcional */}
            </Marker>
          )}
        </MapContainer>
      </div>
      
      {position && (
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            📍 Coordenadas seleccionadas:
          </p>
          <p className="text-xs text-green-600 font-mono">
            Latitud: {position.lat.toFixed(6)} | Longitud: {position.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        💡 Haz clic en cualquier punto del mapa para seleccionar coordenadas
      </p>
    </div>
  );
}