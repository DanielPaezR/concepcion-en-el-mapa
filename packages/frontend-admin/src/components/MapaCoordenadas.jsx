import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapaCoordenadas({ latitud, longitud, onCoordenadasChange }) {
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
      
      <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
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