import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Calendar, Trophy, Award, Star, Zap, Camera, Edit2, Save, X, User, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PerfilGuardian() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [insignias, setInsignias] = useState([]);
  const [estadisticasEventos, setEstadisticasEventos] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre_publico: '',
    ciudad_origen: '',
    biografia: '',
    foto_perfil_url: ''
  });
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [esMiPerfil, setEsMiPerfil] = useState(false);

  useEffect(() => {
    cargarTodo();
    obtenerUsuarioActual();
  }, [id]);

  const obtenerUsuarioActual = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioActual(payload);
        
        // Verificar si es su propio perfil
        if (payload.id === parseInt(id)) {
          setEsMiPerfil(true);
        }
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
    }
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);
      
      // Cargar perfil del guardián
      const perfilResponse = await api.get(`/guardianes/perfil/${id}`);
      setPerfil(perfilResponse.data.perfil);
      setInsignias(perfilResponse.data.insignias || []);
      
      // Cargar estadísticas del usuario (descubrimientos reales)
      const [descubrimientosRes, usuarioRes] = await Promise.all([
        api.get(`/descubrimientos/mis-descubrimientos`),
        api.get(`/usuarios/${id}`)
      ]);
      
      // Actualizar el perfil con datos reales
      setPerfil(prev => ({
        ...prev,
        lugares_descubiertos_real: descubrimientosRes.data?.length || 0,
        nivel_real: usuarioRes.data?.nivel || 1,
        xp_total_real: usuarioRes.data?.xp_total || 0,
        email: usuarioRes.data?.email
      }));
      
      // Cargar estadísticas de eventos
      try {
        const eventosResponse = await api.get('/eventos/mis-estadisticas');
        setEstadisticasEventos(eventosResponse.data.estadisticas);
        setTitulo(eventosResponse.data.titulo);
      } catch (error) {
        console.log('No se pudieron cargar estadísticas de eventos');
      }
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = () => {
    if (perfil) {
      setFormData({
        nombre_publico: perfil.nombre_publico || '',
        ciudad_origen: perfil.ciudad_origen || '',
        biografia: perfil.biografia || '',
        foto_perfil_url: perfil.foto_perfil_url || ''
      });
      setEditando(true);
    }
  };

  const handleGuardar = async () => {
    try {
      await api.put('/guardianes/perfil', formData);
      toast.success('Perfil actualizado');
      setEditando(false);
      cargarTodo(); // Recargar datos
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar perfil');
    }
  };

  const handleSubirFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB');
      return;
    }
    
    setSubiendoFoto(true);
    const formDataFile = new FormData();
    formDataFile.append('foto', file);
    
    try {
      const response = await api.post('/guardianes/subir-foto', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, foto_perfil_url: response.data.url }));
      toast.success('Foto subida correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir foto');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const getTituloEmoji = (titulo) => {
    if (titulo?.includes('Leyenda')) return '👑';
    if (titulo?.includes('Guardián')) return '🛡️';
    if (titulo?.includes('Explorador')) return '⭐';
    if (titulo?.includes('Aprendiz')) return '🌱';
    return '🧳';
  };

  const getNivelTitulo = (nivel) => {
    if (nivel >= 20) return { titulo: '👑 Leyenda de Concepción', color: 'text-yellow-600' };
    if (nivel >= 10) return { titulo: '🛡️ Guardián del Pueblo', color: 'text-purple-600' };
    if (nivel >= 5) return { titulo: '⭐ Aventurero Estrella', color: 'text-blue-600' };
    if (nivel >= 3) return { titulo: '🌟 Explorador', color: 'text-green-600' };
    return { titulo: '🌱 Principiante', color: 'text-gray-600' };
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

  const nivelData = getNivelTitulo(perfil.nivel_real || perfil.nivel || 1);
  const lugaresReales = perfil.lugares_descubiertos_real || perfil.lugares_descubiertos || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header con foto de perfil */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-6">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center gap-1 hover:opacity-80 transition">
          ← Volver
        </button>
        
        <div className="flex items-center gap-4">
          {/* Foto de perfil con opción de editar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-3 border-white">
              {formData.foto_perfil_url || perfil.foto_perfil_url ? (
                <img 
                  src={formData.foto_perfil_url || perfil.foto_perfil_url} 
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Shield className="w-12 h-12 text-white" />
              )}
            </div>
            
            {esMiPerfil && editando && (
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 cursor-pointer shadow-lg hover:bg-gray-100 transition">
                <Camera className="w-4 h-4 text-purple-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirFoto}
                  className="hidden"
                  disabled={subiendoFoto}
                />
              </label>
            )}
          </div>
          
          <div className="flex-1">
            {editando && esMiPerfil ? (
              <input
                type="text"
                value={formData.nombre_publico}
                onChange={(e) => setFormData({ ...formData, nombre_publico: e.target.value })}
                placeholder="Tu nombre público"
                className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1 w-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
            ) : (
              <h1 className="text-2xl font-bold">
                {perfil.nombre_publico || perfil.email?.split('@')[0] || 'Aventurero'}
              </h1>
            )}
            {editando && esMiPerfil ? (
              <input
                type="text"
                value={formData.ciudad_origen}
                onChange={(e) => setFormData({ ...formData, ciudad_origen: e.target.value })}
                placeholder="Ciudad de origen"
                className="text-purple-200 bg-white/20 rounded-lg px-2 py-0.5 text-sm mt-1 w-full"
              />
            ) : (
              perfil.ciudad_origen && <p className="text-purple-200 text-sm">📍 {perfil.ciudad_origen}</p>
            )}
          </div>
          
          {esMiPerfil && !editando && (
            <button
              onClick={handleEditar}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        
        {/* Botones de guardar/cancelar en modo edición */}
        {editando && esMiPerfil && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleGuardar}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Biografía editable */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow">
          {editando && esMiPerfil ? (
            <textarea
              value={formData.biografia}
              onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
              placeholder="Cuéntanos sobre ti, tus aventuras favoritas..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows="3"
            />
          ) : (
            perfil.biografia && <p className="text-gray-600">{perfil.biografia}</p>
          )}
          {!perfil.biografia && !editando && (
            <p className="text-gray-400 text-center italic">
              {esMiPerfil ? '✨ Edita tu perfil para compartir tu historia' : 'Este aventurero aún no ha escrito su biografía'}
            </p>
          )}
        </div>

        {/* Estadísticas generales (DATOS REALES) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">{perfil.nivel_real || perfil.nivel || 1}</div>
            <div className="text-xs text-gray-500">Nivel</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">{lugaresReales}</div>
            <div className="text-xs text-gray-500">Lugares descubiertos</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">{perfil.xp_total_real || perfil.xp_total || 0}</div>
            <div className="text-xs text-gray-500">XP total</div>
          </div>
        </div>

        {/* Título del nivel */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center mb-4 shadow">
          <p className={`text-lg font-bold ${nivelData.color}`}>
            {nivelData.titulo}
          </p>
        </div>

        {/* Barra de progreso al siguiente nivel */}
        <div className="bg-white rounded-xl p-3 shadow mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progreso al siguiente nivel</span>
            <span>{((perfil.xp_total_real || perfil.xp_total || 0) % 100)}/100 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${((perfil.xp_total_real || perfil.xp_total || 0) % 100)}%` }}
            />
          </div>
        </div>

        {/* Estadísticas de eventos */}
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
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 text-center mb-3">
              <span className="text-lg font-bold text-purple-800">
                {getTituloEmoji(titulo)} {titulo || 'Visitante'}
              </span>
            </div>
            
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
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Insignias {insignias.length > 0 && `(${insignias.length})`}
          </h3>
          
          {insignias.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {insignias.map((insignia) => (
                <div 
                  key={insignia.id} 
                  className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg px-3 py-2 text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition cursor-help"
                  title={`Obtenida el ${new Date(insignia.fecha_obtenida).toLocaleDateString()}`}
                >
                  <span className="text-xl">{insignia.icono || '🏅'}</span>
                  <span className="font-medium">{insignia.nombre}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Aún no hay insignias</p>
              <p className="text-xs text-gray-400 mt-1">
                {esMiPerfil ? 'Completa eventos y descubre lugares para ganar insignias' : 'Este aventurero aún no ha ganado insignias'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}