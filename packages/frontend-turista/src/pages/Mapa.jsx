import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Navigation, Award, Target, LocateFixed, 
  Star, Zap, Crown, Shield, Sparkles, Menu, X,
  MapPin, Users, Landmark, TreePine, Utensils
} from 'lucide-react';
import api from '../services/api';
import CompaneroVirtual from '../components/CompaneroVirtual';
import GaleriaFotos from '../components/GaleriaFotos';
import Map3DEffect from '../components/Map3DEffect';
import AnclarGuardian from '../components/AnclarGuardian';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Almacenamiento local para lugares visitados
const STORAGE_KEY = 'concepcion_descubiertos';
const VISIT_RADIUS = 50; // metros

function Mapa() {
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
  const navigate = useNavigate();
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
  const [guardianesCercanos, setGuardianesCercanos] = useState([]);
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

  const mostrarMensajeGuia = (mensaje, tipo = 'normal', duracion = 5000) => {
    setMensajeGuia(mensaje);
    setTipoGuia(tipo);
    setMostrarGuia(true);
    setTimeout(() => setMostrarGuia(false), duracion);
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
            // Recargar estadísticas del usuario
            const stats = await api.get('/eventos/mis-estadisticas');
            if (stats.data.titulo !== tituloActual) {
                mostrarMensajeGuia(`🏆 ¡NUEVO TÍTULO! Ahora eres ${stats.data.titulo}`, 'celebrando', 5000);
            }
        }
    } catch (error) {
        mostrarMensajeGuia('❌ Respuesta incorrecta. ¡Sigue intentando!', 'pensativo', 3000);
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

  useEffect(() => {
    if (userPosition && lugares.length > 0) {
      const lugaresCerca = lugares.filter(lugar => {
        if (discoveredPlaces.includes(lugar.id)) return false;
        const R = 6371e3;
        const φ1 = userPosition.lat * Math.PI/180;
        const φ2 = lugar.latitud * Math.PI/180;
        const Δφ = (lugar.latitud - userPosition.lat) * Math.PI/180;
        const Δλ = (lugar.longitud - userPosition.lng) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
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

  useEffect(() => {
    const consejos = [
      'Los marcadores dorados son lugares que ya descubriste.',
      'Cada lugar descubierto te da 10 XP.',
      'El avatar cambia de forma según tu nivel.',
      'Usa el botón azul para volver a tu ubicación.'
    ];
    const intervalo = setInterval(() => {
      if (!lastVisitedPlace && !showQuestLog) {
        mostrarMensajeGuia(consejos[Math.floor(Math.random() * consejos.length)], 'consejo', 4000);
      }
    }, 30000);
    return () => clearInterval(intervalo);
  }, [lastVisitedPlace, showQuestLog]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setDiscoveredPlaces(parsed);
      const savedXp = localStorage.getItem('player_xp');
      if (savedXp) setXp(parseInt(savedXp));
    }
  }, []);

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

  useEffect(() => {
    cargarLugares();
  }, []);

  useEffect(() => {
    if (shouldLocate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 15
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
        }
      );
    }
  }, [shouldLocate]);

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

  const getTipoIcon = (tipo) => {
    const icons = {
      historico: <Landmark className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />,
      natural: <TreePine className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />,
      cultural: <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />,
      gastronomico: <Utensils className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
    };
    return icons[tipo] || <MapPin className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />;
  };

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

  return (
    <div className="h-screen relative overflow-hidden">
      {/* HUD Superior */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="absolute top-0 left-0 right-0 z-[1000] flex justify-between items-start p-3">
        <div className="flex items-center space-x-2">
          <div className="level-badge bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full px-4 py-2 shadow-lg">
            <span className="text-white flex items-center gap-1 font-bold">
              {playerLevel >= 5 ? <Crown className="w-4 h-4" /> : playerLevel >= 3 ? <Zap className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              Nv. {playerLevel}
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-green-500">
            <span className="text-green-400 font-bold text-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {discoveredPlaces.length}/{lugares.length}
            </span>
          </div>
          <select value={playerLevel} onChange={(e) => setPlayerLevel(Number(e.target.value))} className="bg-black/50 text-white rounded-lg px-2 py-1 text-sm border border-yellow-500">
            <option value={1}>Nv1 🐣</option>
            <option value={2}>Nv2 ✨</option>
            <option value={3}>Nv3 ⭐</option>
            <option value={4}>Nv4 ⚡</option>
            <option value={5}>Nv5 👑</option>
          </select>
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 font-bold text-xs">{xp} XP</span>
            </div>
          </div>
          {playerLevel >= 5 && lugarEspecial && (
            <button onClick={() => setMostrarGaleria(true)} className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full p-2 shadow-lg">
              <Award className="text-white w-5 h-5" />
            </button>
          )}
          {/* Botón para anclar guardián (solo nivel 5 y todos los lugares descubiertos) */}
          {playerLevel >= 5 && discoveredPlaces.length === lugares.length && (
            <button
              onClick={() => setMostrarAnclar(true)}
              className="bg-purple-600 rounded-full p-2 shadow-lg hover:bg-purple-700 transition"
              title="Anclar Guardián"
            >
              🛡️
            </button>
          )}
        </div>
        <button onClick={() => setShowQuestLog(!showQuestLog)} className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-yellow-500">
          {showQuestLog ? <X className="text-red-400 w-5 h-5" /> : <Menu className="text-green-400 w-5 h-5" />}
        </button>
      </motion.div>

      <CompaneroVirtual mensaje={mensajeGuia} nivel={playerLevel} emocion={lastVisitedPlace ? 'celebrando' : locationPermission === 'granted' ? 'feliz' : 'pensativo'} />

      {mostrarGaleria && <GaleriaFotos nivelUsuario={playerLevel} onCerrar={() => setMostrarGaleria(false)} />}

      {/* Prompt de ubicación */}
      <AnimatePresence>
        {showLocationPrompt && !userResponded && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-[2000] bg-black/90 backdrop-blur-sm rounded-lg p-4 border-2 border-green-500 shadow-2xl w-[90%] max-w-md">
            <div className="text-center">
              <LocateFixed className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">¿Activamos tu ubicación?</h3>
              <p className="text-gray-300 text-sm mb-4">Necesitamos tu ubicación para descubrir lugares automáticamente cuando estés cerca.</p>
              <div className="flex space-x-2">
                <button onClick={() => { setShowLocationPrompt(false); setShouldLocate(true); setUserResponded(true); localStorage.setItem('locationResponse', 'granted'); }} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">Activar</button>
                <button onClick={() => { setShowLocationPrompt(false); setLocationPermission('denied'); setUserResponded(true); localStorage.setItem('locationResponse', 'denied'); }} className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-bold">Ahora no</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Log */}
      <AnimatePresence>
        {showQuestLog && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute top-16 right-3 z-[1000] bg-black/95 backdrop-blur-sm rounded-xl p-3 border border-green-500 w-80 max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">📜 Descubrimientos</h3>
            <div className="space-y-2">
              {lugares.map(lugar => {
                const isDiscovered = discoveredPlaces.includes(lugar.id);
                return (
                  <div key={lugar.id} className={`p-2 rounded-lg cursor-pointer ${isDiscovered ? 'bg-green-900/50 border border-green-500' : 'bg-gray-800/50'}`} onClick={() => { setShowQuestLog(false); setSelectedLugar(lugar); }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(lugar.tipo)}
                        <span className="text-sm text-white truncate max-w-[150px]">{lugar.nombre}</span>
                      </div>
                      {isDiscovered ? <span className="text-green-400 text-sm">✓</span> : <span className="text-yellow-400 text-sm">⚔️</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAPBOX */}
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
            <div className="relative cursor-pointer">
              <div 
                className="rounded-full border-3 border-white shadow-lg flex items-center justify-center animate-bounce"
                style={{
                  width: isMobile ? 40 : 50,
                  height: isMobile ? 40 : 50,
                  background: `linear-gradient(135deg, ${playerLevel >= 5 ? '#F44336' : playerLevel >= 3 ? '#9C27B0' : '#4CAF50'}, ${playerLevel >= 5 ? '#D32F2F' : playerLevel >= 3 ? '#7B1FA2' : '#45a049'})`,
                  boxShadow: `0 0 20px ${playerLevel >= 5 ? '#F44336' : playerLevel >= 3 ? '#9C27B0' : '#4CAF50'}`
                }}
              >
                <span className="text-2xl">
                  {playerLevel >= 5 ? '👑' : playerLevel >= 3 ? '⚡' : '🌟'}
                </span>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
                Nv.{playerLevel}
              </div>
            </div>
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

      {/* Brújula */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute bottom-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full border-2 border-yellow-500 flex items-center justify-center z-[1000]">
        <Compass className="text-yellow-400 w-6 h-6" />
      </motion.div>

      {/* Botón de ubicación */}
      {userPosition && (
        <button
          onClick={() => setViewState({ longitude: userPosition.lng, latitude: userPosition.lat, zoom: 16 })}
          className="absolute bottom-4 left-4 bg-blue-600 rounded-full p-3 z-[1000] shadow-lg border-2 border-white hover:bg-blue-700 transition"
        >
          <Navigation className="text-white w-5 h-5" />
        </button>
      )}
      {/* Modal para anclar guardián */}
      {mostrarAnclar && (
        <AnclarGuardian
          userPosition={userPosition}
          onClose={() => setMostrarAnclar(false)}
          onAnclado={() => {
            setMostrarAnclar(false);
            // Recargar guardianes cercanos si quieres
          }}
        />
      )}

      {/* Modal para responder evento */}
      {eventoSeleccionado && (
          <div className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                  <h3 className="text-xl font-bold mb-4">🎯 {eventoSeleccionado.titulo}</h3>
                  <p className="text-gray-700 mb-4">{eventoSeleccionado.pregunta}</p>
                  <input
                      type="text"
                      value={respuestaEvento}
                      onChange={(e) => setRespuestaEvento(e.target.value)}
                      placeholder="Tu respuesta..."
                      className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                      onKeyPress={(e) => e.key === 'Enter' && handleCompletarEvento(eventoSeleccionado.id, respuestaEvento)}
                  />
                  <div className="flex gap-3">
                      <button
                          onClick={() => handleCompletarEvento(eventoSeleccionado.id, respuestaEvento)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold"
                      >
                          Responder
                      </button>
                      <button
                          onClick={() => setEventoSeleccionado(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold"
                      >
                          Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default Mapa;