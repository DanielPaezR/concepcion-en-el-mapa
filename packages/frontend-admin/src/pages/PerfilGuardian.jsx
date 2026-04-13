// pages/PerfilGuardian.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, CalendarIcon, TrophyIcon, ShieldCheckIcon,
  UserIcon, ChatBubbleLeftIcon, GlobeAltIcon, CameraIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

export default function PerfilGuardian() {
  const { usuarioId } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [insignias, setInsignias] = useState([]);
  const [guardianActivo, setGuardianActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [esMiPerfil, setEsMiPerfil] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, [usuarioId]);

  const cargarPerfil = async () => {
    try {
      // Verificar si es mi perfil
      const token = localStorage.getItem('turista_token');
      let miId = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          miId = payload.id;
          setEsMiPerfil(miId == usuarioId);
        } catch (e) {}
      }

      const response = await api.get(`/guardianes/perfil/${usuarioId}`);
      setPerfil(response.data.perfil);
      setInsignias(response.data.insignias || []);
      setGuardianActivo(response.data.guardian_activo);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Perfil no encontrado</h2>
          <p className="text-gray-600 mt-2">Este guardián no existe o su perfil es privado</p>
          <button
            onClick={() => navigate('/mapa')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header con fondo */}
      <div className="relative h-48 bg-gradient-to-r from-primary-700 to-primary-500">
        <button
          onClick={() => navigate('/mapa')}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-2"
        >
          ← Volver
        </button>
        
        {esMiPerfil && (
          <button
            onClick={() => navigate('/editar-perfil')}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm"
          >
            Editar perfil
          </button>
        )}
        
        {/* Avatar del guardián */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
            {perfil.foto_perfil_url ? (
              <img src={perfil.foto_perfil_url} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-4xl">🧙</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del perfil */}
      <div className="pt-16 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {perfil.nombre_publico || perfil.email_nombre?.split('@')[0]}
          </h1>
          {perfil.ciudad_origen && (
            <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
              <GlobeAltIcon className="w-4 h-4" />
              {perfil.ciudad_origen}
            </p>
          )}
          {perfil.biografia && (
            <p className="text-gray-600 mt-3 max-w-md mx-auto">{perfil.biografia}</p>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600">{perfil.nivel || 1}</div>
            <div className="text-xs text-gray-500">Nivel</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600">{perfil.lugares_descubiertos || 0}</div>
            <div className="text-xs text-gray-500">Lugares descubiertos</div>
          </div>
        </div>

        {/* Guardián activo */}
        {guardianActivo && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-800">🛡️ Guardián activo</h3>
            </div>
            <p className="text-sm text-gray-600">
              Apadrinando un lugar en Concepción desde el {new Date(guardianActivo.fecha_inicio).toLocaleDateString()}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Válido hasta: {new Date(guardianActivo.fecha_fin).toLocaleDateString()}
            </p>
            {guardianActivo.mensaje && (
              <div className="mt-3 bg-white/50 rounded-lg p-3">
                <p className="text-sm italic text-gray-600">"{guardianActivo.mensaje}"</p>
              </div>
            )}
          </div>
        )}

        {/* Insignias */}
        {insignias.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-800">Insignias</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {insignias.map((insignia) => (
                <motion.div
                  key={insignia.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-3 shadow-sm text-center min-w-[80px]"
                  title={insignia.descripcion}
                >
                  <div className="text-3xl">{insignia.icono || '🏅'}</div>
                  <div className="text-xs font-medium mt-1">{insignia.nombre}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}