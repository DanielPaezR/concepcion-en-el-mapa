import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, MapPin, Calendar, Trophy, Award, Star, Zap } from 'lucide-react';
import api from '../services/api';

export default function PerfilGuardian() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [insignias, setInsignias] = useState([]);
  const [estadisticasEventos, setEstadisticasEventos] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
    cargarEstadisticasEventos();
  }, [id]);

  const cargarPerfil = async () => {
    try {
      const response = await api.get(`/guardianes/perfil/${id}`);
      setPerfil(response.data.perfil);
      setInsignias(response.data.insignias || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarEstadisticasEventos = async () => {
    try {
      const response = await api.get('/eventos/mis-estadisticas');
      setEstadisticasEventos(response.data.estadisticas);
      setTitulo(response.data.titulo);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTituloEmoji = (titulo) => {
    if (titulo.includes('Leyenda')) return '👑';
    if (titulo.includes('Guardián')) return '🛡️';
    if (titulo.includes('Explorador')) return '⭐';
    if (titulo.includes('Aprendiz')) return '🌱';
    return '🧳';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Perfil no encontrado</h2>
          <button onClick={() => navigate('/')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg">
            Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-6">
        <button onClick={() => navigate(-1)} className="text-white mb-4">← Volver</button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{perfil.nombre_publico || perfil.email_nombre?.split('@')[0]}</h1>
            {perfil.ciudad_origen && <p className="text-purple-200">📍 {perfil.ciudad_origen}</p>}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Biografía */}
        {perfil.biografia && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow">
            <p className="text-gray-600">{perfil.biografia}</p>
          </div>
        )}

        {/* Estadísticas generales */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">{perfil.nivel || 1}</div>
            <div className="text-xs text-gray-500">Nivel</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">{perfil.lugares_descubiertos || 0}</div>
            <div className="text-xs text-gray-500">Lugares</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">{perfil.xp_total || 0}</div>
            <div className="text-xs text-gray-500">XP</div>
          </div>
        </div>

        {/* Estadísticas de eventos (Retos del Pueblo) */}
        {estadisticasEventos && (
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              🎯 Retos del Pueblo
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div>
                <div className="text-2xl font-bold text-purple-600">{estadisticasEventos.total_completados || 0}</div>
                <div className="text-xs text-gray-500">Retos completados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{estadisticasEventos.racha_actual || 0}</div>
                <div className="text-xs text-gray-500">Racha actual 🔥</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{estadisticasEventos.racha_maxima || 0}</div>
                <div className="text-xs text-gray-500">Mejor racha</div>
              </div>
            </div>
            
            {/* Título actual */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 text-center mb-3">
              <span className="text-lg font-bold text-purple-800">
                {getTituloEmoji(titulo)} {titulo || 'Visitante'}
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Próximo título:</span>
                <span>
                  {estadisticasEventos.total_completados >= 50 ? '🏆 ¡Máximo!' : 
                   estadisticasEventos.total_completados >= 30 ? '50 eventos para Leyenda' :
                   estadisticasEventos.total_completados >= 15 ? '30 eventos para Guardián' :
                   estadisticasEventos.total_completados >= 5 ? '15 eventos para Explorador' :
                   '5 eventos para Aprendiz'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((estadisticasEventos.total_completados / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Insignias */}
        {insignias.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Insignias
            </h3>
            <div className="flex flex-wrap gap-2">
              {insignias.map((insignia) => (
                <div key={insignia.id} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                  <span>{insignia.icono || '🏅'}</span>
                  {insignia.nombre}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}