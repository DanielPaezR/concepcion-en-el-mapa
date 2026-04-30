import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Calendar, Trophy, Award, Star, Zap, Crown, Camera, Edit2, Save, X, User, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Función para calcular sistema de EXP (misma que Mapa.jsx) ───
const calcularSistemaExp = (totalLugares) => {
  const pesosPorNivel = [1, 1.5, 2, 2.5, 3];
  const sumaPesos = pesosPorNivel.reduce((a, b) => a + b, 0);
  const expBase = 10;
  const expRequerida = pesosPorNivel.map(p => Math.round((p/sumaPesos)*totalLugares*expBase));
  const expAcumulada = [];
  expRequerida.reduce((acc, curr, i) => { expAcumulada[i] = acc + curr; return expAcumulada[i]; }, 0);
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

// Etiquetas por nivel (mismas que Mapa.jsx)
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

// Icono según nivel (mismos que Mapa.jsx)
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

  useEffect(() => {
    cargarTodo();
    obtenerUsuarioActual();
  }, [id]);

  const obtenerUsuarioActual = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        token = localStorage.getItem('turista_token');
      }
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioActual(payload);
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
      
      // 1. Cargar perfil del guardián
      const perfilResponse = await api.get(`/guardianes/perfil/${id}`);
      setPerfil(perfilResponse.data.perfil);
      setInsignias(perfilResponse.data.insignias || []);
      
      // 2. Cargar datos del usuario (email, etc.)
      const usuarioRes = await api.get(`/usuarios/${id}`);
      
      // 3. 🔥 Calcular NIVEL usando la MISMA fórmula del mapa
      let nivelCalculado = 1;
      let xpActual = 0;
      let sistemaExp = null;
      
      try {
        // Obtener XP desde localStorage (misma fuente que el mapa)
        xpActual = parseInt(localStorage.getItem('player_xp') || '0');
        
        // Obtener total de lugares para calcular sistema de EXP
        const lugaresRes = await api.get('/lugares');
        const totalLugares = lugaresRes.data.data?.length || 8;
        
        // Usar la MISMA función que el mapa
        sistemaExp = calcularSistemaExp(totalLugares);
        
        // Calcular nivel igual que en el mapa
        for (let i = 0; i < sistemaExp.expAcumulada.length; i++) {
          if (xpActual < sistemaExp.expAcumulada[i]) {
            nivelCalculado = i + 1;
            break;
          }
        }
        if (xpActual >= sistemaExp.expAcumulada[sistemaExp.expAcumulada.length - 1]) nivelCalculado = 5;
        
        console.log('✅ XP desde localStorage:', xpActual);
        console.log('✅ Nivel calculado:', nivelCalculado);
        console.log('✅ Sistema EXP:', sistemaExp);
      } catch(e) {
        console.error('Error calculando nivel:', e);
      }
      
      // 4. Obtener lugares descubiertos desde localStorage
      let lugaresCount = 0;
      try {
        const saved = localStorage.getItem('concepcion_descubiertos');
        if (saved) {
          const parsed = JSON.parse(saved);
          lugaresCount = Array.isArray(parsed) ? parsed.length : 0;
        }
      } catch(e) {}
      setLugaresDescubiertos(lugaresCount);
      
      // 5. Actualizar perfil con nivel calculado
      setPerfil(prev => ({
        ...prev,
        nivel_real: nivelCalculado,
        xp_total_real: xpActual,
        email: usuarioRes.data?.email
      }));
      
      // 6. Cargar estadísticas de eventos
      try {
        const eventosResponse = await api.get('/eventos/mis-estadisticas');
        setEstadisticasEventos(eventosResponse.data.estadisticas);
        setTitulo(eventosResponse.data.titulo);
      } catch (error) {
        console.log('Estadísticas de eventos no disponibles');
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
      cargarTodo();
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

  const nivelData = getNivelTitulo(perfil.nivel_real || 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-6">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center gap-1 hover:opacity-80 transition">
          ← Volver
        </button>
        
        <div className="flex items-center gap-4">
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
            <div className="text-2xl font-bold" style={{ color: levelColors[Math.min(perfil.nivel_real || 1, 5)].text }}>{perfil.nivel_real || 1}</div>
            <div className="text-xs text-gray-500">Nivel</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-green-500">{lugaresDescubiertos}</div>
            <div className="text-xs text-gray-500">Lugares</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <div className="text-2xl font-bold text-amber-500">{perfil.xp_total_real || 0}</div>
            <div className="text-xs text-gray-500">XP</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center mb-4 shadow">
          <p className={`text-lg font-bold ${nivelData.color}`}>
            {nivelData.titulo}
          </p>
        </div>

        {/* Barra de progreso consistente con el mapa */}
        {(() => {
          const nivel = perfil.nivel_real || 1;
          const xp = perfil.xp_total_real || 0;
          const totalLugares = 8; // Valor por defecto, se puede obtener de la API
          const sistema = calcularSistemaExp(totalLugares);
          const xpParaSiguiente = sistema?.expAcumulada?.[nivel - 1] ?? (nivel * 10);
          const xpAnterior = nivel > 1 ? (sistema?.expAcumulada?.[nivel - 2] ?? 0) : 0;
          const progreso = xpParaSiguiente > xpAnterior 
            ? Math.min(((xp - xpAnterior) / (xpParaSiguiente - xpAnterior)) * 100, 100)
            : 100;
          const lc = levelColors[Math.min(nivel, 5)];
          
          return (
            <div 
              className="rounded-xl p-3 shadow mb-4"
              style={{
                background: `linear-gradient(135deg, ${lc.from}, ${lc.to})`,
                border: `1px solid ${lc.border}`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {React.createElement(getNivelIcon(nivel), { 
                  size: 16, 
                  color: lc.text 
                })}
                <span 
                  className="font-bold text-sm"
                  style={{ color: lc.text, letterSpacing: '.05em' }}
                >
                  NV. {nivel} · {getNivelEtiqueta(nivel)}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${progreso}%`,
                    background: lc.border
                  }}
                />
              </div>
              <div className="text-center text-xs text-white/60">
                {xp} / {xpParaSiguiente} XP
              </div>
            </div>
          );
        })()}

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