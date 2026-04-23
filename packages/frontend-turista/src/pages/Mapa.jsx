import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Navigation, Award, Target, LocateFixed, 
  Star, Zap, Crown, Shield, Sparkles, Menu, X,
  MapPin, Users, Landmark, TreePine, Utensils,
  Crosshair, Eye, Footprints
} from 'lucide-react';
import api from '../services/api';
import CompaneroVirtual from '../components/CompaneroVirtual';
import GaleriaFotos from '../components/GaleriaFotos';
import Map3DEffect from '../components/Map3DEffect';
import AnclarGuardian from '../components/AnclarGuardian';
import EstadoReserva from '../components/EstadoReserva';
import MenuExplorador from '../components/MenuExplorador';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const STORAGE_KEY = 'concepcion_descubiertos';
const VISIT_RADIUS = 50; // metros

// ============================================================
// 📦 COMPONENTES INTERNOS (para mejor organización)
// ============================================================

// 🧭 Brujula funcional (reemplaza la falsa)
const BrujulaFuncional = ({ bearing, onRotate }) => {
  const [angle, setAngle] = useState(bearing || 0);
  
  useEffect(() => {
    setAngle(bearing || 0);
  }, [bearing]);
  
  const handleClick = () => {
    // Resetear orientación al norte
    if (onRotate) onRotate(0);
  };
  
  return (
    <motion.button
      animate={{ rotate: angle }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className="brújula-btn"
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 48,
        height: 48,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        borderRadius: '50%',
        border: '2px solid #fbbf24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
      title="Orientar al norte"
    >
      <Compass className="text-yellow-400" size={24} />
    </motion.button>
  );
};

// 🎛️ Panel HUD Superior
const HUDHeader = ({ 
  playerLevel, discoveredPlaces, totalLugares, xp, 
  lugarEspecial, onOpenGaleria, onOpenAnclar, 
  onToggleQuestLog, showQuestLog, isMobile 
}) => (
  <motion.div 
    initial={{ y: -100 }} 
    animate={{ y: 0 }} 
    className="hud-header"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: isMobile ? 8 : 12,
      gap: 8,
      pointerEvents: 'none' // Los hijos tendrán pointer-events auto
    }}
  >
    {/* Grupo izquierdo */}
    <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
      {/* Nivel */}
      <div className="level-badge" style={{
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
        borderRadius: 40,
        padding: '6px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
          {playerLevel >= 5 ? <Crown size={14} /> : playerLevel >= 3 ? <Zap size={14} /> : <Star size={14} />}
          Nv. {playerLevel}
        </span>
      </div>
      
      {/* Progreso descubrimientos */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 40,
        padding: '6px 12px',
        border: '1px solid #22c55e'
      }}>
        <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={12} />
          {discoveredPlaces.length}/{totalLugares}
        </span>
      </div>
      
      {/* XP */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 40,
        padding: '6px 12px',
        border: '1px solid #a855f7'
      }}>
        <span style={{ color: '#c084fc', fontWeight: 'bold', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={12} />
          {xp} XP
        </span>
      </div>
      
      {/* Botones especiales */}
      {playerLevel >= 5 && lugarEspecial && (
        <button
          onClick={onOpenGaleria}
          style={{
            background: 'linear-gradient(135deg, #eab308, #f59e0b)',
            borderRadius: 40,
            padding: '6px 12px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Award size={18} color="white" />
        </button>
      )}
      
      {/* Anclar Guardián (solo nivel 5 y todos descubiertos) */}
      {playerLevel >= 5 && discoveredPlaces.length === totalLugares && (
        <button
          onClick={onOpenAnclar}
          style={{
            background: '#7c3aed',
            borderRadius: 40,
            padding: '6px 12px',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Anclar Guardián"
        >
          🛡️
        </button>
      )}
    </div>
    
    {/* Botón menú derecho */}
    <button
      onClick={onToggleQuestLog}
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 40,
        padding: 10,
        border: '1px solid #eab308',
        cursor: 'pointer',
        pointerEvents: 'auto'
      }}
    >
      {showQuestLog ? <X size={20} color="#ef4444" /> : <Menu size={20} color="#4ade80" />}
    </button>
  </motion.div>
);

// 🗺️ Botón de ubicación actual
const BotonUbicacion = ({ userPosition, onCenter }) => {
  if (!userPosition) return null;
  
  return (
    <button
      onClick={onCenter}
      className="ubicacion-btn"
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#2563eb',
        borderRadius: 50,
        padding: 12,
        border: '2px solid white',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="Centrar en mi ubicación"
    >
      <Navigation size={20} color="white" />
    </button>
  );
};

// 📜 Panel de Quest Log (Descubrimientos)
const QuestLogPanel = ({ show, lugares, discoveredPlaces, getTipoIcon, onClose, onSelectLugar, isMobile }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        style={{
          position: 'absolute',
          top: isMobile ? 60 : 70,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: 12,
          border: '1px solid #22c55e',
          width: isMobile ? 'calc(100% - 20px)' : 320,
          maxWidth: 320,
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 'bold', color: '#fbbf24', marginBottom: 12 }}>
          📜 Descubrimientos ({discoveredPlaces.length}/{lugares.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lugares.map(lugar => {
            const isDiscovered = discoveredPlaces.includes(lugar.id);
            return (
              <div
                key={lugar.id}
                onClick={() => {
                  onClose();
                  onSelectLugar(lugar);
                }}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  cursor: 'pointer',
                  backgroundColor: isDiscovered ? 'rgba(34,197,94,0.2)' : 'rgba(55,65,81,0.5)',
                  border: isDiscovered ? '1px solid #22c55e' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getTipoIcon(lugar.tipo)}
                    <span style={{ color: 'white', fontSize: 14, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lugar.nombre}
                    </span>
                  </div>
                  {isDiscovered ? (
                    <span style={{ color: '#4ade80', fontSize: 14 }}>✓</span>
                  ) : (
                    <span style={{ color: '#fbbf24', fontSize: 12 }}>⚔️</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 📍 Prompt de ubicación
const LocationPrompt = ({ show, onAccept, onDeny }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          backgroundColor: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 16,
          padding: 16,
          border: '2px solid #22c55e',
          width: '90%',
          maxWidth: 350,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <LocateFixed size={48} color="#4ade80" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
            ¿Activamos tu ubicación?
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>
            Necesitamos tu ubicación para descubrir lugares automáticamente cuando estés cerca.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onAccept}
              style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', padding: 10, borderRadius: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Activar
            </button>
            <button
              onClick={onDeny}
              style={{ flex: 1, backgroundColor: '#4b5563', color: 'white', padding: 10, borderRadius: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Ahora no
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 🎯 Modal de Evento
const EventoModal = ({ evento, respuesta, setRespuesta, onResponder, onClose }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: 16
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: 24,
      maxWidth: 400,
      width: '100%',
      padding: 24
    }}>
      <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        🎯 {evento.titulo}
      </h3>
      <p style={{ color: '#374151', marginBottom: 16 }}>{evento.pregunta}</p>
      <input
        type="text"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Tu respuesta..."
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #d1d5db',
          borderRadius: 12,
          marginBottom: 16
        }}
        onKeyPress={(e) => e.key === 'Enter' && onResponder()}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onResponder}
          style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', padding: 10, borderRadius: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          Responder
        </button>
        <button
          onClick={onClose}
          style={{ flex: 1, backgroundColor: '#9ca3af', color: 'white', padding: 10, borderRadius: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
);

// 🦆 Avatar del Jugador Estilo RPG (Inspirado en el Pato de Torrentes)
const AvatarJugador = ({ level, isMobile }) => {
  const size = isMobile ? 52 : 64;
  
  // Configuración de estilo según el nivel del jugador
  const getTheme = () => {
    if (level >= 5) return { 
      bg: 'from-slate-900 to-slate-800', 
      accent: '#dc2626', 
      glow: 'shadow-[0_0_20px_rgba(220,38,38,0.6)]',
      border: 'border-yellow-500',
      label: '🔥 GUARDIÁN'
    };
    if (level >= 3) return { 
      bg: 'from-amber-900 to-orange-900', 
      accent: '#ef4444', 
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      border: 'border-amber-500',
      label: '🛡️ GUERRERO'
    };
    return { 
      bg: 'from-emerald-800 to-green-900', 
      accent: '#f87171', 
      glow: 'shadow-lg',
      border: 'border-white',
      label: '🌲 EXPLORADOR'
    };
  };

  const theme = getTheme();

  return (
    <div className="relative group flex flex-col items-center">
      {/* Aura de poder dinámica que late detrás del personaje */}
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-full ${level >= 5 ? 'bg-red-500' : level >= 3 ? 'bg-amber-500' : 'bg-emerald-500'} blur-xl -z-10`}
      />

      {/* Contenedor del Avatar con animación de flotado */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`relative ${isMobile ? 'w-12 h-14' : 'w-16 h-20'} bg-gradient-to-br ${theme.bg} rounded-2xl border-2 ${theme.border} ${theme.glow} flex items-center justify-center overflow-hidden`}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full p-1 drop-shadow-md">
          {/* Cuerpo del Pato (Estilo dibujo minimalista) */}
          <path d="M50 20 Q85 20 85 60 Q85 100 50 100 Q15 100 15 60 Q15 20 50 20" fill="white" />
          {/* Capucha/Plumaje superior (Negro/Slate-800) */}
          <path d="M50 20 Q85 20 85 55 L15 55 Q15 20 50 20" fill="#1e293b" />
          {/* Ojos */}
          <circle cx="35" cy="45" r="4" fill="white" />
          <circle cx="65" cy="45" r="4" fill="white" />
          {/* Pico Rojo del Pato de Torrentes */}
          <path d="M42 55 L58 55 L50 75 Z" fill={theme.accent} />
          
          {/* Detalles de rango */}
          {level >= 3 && <path d="M10 50 L25 50 L20 80 L10 80 Z" fill="#94a3b8" /> /* Mini Escudo */}
          {level >= 5 && <path d="M75 40 L90 40 L82 10 Z" fill="#fbbf24" /> /* Punta de Corona/Casco */}
        </svg>
      </motion.div>

      {/* Etiqueta de Rango estilo HUD de juego */}
      <div className="absolute -bottom-6 bg-slate-950/90 backdrop-blur-md text-[8px] font-black text-white px-2 py-0.5 rounded border border-white/20 whitespace-nowrap tracking-widest shadow-2xl z-20">
        {theme.label} <span className="text-yellow-400">NV.{level}</span>
      </div>
    </div>
  );
};

// ============================================================
// 🎮 COMPONENTE PRINCIPAL
// ============================================================

function Mapa() {
  // ========== ESTADOS ==========
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [discoveredPlaces, setDiscoveredPlaces] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [lastVisitedPlace, setLastVisitedPlace] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [shouldLocate, setShouldLocate] = useState(false);
  const [userResponded, setUserResponded] = useState(false);
  const [xp, setXp] = useState(0);
  const [mensajeGuia, setMensajeGuia] = useState('');
  const [tipoGuia, setTipoGuia] = useState('normal');
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [sistemaExp, setSistemaExp] = useState({ expRequerida: [], expAcumulada: [], expBase: 10 });
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [lugarEspecial, setLugarEspecial] = useState(null);
  const [lugarEspecialDesbloqueado, setLugarEspecialDesbloqueado] = useState(false);
  const [mostrarAnclar, setMostrarAnclar] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [respuestaEvento, setRespuestaEvento] = useState('');
  const [viewState, setViewState] = useState({
    longitude: -75.2581,
    latitude: 6.3944,
    zoom: 18,
    pitch: 60,
    bearing: 15
  });
  
  const navigate = useNavigate();

  // ========== FUNCIONES AUXILIARES ==========
  const mostrarMensajeGuia = (mensaje, tipo = 'normal', duracion = 5000) => {
    setMensajeGuia(mensaje);
    setTipoGuia(tipo);
    setMostrarGuia(true);
    setTimeout(() => setMostrarGuia(false), duracion);
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      historico: <Landmark size={isMobile ? 16 : 20} />,
      natural: <TreePine size={isMobile ? 16 : 20} />,
      cultural: <Users size={isMobile ? 16 : 20} />,
      gastronomico: <Utensils size={isMobile ? 16 : 20} />
    };
    return icons[tipo] || <MapPin size={isMobile ? 16 : 20} />;
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calcularSistemaExp = (totalLugares) => {
    const pesosPorNivel = [1, 1.5, 2, 2.5, 3];
    const sumaPesos = pesosPorNivel.reduce((a, b) => a + b, 0);
    const expBase = 10;
    const expRequerida = pesosPorNivel.map(peso => Math.round((peso / sumaPesos) * totalLugares * expBase));
    const expAcumulada = [];
    expRequerida.reduce((acc, curr, i) => {
      expAcumulada[i] = acc + curr;
      return expAcumulada[i];
    }, 0);
    return { expRequerida, expAcumulada, expBase };
  };

  const calcularNivelPorXP = (xpActual, expAcumulada) => {
    for (let i = 0; i < expAcumulada.length; i++) {
      if (xpActual < expAcumulada[i]) return i + 1;
    }
    return expAcumulada.length + 1;
  };

  // ========== EFECTOS ==========
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (playerLevel >= 5) setLugarEspecialDesbloqueado(true);
  }, [playerLevel]);

  useEffect(() => {
    if (!loading && lugares.length > 0) {
      mostrarMensajeGuia('¡Bienvenido a Concepción! Explora el mapa y descubre lugares increíbles.', 'bienvenida', 6000);
      cargarLugarEspecial();
      cargarEventos();
    }
  }, [loading]);

  useEffect(() => {
    if (locationPermission === 'granted' && userPosition) {
      mostrarMensajeGuia('¡Excelente! Muévete para descubrir lugares automáticamente.', 'consejo', 5000);
    }
  }, [locationPermission, userPosition]);

  useEffect(() => {
    if (lastVisitedPlace) {
      mostrarMensajeGuia(`¡Has descubierto ${lastVisitedPlace.nombre}! +${sistemaExp.expBase} XP`, 'descubrimiento', 4000);
    }
  }, [lastVisitedPlace]);

  useEffect(() => {
    if (playerLevel > 1 && discoveredPlaces.length > 0) {
      mostrarMensajeGuia(`¡Felicidades! Has alcanzado el nivel ${playerLevel}!`, 'nivel', 5000);
    }
  }, [playerLevel]);

  // Detección automática de lugares cercanos
  useEffect(() => {
    if (userPosition && lugares.length > 0) {
      const lugaresCerca = lugares.filter(lugar => {
        if (discoveredPlaces.includes(lugar.id)) return false;
        const distance = calcularDistancia(
          userPosition.lat, userPosition.lng,
          parseFloat(lugar.latitud), parseFloat(lugar.longitud)
        );
        return distance < VISIT_RADIUS;
      });
      
      lugaresCerca.forEach(lugar => {
        if (!discoveredPlaces.includes(lugar.id)) {
          setDiscoveredPlaces(prev => [...prev, lugar.id]);
          setLastVisitedPlace(lugar);
          setTimeout(() => setLastVisitedPlace(null), 3000);
        }
      });
    }
  }, [userPosition, lugares]);

  // Consejos aleatorios cada 30 segundos
  useEffect(() => {
    const consejos = [
      'Los marcadores dorados son lugares que ya descubriste.',
      'Cada lugar descubierto te da 10 XP.',
      'El avatar cambia de forma según tu nivel.',
      'Usa el botón azul para volver a tu ubicación.',
      '¡Los eventos diarios te dan XP extra!'
    ];
    const intervalo = setInterval(() => {
      if (!lastVisitedPlace && !showQuestLog) {
        mostrarMensajeGuia(consejos[Math.floor(Math.random() * consejos.length)], 'consejo', 4000);
      }
    }, 30000);
    return () => clearInterval(intervalo);
  }, [lastVisitedPlace, showQuestLog]);

  // Cargar datos guardados
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setDiscoveredPlaces(parsed);
        const savedXp = localStorage.getItem('player_xp');
        if (savedXp) setXp(parseInt(savedXp));
      }
    } catch (e) {
      console.error("Error cargando progreso guardado:", e);
      localStorage.removeItem(STORAGE_KEY); // Limpiar si está corrupto
    }
  }, []);

  // Sistema de experiencia
  useEffect(() => {
    if (lugares.length > 0) {
      const sistema = calcularSistemaExp(lugares.length);
      setSistemaExp(sistema);
      if (xp > 0) {
        const nuevoNivel = calcularNivelPorXP(xp, sistema.expAcumulada);
        setPlayerLevel(Math.min(nuevoNivel, 5));
      }
    }
  }, [lugares]);

  useEffect(() => {
    if (discoveredPlaces.length > 0 && sistemaExp.expBase > 0) {
      const nuevoXP = discoveredPlaces.length * sistemaExp.expBase;
      setXp(nuevoXP);
      localStorage.setItem('player_xp', nuevoXP);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(discoveredPlaces));
      if (sistemaExp.expAcumulada.length > 0) {
        const nuevoNivel = calcularNivelPorXP(nuevoXP, sistemaExp.expAcumulada);
        setPlayerLevel(Math.min(nuevoNivel, 5));
      }
    }
  }, [discoveredPlaces, sistemaExp]);

  // Verificar estado de ubicación al inicio
  useEffect(() => {
    const checkLocationStatus = async () => {
      const savedResponse = localStorage.getItem('locationResponse');
      if (savedResponse === 'granted') {
        setShouldLocate(true);
        setLocationPermission('granted');
        setUserResponded(true);
      } else if (savedResponse === 'denied') {
        setLocationPermission('denied');
        setUserResponded(true);
        setShowLocationPrompt(false);
      } else {
        if (navigator.permissions?.query) {
          try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            if (result.state === 'granted') {
              setShouldLocate(true);
              setLocationPermission('granted');
              setUserResponded(true);
              localStorage.setItem('locationResponse', 'granted');
            } else if (result.state === 'denied') {
              setLocationPermission('denied');
              setUserResponded(true);
              setShowLocationPrompt(false);
              localStorage.setItem('locationResponse', 'denied');
            } else {
              setShowLocationPrompt(true);
            }
          } catch (error) {
            setTimeout(() => setShowLocationPrompt(true), 1000);
          }
        } else {
          setTimeout(() => setShowLocationPrompt(true), 1000);
        }
      }
    };
    checkLocationStatus();
  }, []);

  // Obtener ubicación cuando shouldLocate cambie
  useEffect(() => {
    if (shouldLocate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setViewState(prev => ({
            ...prev,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 16
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
        }
      );
    }
  }, [shouldLocate]);

  // ========== FUNCIONES DE CARGA ==========
  const cargarLugares = async () => {
    try {
      const response = await api.get('/lugares');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setLugares(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarLugarEspecial = async () => {
    try {
      const response = await api.get('/lugar-especial');
      setLugarEspecial(response.data.lugar);
      setLugarEspecialDesbloqueado(response.data.desbloqueado);
    } catch (error) {
      console.error('Error al cargar lugar especial:', error);
    }
  };

  const cargarEventos = async () => {
    try {
      const response = await api.get('/eventos/activos');
      setEventos(response.data.eventos || []);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const handleCompletarEvento = async (eventoId, respuesta) => {
    try {
      const response = await api.post('/eventos/completar', { eventoId, respuesta });
      if (response.data.success) {
        mostrarMensajeGuia(`🎉 ¡Completaste el reto! +${response.data.xp_ganada} XP`, 'celebrando', 4000);
        setEventoSeleccionado(null);
        setRespuestaEvento('');
        cargarEventos();
        const stats = await api.get('/eventos/mis-estadisticas');
        if (stats.data.titulo !== tituloActual) {
          mostrarMensajeGuia(`🏆 ¡NUEVO TÍTULO! Ahora eres ${stats.data.titulo}`, 'celebrando', 5000);
        }
      }
    } catch (error) {
      mostrarMensajeGuia('❌ Respuesta incorrecta. ¡Sigue intentando!', 'pensativo', 3000);
    }
  };

  useEffect(() => {
    cargarLugares();
  }, []);

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 border-4 border-t-transparent border-white rounded-full"
        />
      </motion.div>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Error de Configuración</h2>
          <p className="text-red-500">No se detectó el token de Mapbox (VITE_MAPBOX_TOKEN).</p>
        </div>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="h-screen relative overflow-hidden">
      {/* HUD Superior */}
      <HUDHeader
        playerLevel={playerLevel}
        discoveredPlaces={discoveredPlaces}
        totalLugares={lugares.length}
        xp={xp}
        lugarEspecial={lugarEspecial}
        onOpenGaleria={() => setMostrarGaleria(true)}
        onOpenAnclar={() => setMostrarAnclar(true)}
        onToggleQuestLog={() => setShowQuestLog(!showQuestLog)}
        showQuestLog={showQuestLog}
        isMobile={isMobile}
      />

      {/* 🧭 Brújula funcional */}
      <BrujulaFuncional 
        bearing={viewState.bearing} 
        onRotate={(b) => setViewState(prev => ({ ...prev, bearing: b }))} 
      />

      {/* Compañero Virtual (Guía) */}
      <CompaneroVirtual 
        mensaje={mensajeGuia} 
        nivel={playerLevel} 
        emocion={lastVisitedPlace ? 'celebrando' : locationPermission === 'granted' ? 'feliz' : 'pensativo'} 
      />

      {/* Galería de Fotos */}
      {mostrarGaleria && (
        <GaleriaFotos 
          nivelUsuario={playerLevel} 
          onCerrar={() => setMostrarGaleria(false)} 
        />
      )}

      {/* Prompt de ubicación */}
      <LocationPrompt
        show={showLocationPrompt && !userResponded}
        onAccept={() => {
          setShowLocationPrompt(false);
          setShouldLocate(true);
          setUserResponded(true);
          localStorage.setItem('locationResponse', 'granted');
        }}
        onDeny={() => {
          setShowLocationPrompt(false);
          setLocationPermission('denied');
          setUserResponded(true);
          localStorage.setItem('locationResponse', 'denied');
        }}
      />

      {/* Quest Log */}
      <QuestLogPanel
        show={showQuestLog}
        lugares={lugares}
        discoveredPlaces={discoveredPlaces}
        getTipoIcon={getTipoIcon}
        onClose={() => setShowQuestLog(false)}
        onSelectLugar={setSelectedLugar}
        isMobile={isMobile}
      />

      {/* MAPA */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        onError={(e) => console.log('Mapbox Error:', e)}
      >
        <Map3DEffect />
        <NavigationControl position="top-right" />
        
        {/* Avatar del jugador */}
        {userPosition && (
          <Marker
            longitude={userPosition.lng}
            latitude={userPosition.lat}
          >
            <AvatarJugador level={playerLevel} isMobile={isMobile} />
          </Marker>
        )}
        
        {/* Marcadores de lugares */}
        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            longitude={parseFloat(lugar.longitud)}
            latitude={parseFloat(lugar.latitud)}
            onClick={() => setSelectedLugar(lugar)}
          >
            <div 
              className="cursor-pointer transition-transform hover:scale-110"
              style={{
                width: isMobile ? 40 : 50,
                height: isMobile ? 40 : 50,
                background: discoveredPlaces.includes(lugar.id) 
                  ? 'linear-gradient(135deg, gold, #FFA500)' 
                  : 'linear-gradient(135deg, #FF6B6B, #FF4444)',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white'
              }}
            >
              <span style={{ transform: 'rotate(45deg)', fontSize: isMobile ? 20 : 24 }}>
                {lugar.tipo === 'historico' && '🏛️'}
                {lugar.tipo === 'natural' && '🌲'}
                {lugar.tipo === 'cultural' && '🎭'}
                {lugar.tipo === 'gastronomico' && '🍽️'}
              </span>
            </div>
          </Marker>
        ))}
        
        {/* Marcador del lugar especial */}
        {lugarEspecial && lugarEspecialDesbloqueado && (
          <Marker
            longitude={parseFloat(lugarEspecial.longitud)}
            latitude={parseFloat(lugarEspecial.latitud)}
          >
            <div className="cursor-pointer animate-pulse">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                <span className="text-3xl">👑</span>
              </div>
            </div>
          </Marker>
        )}

        {/* Marcadores de eventos diarios */}
        {eventos.map((evento) => (
          <Marker
            key={`evento_${evento.id}`}
            longitude={parseFloat(evento.longitud)}
            latitude={parseFloat(evento.latitud)}
            onClick={() => setEventoSeleccionado(evento)}
          >
            <div className="cursor-pointer animate-bounce">
              <div className="w-12 h-12 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-2xl">❓</span>
              </div>
            </div>
          </Marker>
        ))}
        
        {/* Popup del lugar seleccionado */}
        {selectedLugar && (
          <Popup
            longitude={parseFloat(selectedLugar.longitud)}
            latitude={parseFloat(selectedLugar.latitud)}
            onClose={() => setSelectedLugar(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
          >
            <div className="p-3 max-w-[200px]">
              <h3 className="font-bold text-gray-900">{selectedLugar.nombre}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedLugar.descripcion}</p>
              <button
                onClick={() => navigate(`/lugar/${selectedLugar.id}`)}
                className="mt-3 w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-bold hover:bg-green-700 transition"
              >
                Explorar
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Botón de ubicación actual */}
      <BotonUbicacion
        userPosition={userPosition}
        onCenter={() => {
          if (userPosition) {
            setViewState(prev => ({
              ...prev,
              longitude: userPosition.lng,
              latitude: userPosition.lat,
              zoom: 16
            }));
          }
        }}
      />

      {/* Menú de explorador */}
      <MenuExplorador 
        nivel={playerLevel}
        xp={xp}
        lugaresDescubiertos={discoveredPlaces.length}
        totalLugares={lugares.length}
      />

      {/* Modal Anclar Guardián */}
      {mostrarAnclar && (
        <AnclarGuardian
          userPosition={userPosition}
          onClose={() => setMostrarAnclar(false)}
          onAnclado={() => {
            setMostrarAnclar(false);
          }}
        />
      )}

      {/* Modal de Evento */}
      {eventoSeleccionado && (
        <EventoModal
          evento={eventoSeleccionado}
          respuesta={respuestaEvento}
          setRespuesta={setRespuestaEvento}
          onResponder={() => handleCompletarEvento(eventoSeleccionado.id, respuestaEvento)}
          onClose={() => setEventoSeleccionado(null)}
        />
      )}

      {/* Estado de Reserva */}
      <EstadoReserva />
    </div>
  );
}

export default Mapa;