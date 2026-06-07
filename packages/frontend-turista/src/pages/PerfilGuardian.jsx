import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Calendar, Trophy, Award, Star, Zap, Crown, Camera, Edit2, Save, X, User, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Función para calcular sistema de EXP (consistente con Mapa.jsx) ───
const calcularSistemaExp = (totalLugares) => {
  const pesosPorNivel = [1, 1.5, 2, 2.5, 3];
  const sumaPesos = pesosPorNivel.reduce((a, b) => a + b, 0);
  const expBase = 10;
  const expRequerida = pesosPorNivel.map(p => Math.round((p/sumaPesos)*totalLugares*expBase));
  const expAcumulada = [];
  let acc = 0;
  expRequerida.forEach((curr) => { acc += curr; expAcumulada.push(acc); });
  return { expRequerida, expAcumulada, expBase };
};

// Colores por nivel (mismos que Mapa.jsx)
const levelColors = {
  1: { from: '#065f46', to: '#14532d', border: '#22c55e', text: '#4ade80' },
  2: { from: '#1e3a5f', to: '#0f2d4a', border: '#60a5fa', text: '#93c5fd' },
  3: { from: '#312e81', to: '#1e1b4b', border: '#818cf8', text: '#a5b4fc' },
  4: { from: '#451a03', to: '#1c0900', border: '#f59e0b', text: '#fcd34d' },
  5: { from: '#450a0a', to: '#1a0505', border: '#ef4444', text: '#fca5a5' },
};

const getNivelEtiqueta = (nivel) => {
  const etiquetas = {
    1: 'Principiante',
    2: 'Explorador',
    3: 'Aventurero',
    4: 'Guardián',
    5: 'Leyenda',
  };
  return etiquetas[nivel] || 'Principiante';
};

const getNivelIcon = (nivel) => {
  if (nivel >= 5) return Crown;
  if (nivel >= 3) return Zap;
  return Star;
};

