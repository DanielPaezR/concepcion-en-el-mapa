// pages/MisFavoritos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Calendar, Users } from 'lucide-react';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import toast from 'react-hot-toast';

export default function MisFavoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const usuario = getTuristaActual();

  useEffect(() => {
    if (usuario?.id && !usuario.anonimo) {
      cargarFavoritos();
    }
  }, [usuario]);

  const cargarFavoritos = async () => {
    try {
      const response = await api.get('/favoritos/mis-favoritos');
      setFavoritos(response.data.favoritos || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (lugarId) => {
    try {
      await api.post(`/favoritos/toggle/${lugarId}`);
      toast.success('Eliminado de favoritos');
      cargarFavoritos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
        <button onClick={() => navigate(-1)} className="text-white mb-4">← Volver</button>
        <div className="flex items-center gap-3">
          <Heart className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Mis Favoritos</h1>
            <p className="text-green-100 text-sm">Lugares que te han gustado</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {favoritos.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            No tienes lugares favoritos
            <button
              onClick={() => navigate('/mapa')}
              className="block w-full mt-4 bg-green-600 text-white py-2 rounded-lg"
            >
              Explorar lugares
            </button>
          </div>
        ) : (
          favoritos.map((lugar) => (
            <div key={lugar.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{lugar.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lugar.descripcion}</p>
                  {lugar.direccion && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lugar.direccion}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => eliminarFavorito(lugar.id)}
                  className="text-red-500 hover:text-red-600 p-2"
                >
                  <Heart className="w-5 h-5 fill-red-500" />
                </button>
              </div>
              <button
                onClick={() => navigate(`/lugar/${lugar.id}`)}
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Ver detalles
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}