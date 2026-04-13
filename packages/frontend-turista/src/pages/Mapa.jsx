// pages/Mapa.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, MapPin, Users, Landmark, TreePine, Utensils, 
  Menu, X, Navigation, Award, Target, Radio, LocateFixed,
  Star, Zap, Crown, Shield, Sparkles
} from 'lucide-react';
import api from '../services/api';
import CompaneroVirtual from '../components/CompaneroVirtual';
import GaleriaFotos from '../components/GaleriaFotos';

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// Almacenamiento local para lugares visitados
const STORAGE_KEY = 'concepcion_descubiertos';
const VISIT_RADIUS = 50; // metros para considerar un lugar como visitado

// Crear iconos personalizados
const createGameIcon = (tipo, isSelected = false, isVisited = false) => {
  const colors = {
    historico: '#FF6B6B',
    natural: '#4ECDC4',
    cultural: '#45B7D1',
    gastronomico: '#FFA07A',
    evento: '#9B59B6'
  };

  const icons = {
    historico: '🏛️',
    natural: '🌲',
    cultural: '🎭',
    gastronomico: '🍽️',
    evento: '🎉'
  };

  const color = colors[tipo] || '#95A5A6';
  const icon = icons[tipo] || '📍';
  const isMobile = window.innerWidth < 640;

  // Icono diferente si ya fue visitado
  const opacity = isVisited ? '0.8' : '1';
  const glowColor = isVisited ? 'gold' : color;

  

  return L.divIcon({
    className: `game-marker ${isVisited ? 'visited' : ''}`,
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''}" style="
        transform: translate(-50%, -100%);
        animation: ${isSelected ? 'bounce 0.5s' : isVisited ? 'float-visited 4s infinite ease-in-out' : 'float 3s infinite ease-in-out'};
        opacity: ${opacity};
      ">
        <div class="marker-pin" style="
          background: ${color};
          width: ${isMobile ? '35px' : '50px'};
          height: ${isMobile ? '35px' : '50px'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 15px ${glowColor}80;
          display: flex;
          align-items: center;
          justify-content: center;
          border: ${isMobile ? '2px' : '3px'} solid ${isVisited ? 'gold' : 'white'};
          transition: all 0.3s ease;
          ${isVisited ? 'filter: drop-shadow(0 0 10px gold);' : ''}
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isMobile ? '18px' : '24px'};
            filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
          ">${icon}</span>
        </div>
        ${isVisited ? `
          <div class="visited-check" style="
            position: absolute;
            top: -5px;
            right: -5px;
            background: gold;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            border: 2px solid white;
            transform: rotate(45deg);
          ">✓</div>
        ` : ''}
      </div>
    `,
    iconSize: isMobile ? [35, 35] : [50, 50],
    iconAnchor: isMobile ? [17, 35] : [25, 50],
    popupAnchor: isMobile ? [0, -35] : [0, -50]
  });
};

// Crear icono especial para el lugar secreto (más grande y brillante)
const createSpecialIcon = () => {
  const isMobile = window.innerWidth < 640;
  
  return L.divIcon({
    className: 'special-marker',
    html: `
      <div class="marker-container" style="
        transform: translate(-50%, -100%);
        animation: special-float 2s infinite ease-in-out;
      ">
        <div class="marker-pin" style="
          background: linear-gradient(135deg, #FFD700, #FFA500);
          width: ${isMobile ? '55px' : '75px'};
          height: ${isMobile ? '55px' : '75px'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 30px rgba(255,215,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border: ${isMobile ? '3px' : '4px'} solid white;
          transition: all 0.3s ease;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isMobile ? '28px' : '36px'};
            filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
          ">👑</span>
        </div>
        <div class="special-particles" style="
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: special-pulse 2s infinite;
          pointer-events: none;
        "></div>
      </div>
    `,
    iconSize: isMobile ? [55, 55] : [75, 75],
    iconAnchor: isMobile ? [27, 55] : [37, 75],
    popupAnchor: isMobile ? [0, -55] : [0, -75]
  });
};

// Icono para guardianes
const createGuardianIcon = () => {
  const isMobile = window.innerWidth < 640;
  return L.divIcon({
    className: 'guardian-marker',
    html: `
      <div style="
        width: ${isMobile ? '40px' : '50px'};
        height: ${isMobile ? '40px' : '50px'};
        background: linear-gradient(135deg, #6B21A5, #9333EA);
        border-radius: 50%;
        border: 3px solid #FFD700;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
        animation: pulse 2s infinite;
      ">
        <span style="font-size: ${isMobile ? '20px' : '28px'}">🛡️</span>
      </div>
    `,
    iconSize: isMobile ? [40, 40] : [50, 50],
    iconAnchor: isMobile ? [20, 20] : [25, 25]
  });
};

// Función para obtener el avatar según el nivel
const getPlayerAvatar = (level, isMobile) => {
  const avatars = {
    1: {
      body: 'linear-gradient(135deg, #4CAF50, #45a049)',
      eyes: 'black',
      accessory: '',
      shadow: '0 0 30px #4CAF50',
      animation: 'bob 3s infinite ease-in-out'
    },
    2: {
      body: 'linear-gradient(135deg, #2196F3, #1976D2)',
      eyes: 'white',
      accessory: '<div style="position:absolute; top:-5px; right:-5px; background:gold; border-radius:50%; width:15px; height:15px; display:flex; align-items:center; justify-content:center; font-size:10px;">⭐</div>',
      shadow: '0 0 30px #2196F3',
      animation: 'bob 3s infinite ease-in-out, glow 2s infinite'
    },
    3: {
      body: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
      eyes: 'gold',
      accessory: '<div style="position:absolute; top:-8px; right:-8px; background:linear-gradient(135deg, gold, orange); border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid white;">👑</div>',
      shadow: '0 0 40px #9C27B0',
      animation: 'bob 3s infinite ease-in-out, glow 2s infinite, rotate 10s infinite'
    },
    4: {
      body: 'linear-gradient(135deg, #FF5722, #E64A19)',
      eyes: 'white',
      accessory: '<div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, #FFD700, #FFA500); border-radius:20px; padding:2px 8px; font-size:10px; color:black; font-weight:bold; border:1px solid white;">MASTER</div>',
      shadow: '0 0 50px #FF5722',
      animation: 'bob 3s infinite ease-in-out, glow 3s infinite, spin 20s infinite'
    },
    5: {
      body: 'linear-gradient(135deg, #F44336, #D32F2F)',
      eyes: 'gold',
      accessory: '<div style="position:absolute; top:-15px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg, gold, orange, red); border-radius:30px; padding:4px 12px; font-size:12px; color:white; font-weight:bold; border:2px solid white; white-space:nowrap;">🌟 LEGEND 🌟</div>',
      shadow: '0 0 60px #F44336',
      animation: 'bob 3s infinite ease-in-out, glow 4s infinite, spin 15s infinite'
    }
  };

  const avatar = avatars[level] || avatars[1];
  
  return `
    <div style="position:relative; animation: ${avatar.animation};">
      <!-- Accesorio superior -->
      ${avatar.accessory}
      
      <!-- Cuerpo principal -->
      <div style="
        width: ${isMobile ? '36px' : '48px'};
        height: ${isMobile ? '36px' : '48px'};
        background: ${avatar.body};
        border-radius: 50%;
        border: ${isMobile ? '2px' : '3px'} solid white;
        box-shadow: ${avatar.shadow};
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transform-origin: center;
      ">
        <!-- Cara -->
        <div style="
          width: ${isMobile ? '20px' : '28px'};
          height: ${isMobile ? '20px' : '28px'};
          background: white;
          border-radius: 50%;
          position: relative;
        ">
          <!-- Ojos -->
          <div style="
            position: absolute;
            top: ${isMobile ? '5px' : '7px'};
            left: ${isMobile ? '4px' : '6px'};
            width: ${isMobile ? '3px' : '4px'};
            height: ${isMobile ? '3px' : '4px'};
            background: ${avatar.eyes};
            border-radius: 50%;
          "></div>
          <div style="
            position: absolute;
            top: ${isMobile ? '5px' : '7px'};
            right: ${isMobile ? '4px' : '6px'};
            width: ${isMobile ? '3px' : '4px'};
            height: ${isMobile ? '3px' : '4px'};
            background: ${avatar.eyes};
            border-radius: 50%;
          "></div>
          <!-- Sonrisa (cambia según nivel) -->
          <div style="
            position: absolute;
            bottom: ${isMobile ? '4px' : '6px'};
            left: ${isMobile ? '6px' : '8px'};
            width: ${isMobile ? '8px' : '12px'};
            height: ${level > 2 ? (isMobile ? '4px' : '6px') : (isMobile ? '3px' : '4px')};
            background: black;
            border-radius: ${level > 2 ? '10px 10px 10px 10px' : '0 0 10px 10px'};
            ${level > 3 ? 'transform: scale(1.2);' : ''}
          "></div>
          
          <!-- Mejillas (nivel 3+) -->
          ${level >= 3 ? `
            <div style="
              position: absolute;
              bottom: ${isMobile ? '8px' : '10px'};
              left: 0;
              width: ${isMobile ? '3px' : '4px'};
              height: ${isMobile ? '3px' : '4px'};
              background: pink;
              border-radius: 50%;
            "></div>
            <div style="
              position: absolute;
              bottom: ${isMobile ? '8px' : '10px'};
              right: 0;
              width: ${isMobile ? '3px' : '4px'};
              height: ${isMobile ? '3px' : '4px'};
              background: pink;
              border-radius: 50%;
            "></div>
          ` : ''}
        </div>
      </div>
      
      <!-- Indicador de nivel -->
      <div style="
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: ${level > 3 ? 'gold' : 'white'};
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 11px;
        white-space: nowrap;
        backdrop-filter: blur(5px);
        border: 1px solid ${level > 3 ? 'gold' : '#4CAF50'};
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        ${level >= 5 ? '👑' : level >= 3 ? '⚡' : '🌟'} Nv. ${level}
      </div>
    </div>
  `;
};

// Componente para la ubicación del jugador con avatar animado
function PlayerLocation({ onLocationFound, onLocationError, shouldLocate, playerLevel }) {
  const map = useMap();
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const locationFoundRef = useRef(false);

  useEffect(() => {
    if (!map || !shouldLocate || locationFoundRef.current) return;

    map.locate({ 
      setView: false,
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 20000,
      watch: false
    });

    const handleLocationFound = (e) => {
      locationFoundRef.current = true;
      onLocationFound(e.latlng);

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
      }

      const isMobile = window.innerWidth < 640;

      const accuracyCircle = L.circle(e.latlng, {
        radius: e.accuracy || 50,
        color: '#4CAF50',
        weight: 1,
        opacity: 0.3,
        fillColor: '#4CAF50',
        fillOpacity: 0.1,
        interactive: false
      }).addTo(map);
      accuracyCircleRef.current = accuracyCircle;

      const playerIcon = L.divIcon({
        className: 'player-marker-static',
        html: getPlayerAvatar(playerLevel, isMobile),
        iconSize: isMobile ? [36, 70] : [48, 80],
        iconAnchor: isMobile ? [18, 35] : [24, 40]
      });

      const marker = L.marker(e.latlng, { 
        icon: playerIcon,
        zIndexOffset: 1000,
        interactive: false
      }).addTo(map);
      
      markerRef.current = marker;
      map.stopLocate();
    };

    const handleLocationError = (e) => {
      console.warn('Error de ubicación:', e.message);
      locationFoundRef.current = true;
      onLocationError(e.message);
      map.stopLocate();
    };

    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);

    return () => {
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
      map.stopLocate();
    };
  }, [map, shouldLocate, playerLevel]);

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
      }
    };
  }, []);

  return null;
}

// Componente para verificar proximidad a lugares
function ProximityChecker({ userPosition, lugares, onPlaceVisited }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || !lugares.length) return;

    lugares.forEach(lugar => {
      const lugarLatLng = L.latLng(parseFloat(lugar.latitud), parseFloat(lugar.longitud));
      const distance = userPosition.distanceTo(lugarLatLng);
      
      if (distance <= VISIT_RADIUS) {
        onPlaceVisited(lugar);
      }
    });
  }, [userPosition, lugares, onPlaceVisited]);

  return null;
}

// Componente para efectos de mapa
function DynamicMapEffects() {
  const map = useMap();
  
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const container = map.getContainer();
    container.style.position = 'relative';
    
    const particlesContainer = document.createElement('div');
    particlesContainer.style.position = 'absolute';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '1000';
    particlesContainer.className = 'particles-container';
    
    container.appendChild(particlesContainer);
    
    const particleCount = isMobile ? 8 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = (Math.random() * 3 + 1) + 'px';
      particle.style.height = particle.style.width;
      particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
      particle.style.borderRadius = '50%';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animation = `float-particle ${Math.random() * 15 + 15}s infinite linear`;
      particle.style.opacity = Math.random() * 0.3;
      particlesContainer.appendChild(particle);
    }
    
    return () => {
      container.removeChild(particlesContainer);
    };
  }, [map]);
  
  return null;
}

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
  const mapRef = useRef(null);
  const [mensajeGuia, setMensajeGuia] = useState('');
  const [tipoGuia, setTipoGuia] = useState('normal');
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [sistemaExp, setSistemaExp] = useState({
    expRequerida: [],
    expAcumulada: [],
    expBase: 10
  });
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [lugarEspecial, setLugarEspecial] = useState(null);
  const [lugarEspecialDesbloqueado, setLugarEspecialDesbloqueado] = useState(false);
  const [guardianesCercanos, setGuardianesCercanos] = useState([]);
  const [mostrarAnclar, setMostrarAnclar] = useState(false);

  const mostrarMensajeGuia = (mensaje, tipo = 'normal', duracion = 5000) => {
    setMensajeGuia(mensaje);
    setTipoGuia(tipo);
    setMostrarGuia(true);
    
    setTimeout(() => setMostrarGuia(false), duracion);
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

  const cargarGuardianesCercanos = async () => {
    if (!userPosition) return;
    
    try {
      const response = await api.get('/guardianes/cercanos', {
        params: { lat: userPosition.lat, lng: userPosition.lng }
      });
      setGuardianesCercanos(response.data.guardianes || []);
    } catch (error) {
      console.error('Error al cargar guardianes:', error);
    }
  };

  const calcularSistemaExp = (totalLugares) => {
    const pesosPorNivel = [1, 1.5, 2, 2.5, 3];
    const sumaPesos = pesosPorNivel.reduce((a, b) => a + b, 0);
    const expBase = 10;
    
    const expRequerida = pesosPorNivel.map(peso => 
      Math.round((peso / sumaPesos) * totalLugares * expBase)
    );
    
    const expAcumulada = [];
    expRequerida.reduce((acc, curr, i) => {
      expAcumulada[i] = acc + curr;
      return expAcumulada[i];
    }, 0);
    
    return { expRequerida, expAcumulada, expBase };
  };

  const calcularNivelPorXP = (xpActual, expAcumulada) => {
    for (let i = 0; i < expAcumulada.length; i++) {
      if (xpActual < expAcumulada[i]) {
        return i + 1;
      }
    }
    return expAcumulada.length + 1;
  };

  // Verificar si el nivel 5 está desbloqueado
  useEffect(() => {
    if (playerLevel >= 5) {
      setLugarEspecialDesbloqueado(true);
    }
  }, [playerLevel]);

  useEffect(() => {
    if (!loading && lugares.length > 0) {
      mostrarMensajeGuia(
        '¡Bienvenido a Concepción! Soy tu guía virtual. Explora el mapa y descubre lugares increíbles.',
        'bienvenida',
        6000
      );
      cargarLugarEspecial();
    }
  }, [loading]);

  useEffect(() => {
    if (locationPermission === 'granted' && userPosition) {
      mostrarMensajeGuia(
        '¡Excelente! Ya veo tu ubicación. Muévete para descubrir lugares automáticamente.',
        'consejo',
        5000
      );
    }
  }, [locationPermission, userPosition]);

  useEffect(() => {
    if (userPosition) {
      cargarGuardianesCercanos();
    }
  }, [userPosition]);

  useEffect(() => {
    if (lastVisitedPlace) {
      const mensajesDescubrimiento = [
        `¡Has descubierto ${lastVisitedPlace.nombre}! +${sistemaExp.expBase} XP`,
        `¡Increíble! ${lastVisitedPlace.nombre} es un lugar especial.`,
        `¡Bien hecho! Has añadido ${lastVisitedPlace.nombre} a tu colección.`,
      ];
      mostrarMensajeGuia(
        mensajesDescubrimiento[Math.floor(Math.random() * mensajesDescubrimiento.length)],
        'descubrimiento',
        4000
      );
    }
  }, [lastVisitedPlace]);

  useEffect(() => {
    if (playerLevel > 1 && discoveredPlaces.length > 0) {
      const mensajesNivel = [
        `¡Felicidades! Has alcanzado el nivel ${playerLevel}!`,
        `¡Nivel ${playerLevel}! Sigue así, gran explorador.`,
        `¡Subiste de nivel! Ahora eres nivel ${playerLevel}.`,
      ];
      mostrarMensajeGuia(
        mensajesNivel[Math.floor(Math.random() * mensajesNivel.length)],
        'nivel',
        5000
      );
    }
  }, [playerLevel]);

  useEffect(() => {
    if (userPosition && lugares.length > 0) {
      const lugaresCerca = lugares.filter(lugar => {
        const distancia = userPosition.distanceTo(L.latLng(lugar.latitud, lugar.longitud));
        return distancia < 200 && !discoveredPlaces.includes(lugar.id);
      });
      
      if (lugaresCerca.length > 0 && !lastVisitedPlace) {
        mostrarMensajeGuia(
          `¡Hay ${lugaresCerca.length} lugar${lugaresCerca.length > 1 ? 'es' : ''} cerca por descubrir!`,
          'cerca',
          4000
        );
      }
    }
  }, [userPosition, lugares]);

  useEffect(() => {
    const consejos = [
      'Los marcadores dorados son lugares que ya descubriste.',
      'Puedes ver tu progreso en el panel de misiones.',
      'Mantente cerca de los lugares para descubrirlos automáticamente.',
      `Cada lugar descubierto te da ${sistemaExp.expBase} XP.`,
      'El sistema de niveles se adapta a la cantidad total de lugares.',
      'El avatar cambia de forma según tu nivel.',
      'Usa el botón azul para volver a tu ubicación.',
      'Explora Concepción, hay muchos secretos por descubrir.',
    ];

    const intervalo = setInterval(() => {
      if (!lastVisitedPlace && !showQuestLog) {
        mostrarMensajeGuia(
          consejos[Math.floor(Math.random() * consejos.length)],
          'consejo',
          4000
        );
      }
    }, 30000);

    return () => clearInterval(intervalo);
  }, [lastVisitedPlace, showQuestLog, sistemaExp]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
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
        if (navigator.permissions && navigator.permissions.query) {
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
      if (savedXp) {
        setXp(parseInt(savedXp));
      }
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
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(-45deg); }
        50% { transform: translateY(-5px) rotate(-45deg); }
      }
      
      @keyframes float-visited {
        0%, 100% { transform: translateY(0) rotate(-45deg); filter: drop-shadow(0 0 5px gold); }
        50% { transform: translateY(-3px) rotate(-45deg); filter: drop-shadow(0 0 15px gold); }
      }
      
      @keyframes bounce {
        0%, 100% { transform: scale(1) rotate(-45deg); }
        50% { transform: scale(1.1) rotate(-45deg); }
      }
      
      @keyframes special-float {
        0%, 100% { transform: translateY(0) rotate(-45deg); }
        50% { transform: translateY(-10px) rotate(-45deg); }
      }
      
      @keyframes special-pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.3); opacity: 0.8; }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      
      @keyframes bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes float-particle {
        0% { transform: translateY(0) translateX(0); }
        100% { transform: translateY(-100vh) translateX(50px); }
      }
      
      .game-marker {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .game-marker:hover .marker-pin {
        transform: rotate(-45deg) scale(1.05);
        filter: brightness(1.2);
      }
      
      .game-marker.visited .marker-pin {
        animation: float-visited 4s infinite ease-in-out;
      }
      
      .special-marker {
        cursor: pointer;
        z-index: 1000;
      }
      
      .special-marker:hover .marker-pin {
        transform: rotate(-45deg) scale(1.1);
      }
      
      .leaflet-popup-content-wrapper {
        background: rgba(20, 20, 30, 0.98);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255,215,0,0.3);
        border-radius: 12px;
        color: white;
        font-family: 'Arial Rounded', sans-serif;
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        max-width: ${isMobile ? '250px' : '300px'};
      }
      
      .quest-log {
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        border: 2px solid #4CAF50;
        border-radius: 15px;
        color: white;
        animation: slideIn 0.3s ease;
        max-height: ${isMobile ? '70vh' : '80vh'};
        overflow-y: auto;
        width: ${isMobile ? '280px' : '320px'};
      }
      
      .location-prompt {
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        border: 2px solid #4CAF50;
        border-radius: 20px;
        animation: slideUp 0.5s ease;
        max-width: ${isMobile ? '90%' : '400px'};
      }
      
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      
      .level-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: ${isMobile ? '4px 10px' : '6px 14px'};
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
        font-size: ${isMobile ? '12px' : '14px'};
      }
    `;
    document.head.appendChild(style);
  }, [isMobile]);

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

  const handleLocationFound = (latlng) => {
    setUserPosition(latlng);
    setLocationPermission('granted');
    setShowLocationPrompt(false);
  };

  const handleLocationError = (error) => {
    setLocationPermission('denied');
  };

  const handlePlaceVisited = (lugar) => {
    if (!discoveredPlaces.includes(lugar.id)) {
      setDiscoveredPlaces(prev => [...prev, lugar.id]);
      setLastVisitedPlace(lugar);
      
      setTimeout(() => setLastVisitedPlace(null), 3000);
    }
  };

  const requestLocationPermission = () => {
    setShowLocationPrompt(false);
    setShouldLocate(true);
    setUserResponded(true);
  };

  const declineLocationPermission = () => {
    setShowLocationPrompt(false);
    setLocationPermission('denied');
    setUserResponded(true);
    localStorage.setItem('locationResponse', 'denied');
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} border-4 border-t-transparent border-white rounded-full`}
        />
      </motion.div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* HUD Superior */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 right-0 z-[1000] flex justify-between items-start p-3"
      >
        <div className="flex items-center space-x-2">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="level-badge"
          >
            <span className="text-white flex items-center gap-1">
              {playerLevel >= 5 ? <Crown className="w-4 h-4" /> : 
               playerLevel >= 3 ? <Zap className="w-4 h-4" /> : 
               <Star className="w-4 h-4" />}
              Nv. {playerLevel}
            </span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-green-500"
          >
            <span className="text-green-400 font-bold text-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {discoveredPlaces.length}/{lugares.length}
            </span>
          </motion.div>

          {/* Selector de nivel temporal (para pruebas) */}
          <select 
              value={playerLevel}
              onChange={async (e) => {
                  const nuevoNivel = Number(e.target.value);
                  
                  // Actualizar estado local
                  setPlayerLevel(nuevoNivel);
                  
                  // Actualizar nivel en localStorage y backend
                  const { actualizarNivelTurista } = await import('../services/auth');
                  await actualizarNivelTurista(nuevoNivel);
                  
                  // Mostrar mensaje de confirmación
                  mostrarMensajeGuia(
                      `¡Nivel cambiado a ${nuevoNivel}! Ahora puedes ${nuevoNivel >= 5 ? 'subir fotos' : 'seguir explorando para llegar a nivel 5'}.`,
                      'consejo',
                      3000
                  );
                  
                  // Recargar la página para asegurar que el token se actualice
                  // setTimeout(() => window.location.reload(), 1000);
              }}
              className="bg-black/50 text-white rounded-lg px-2 py-1 text-sm border border-yellow-500"
          >
              <option value={1}>Nv1 🐣</option>
              <option value={2}>Nv2 ✨</option>
              <option value={3}>Nv3 ⭐</option>
              <option value={4}>Nv4 ⚡</option>
              <option value={5}>Nv5 👑</option>
          </select>
          {/* Indicador de nivel real (backend) */}
          <div className="bg-blue-600/50 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400">
            <span className="text-blue-300 font-bold text-xs flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Nivel real: {playerLevel}
            </span>
          </div>

          {/* Barra de XP dinámica */}
          <motion.div 
            className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-400" />
              <div className="flex flex-col">
                <span className="text-purple-400 font-bold text-xs">
                  {xp} / {sistemaExp.expAcumulada[playerLevel - 1] || 0} XP
                </span>
                <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-400"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((xp - (sistemaExp.expAcumulada[playerLevel - 2] || 0)) / 
                              (sistemaExp.expRequerida[playerLevel - 1] || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Botón para abrir galería (solo nivel 5) */}
          {playerLevel >= 5 && lugarEspecial && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMostrarGaleria(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 backdrop-blur-sm rounded-full p-2 border border-yellow-400 shadow-lg"
              title="Galería de Exploradores"
            >
              <Award className="text-white w-5 h-5" />
            </motion.button>
          )}

          {/* Botón para anclar guardián (solo si completó todos los lugares) */}
          {discoveredPlaces.length === lugares.length && lugares.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMostrarAnclar(true)}
              className="bg-purple-600 hover:bg-purple-700 backdrop-blur-sm rounded-full p-2 border border-purple-400 shadow-lg"
              title="Anclar Guardián"
            >
              🛡️
            </motion.button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQuestLog(!showQuestLog)}
          className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-yellow-500"
        >
          {showQuestLog ? 
            <X className="text-red-400 w-5 h-5" /> : 
            <Menu className="text-green-400 w-5 h-5" />
          }
        </motion.button>
      </motion.div>

      {/* Compañero Virtual */}
      <CompaneroVirtual 
        mensaje={mensajeGuia}
        nivel={playerLevel}
        emocion={
          lastVisitedPlace ? 'celebrando' : 
          locationPermission === 'granted' ? 'feliz' : 
          'pensativo'
        }
      />

      {/* Galería de Fotos */}
      {mostrarGaleria && (
        <GaleriaFotos 
          nivelUsuario={playerLevel}
          onCerrar={() => setMostrarGaleria(false)}
        />
      )}

      {/* Prompt de permiso de ubicación */}
      <AnimatePresence>
        {showLocationPrompt && !userResponded && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-[2000] 
                       bg-black/90 backdrop-blur-sm rounded-lg p-4 border-2 border-green-500
                       shadow-2xl"
            style={{ width: isMobile ? '90%' : '400px' }}
          >
            <div className="text-center">
              <LocateFixed className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">¿Activamos tu ubicación?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Necesitamos tu ubicación para mostrarte en el mapa y 
                descubrir lugares automáticamente cuando estés cerca.
              </p>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={requestLocationPermission}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-bold
                           hover:bg-green-700 transition-colors"
                >
                  Activar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={declineLocationPermission}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-bold
                           hover:bg-gray-700 transition-colors"
                >
                  Ahora no
                </motion.button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Puedes cambiar esto en cualquier momento desde la configuración del navegador
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje cuando la ubicación está desactivada */}
      <AnimatePresence>
        {locationPermission === 'denied' && userResponded && !showLocationPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.8, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[2000] 
                       bg-red-600/80 backdrop-blur-sm rounded-full px-4 py-2
                       border border-white text-sm"
          >
            <span className="text-white flex items-center gap-2">
              <LocateFixed className="w-4 h-4" />
              Ubicación desactivada
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación de lugar descubierto */}
      <AnimatePresence>
        {lastVisitedPlace && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-20 left-4 z-[2000] bg-green-600/90 backdrop-blur-sm 
                       rounded-lg p-3 border-2 border-yellow-400"
          >
            <div className="flex items-center space-x-2">
              <Target className="text-yellow-400 w-5 h-5" />
              <div>
                <p className="text-white font-bold">¡Lugar descubierto!</p>
                <p className="text-white text-sm">{lastVisitedPlace.nombre}</p>
                <p className="text-yellow-300 text-xs">+{sistemaExp.expBase} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Log */}
      <AnimatePresence>
        {showQuestLog && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className={`absolute ${isMobile ? 'top-16' : 'top-20'} right-3 z-[1000] quest-log p-3`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-yellow-400 flex items-center gap-2`}>
                <Radio className="w-5 h-5" />
                Descubrimientos
              </h3>
              <span className="text-sm text-gray-400">
                {discoveredPlaces.length}/{lugares.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {lugares.map(lugar => {
                const isDiscovered = discoveredPlaces.includes(lugar.id);
                return (
                  <motion.div
                    key={lugar.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2 rounded-lg cursor-pointer ${
                      isDiscovered 
                        ? 'bg-green-900/50 border border-green-500' 
                        : 'bg-gray-800/50'
                    }`}
                    onClick={() => {
                      setShowQuestLog(false);
                      setSelectedLugar(lugar);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(lugar.tipo)}
                        <span className={`${isMobile ? 'text-sm' : 'text-base'} text-white truncate max-w-[150px]`}>
                          {lugar.nombre}
                        </span>
                      </div>
                      {isDiscovered ? (
                        <span className="text-green-400 text-sm">✓</span>
                      ) : (
                        <span className="text-yellow-400 text-sm">
                          {userPosition ? `${Math.round(userPosition.distanceTo(L.latLng(lugar.latitud, lugar.longitud)))}m` : '???'}
                        </span>
                      )}
                    </div>
                    {!isDiscovered && userPosition && (
                      <div className="mt-1 text-xs text-gray-400">
                        A {Math.round(userPosition.distanceTo(L.latLng(lugar.latitud, lugar.longitud)))}m de ti
                      </div>
                    )}
                    {isDiscovered && (
                      <div className="mt-1 text-xs text-green-400">
                        +{sistemaExp.expBase} XP · {Math.round(userPosition?.distanceTo(L.latLng(lugar.latitud, lugar.longitud)))}m
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa */}
      <MapContainer
        ref={mapRef}
        center={[6.3944, -75.2581]}
        zoom={isMobile ? 13 : 14}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <DynamicMapEffects />
        
        <PlayerLocation 
          onLocationFound={handleLocationFound}
          onLocationError={handleLocationError}
          shouldLocate={shouldLocate}
          playerLevel={playerLevel}
        />
        
        {userPosition && (
          <ProximityChecker 
            userPosition={userPosition}
            lugares={lugares}
            onPlaceVisited={handlePlaceVisited}
          />
        )}

        {/* Marcadores de lugares normales */}
        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            position={[parseFloat(lugar.latitud), parseFloat(lugar.longitud)]}
            icon={createGameIcon(
              lugar.tipo, 
              selectedLugar?.id === lugar.id,
              discoveredPlaces.includes(lugar.id)
            )}
            eventHandlers={{
              click: () => setSelectedLugar(lugar)
            }}
          >
            <Popup>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-2"
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getTipoIcon(lugar.tipo)}
                  <h3 className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {lugar.nombre}
                  </h3>
                </div>
                
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 mb-2`}>
                  {lugar.descripcion}
                </p>

                {userPosition && (
                  <p className="text-xs text-green-400 mb-2">
                    📍 A {Math.round(userPosition.distanceTo(L.latLng(lugar.latitud, lugar.longitud)))}m
                  </p>
                )}
                
                {discoveredPlaces.includes(lugar.id) ? (
                  <p className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    ¡Descubierto! +{sistemaExp.expBase} XP
                  </p>
                ) : (
                  <p className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Por descubrir
                  </p>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate(`/lugar/${lugar.id}`);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-bold
                           hover:bg-green-700 transition-colors"
                >
                  Explorar
                </motion.button>
              </motion.div>
            </Popup>
          </Marker>
        ))}

        {/* Marcador del Lugar Especial - AHORA SIEMPRE VISIBLE */}
        {lugarEspecial && (
          <Marker
            position={[parseFloat(lugarEspecial.latitud), parseFloat(lugarEspecial.longitud)]}
            icon={createSpecialIcon()}
            eventHandlers={{
              click: () => setMostrarGaleria(true)
            }}
          >
            <Popup>
              <div className="p-3 text-center">
                <div className="text-4xl mb-2">👑</div>
                <h3 className="font-bold text-white text-lg">{lugarEspecial.nombre}</h3>
                <p className="text-sm text-gray-300 mt-1">{lugarEspecial.descripcion}</p>
                {playerLevel >= 5 ? (
                  <p className="text-xs text-yellow-400 mt-2 flex items-center justify-center gap-1">
                    <Award className="w-3 h-3" />
                    ¡Desbloqueado! Puedes compartir tus fotos
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    🔒 Desbloquea en nivel 5 para compartir tus fotos
                  </p>
                )}
                <button
                  onClick={() => setMostrarGaleria(true)}
                  className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2 px-3 rounded-lg text-sm font-bold"
                >
                  Ver Galería 📸
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de guardianes cercanos */}
        {guardianesCercanos.map((guardian) => (
          <Marker
            key={`guardian_${guardian.id}`}
            position={[parseFloat(guardian.latitud), parseFloat(guardian.longitud)]}
            icon={createGuardianIcon()}
            eventHandlers={{
              click: () => {
                navigate(`/perfil/${guardian.usuario_id}`);
              }
            }}
          >
            <Popup>
              <div className="p-2 text-center max-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                  {guardian.foto_perfil_url ? (
                    <img src={guardian.foto_perfil_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">🛡️</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800">{guardian.nombre_publico || 'Guardián'}</h3>
                <p className="text-xs text-gray-500">Nivel {guardian.nivel}</p>
                <button
                  onClick={() => navigate(`/perfil/${guardian.usuario_id}`)}
                  className="mt-2 w-full bg-purple-600 text-white py-1 rounded-lg text-sm"
                >
                  Ver perfil
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Brújula */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${isMobile ? 'bottom-32 right-4 w-10 h-10' : 'bottom-36 right-4 w-14 h-14'} 
                   bg-black/50 backdrop-blur-sm rounded-full border-2 border-yellow-500 
                   flex items-center justify-center z-[1000]`}
      >
        <Compass className={`text-yellow-400 ${isMobile ? 'w-5 h-5' : 'w-7 h-7'}`} />
      </motion.div>

      {/* Botón para centrar en ubicación */}
      {userPosition && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo(userPosition, 16, {
                duration: 2
              });
            }
          }}
          className={`absolute ${isMobile ? 'bottom-4 left-4' : 'bottom-4 left-4'} 
                    bg-blue-600 rounded-full p-3 z-[1000] shadow-lg border-2 border-white
                    hover:bg-blue-700 transition-colors`}
        >
          <Navigation className="text-white w-5 h-5" />
        </motion.button>
      )}

      {/* Modal para anclar guardián */}
      {mostrarAnclar && (
        <AnclarGuardian
          userPosition={userPosition}
          onClose={() => setMostrarAnclar(false)}
          onAnclado={() => {
            cargarGuardianesCercanos();
            setMostrarAnclar(false);
          }}
        />
      )}

      {/* PWA Install Prompt */}
      {/* <PWAInstallPrompt /> */}

    </div>
  );
}

export default Mapa;