export default function PerfilGuardian() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [insignias, setInsignias] = useState([]);
  const [estadisticasEventos, setEstadisticasEventos] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true);
  const [lugaresDescubiertos, setLugaresDescubiertos] = useState(0);
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
  
  // ✅ Datos sincronizados desde el backend
  const [nivelReal, setNivelReal] = useState(1);
  const [xpReal, setXpReal] = useState(0);
  const [totalLugaresSistema, setTotalLugaresSistema] = useState(0);

  // ✅ Función para obtener el perfil y datos de progreso desde el backend
  const cargarPerfilYProgreso = async (userId) => {
    try {
      // 1. Obtener perfil de usuario (nivel, XP, email, etc.)
      const perfilRes = await api.get('/auth/perfil');
      const usuario = perfilRes.data;
      setNivelReal(usuario.nivel || 1);
      setXpReal(usuario.xp_total || 0);
      
      // 2. Obtener lugares descubiertos del usuario
      const descRes = await api.get('/descubrimientos/mis-descubrimientos');
      const lugares = descRes.data || [];
      setLugaresDescubiertos(lugares.length);
      
      // 3. Obtener total de lugares del sistema (para cálculo de barras de progreso)
      const lugaresSys = await api.get('/lugares');
      const total = lugaresSys.data?.data?.length || 8;
      setTotalLugaresSistema(total);
      
      // 4. Obtener perfil de guardián (nombre público, biografía, etc.)
      const perfilGuardianRes = await api.get(`/guardianes/perfil/${userId}`);
      const perfilData = perfilGuardianRes.data.perfil;
      setPerfil({
        ...perfilData,
        email: usuario.email,
        nivel_real: usuario.nivel,
        xp_total_real: usuario.xp_total
      });
      setInsignias(perfilGuardianRes.data.insignias || []);
      
      // 5. Estadísticas de eventos
      try {
        const eventosRes = await api.get('/eventos/mis-estadisticas');
        setEstadisticasEventos(eventosRes.data.estadisticas);
        setTitulo(eventosRes.data.titulo);
      } catch (e) {
        console.log('Estadísticas de eventos no disponibles');
      }
      
    } catch (error) {
      console.error('Error cargando perfil/progreso:', error);
      toast.error('Error al cargar los datos del perfil');
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      setLoading(true);
      await cargarPerfilYProgreso(parseInt(id));
      await obtenerUsuarioActual();
      setLoading(false);
    };
    init();
  }, [id]);

  const obtenerUsuarioActual = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) token = localStorage.getItem('turista_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioActual(payload);
        if (payload.id === parseInt(id)) setEsMiPerfil(true);
      }
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
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
      // Recargar datos
      await cargarPerfilYProgreso(parseInt(id));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar perfil');
    }
  };

  const handleSubirFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
      const response = await api.post('/guardianes/subir-foto', formDataFile);
      if (response.data.success) {
        setFormData(prev => ({ ...prev, foto_perfil_url: response.data.url }));
        toast.success('Foto subida correctamente');
        await cargarPerfilYProgreso(parseInt(id));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al subir foto');
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
    if (nivel >= 5) return { titulo: '👑 Leyenda', color: 'text-red-400' };
    if (nivel >= 4) return { titulo: '🛡️ Guardián', color: 'text-amber-400' };
    if (nivel >= 3) return { titulo: '⚡ Aventurero', color: 'text-indigo-400' };
    if (nivel >= 2) return { titulo: '⭐ Explorador', color: 'text-blue-400' };
    return { titulo: '🌱 Principiante', color: 'text-green-400' };
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

  const nivelData = getNivelTitulo(nivelReal);
  const sistemaExp = calcularSistemaExp(totalLugaresSistema);
  const xpParaSiguiente = sistemaExp.expAcumulada?.[nivelReal - 1] ?? (nivelReal * 10);
  const xpAnterior = nivelReal > 1 ? (sistemaExp.expAcumulada?.[nivelReal - 2] ?? 0) : 0;
  const progreso = xpParaSiguiente > xpAnterior 
    ? Math.min(((xpReal - xpAnterior) / (xpParaSiguiente - xpAnterior)) * 100, 100)
    : 100;
  const lc = levelColors[Math.min(nivelReal, 5)];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-6">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center gap-1 hover:opacity-80 transition">
          ← Volver
        </button>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-3 border-white">
              {(formData.foto_perfil_url || perfil.foto_perfil_url) ? (
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

      <div className="p-4">
        {editando && esMiPerfil ? (
          <textarea
            value={formData.biografia}
            onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
            placeholder="Cuéntanos sobre ti, tus aventuras favoritas..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
            rows="3"
          />
        ) : (
          perfil.biografia && <div className="bg-white rounded-xl p-4 mb-4 shadow">
            <p className="text-gray-600">{perfil.biografia}</p>
          </div>
        )}
        {!perfil.biografia && !editando && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow">
            <p className="text-gray-400 text-center italic">
              {esMiPerfil ? '✨ Edita tu perfil para compartir tu historia' : 'Este aventurero aún no ha escrito su biografía'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold" style={{ color: lc.text }}>{nivelReal}</div>
            <div className="text-xs text-gray-500">Nivel</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-green-500">{lugaresDescubiertos}</div>
            <div className="text-xs text-gray-500">Lugares</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-amber-500">{xpReal}</div>
            <div className="text-xs text-gray-500">XP</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center mb-4 shadow">
          <p className={`text-lg font-bold ${nivelData.color}`}>
            {nivelData.titulo}
          </p>
        </div>

        {/* Barra de progreso consistente con el mapa */}
        <div 
          className="rounded-xl p-3 shadow mb-4"
          style={{
            background: `linear-gradient(135deg, ${lc.from}, ${lc.to})`,
            border: `1px solid ${lc.border}`,
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {React.createElement(getNivelIcon(nivelReal), { size: 16, color: lc.text })}
            <span className="font-bold text-sm" style={{ color: lc.text, letterSpacing: '.05em' }}>
              NV. {nivelReal} · {getNivelEtiqueta(nivelReal)}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-1">
            <div 
              className="h-full rounded-full transition-all"
              style={{ width: `${progreso}%`, background: lc.border }}
            />
          </div>
          <div className="text-center text-xs text-white/60">
            {xpReal} / {xpParaSiguiente} XP
          </div>
        </div>

        {estadisticasEventos && (
          <div className="bg-white rounded-xl p-4 shadow mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🎯 Retos del Pueblo</h3>
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
              <span className="text-lg font-bold text-purple-800">{getTituloEmoji(titulo)} {titulo || 'Visitante'}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Insignias {insignias.length > 0 && `(${insignias.length})`}
          </h3>
          
          {insignias.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {insignias.map((insignia) => (
                <div key={insignia.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg px-3 py-2 text-sm flex items-center gap-2 shadow-sm">
                  <span className="text-xl">{insignia.icono || '🏅'}</span>
                  <span className="font-medium">{insignia.nombre}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Aún no hay insignias</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}