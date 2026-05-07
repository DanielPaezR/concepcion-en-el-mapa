import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Navigation, Award, LocateFixed,
  Star, Zap, Crown, Sparkles, Menu, X,
  MapPin, Users, Landmark, TreePine, Utensils, User, UserCircle,
} from 'lucide-react';
import api from '../services/api';
import CompaneroVirtual from '../components/CompaneroVirtual';
import AvatarJugador from '../components/AvatarJugador';
import GaleriaFotos from '../components/GaleriaFotos';
import Map3DEffect from '../components/Map3DEffect';
import AnclarGuardian from '../components/AnclarGuardian';
import EstadoReserva from '../components/EstadoReserva';
import MenuExplorador from '../components/MenuExplorador';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const STORAGE_KEY = 'concepcion_descubiertos';
const VISIT_RADIUS = 50;

// ─── Estilos globales ────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');

  .hud-font { font-family: 'Rajdhani', system-ui, sans-serif; }

  .quest-scroll::-webkit-scrollbar { width: 4px; }
  .quest-scroll::-webkit-scrollbar-track { background: transparent; }
  .quest-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.4); border-radius: 4px; }

  /* Popup Mapbox override */
  .mapboxgl-popup-content {
    background: rgba(2,6,18,0.97) !important;
    backdrop-filter: blur(14px) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 16px !important;
    padding: 0 !important;
    box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) !important;
  }
  .mapboxgl-popup-tip { display: none !important; }
  .mapboxgl-popup-close-button {
    color: rgba(255,255,255,0.4) !important;
    font-size: 20px !important;
    top: 10px !important; right: 12px !important;
    background: none !important;
    transition: color .15s !important;
  }
  .mapboxgl-popup-close-button:hover { color: white !important; }

  @keyframes pin-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6), 0 4px 15px rgba(0,0,0,0.35); }
    60%      { box-shadow: 0 0 0 12px rgba(239,68,68,0), 0 4px 15px rgba(0,0,0,0.35); }
  }
  @keyframes pin-glow {
    0%,100% { box-shadow: 0 0 8px 2px rgba(251,191,36,0.5), 0 4px 15px rgba(0,0,0,0.35); }
    50%     { box-shadow: 0 0 20px 7px rgba(251,191,36,0.8), 0 4px 15px rgba(0,0,0,0.35); }
  }
  @keyframes hud-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .pin-undiscovered { animation: pin-pulse 2.2s ease-in-out infinite; }
  .pin-discovered   { animation: pin-glow 2s ease-in-out infinite; }

  /* Botones HUD — glassmorphism refinado */
  .hud-btn {
    display: flex; align-items: center; justify-content: center;
    background: rgba(2,6,18,0.82);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all .18s ease;
    position: relative;
    overflow: hidden;
  }
  .hud-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), transparent);
    pointer-events: none;
  }
  .hud-btn:hover {
    background: rgba(2,6,18,0.92);
    transform: translateY(-1px);
  }
  .hud-btn:active { transform: translateY(0); }

  .hud-btn-gold {
    border-color: rgba(251,191,36,0.4);
    box-shadow: 0 0 12px rgba(251,191,36,0.12), 0 2px 8px rgba(0,0,0,0.4);
  }
  .hud-btn-gold:hover {
    border-color: rgba(251,191,36,0.7);
    box-shadow: 0 0 20px rgba(251,191,36,0.25), 0 4px 12px rgba(0,0,0,0.4);
  }
  .hud-btn-danger {
    border-color: rgba(239,68,68,0.5) !important;
    box-shadow: 0 0 14px rgba(239,68,68,0.2), 0 2px 8px rgba(0,0,0,0.4) !important;
  }
  .hud-btn-blue {
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 12px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.4);
  }
  .hud-btn-blue:hover {
    border-color: rgba(59,130,246,0.7);
    box-shadow: 0 0 20px rgba(59,130,246,0.3), 0 4px 12px rgba(0,0,0,0.4);
  }

  /* Badge nivel — bordes más vivos */
  .level-badge {
    position: relative; overflow: hidden; border-radius: 12px;
  }
  .level-badge::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
    animation: hud-shimmer 4s linear infinite;
  }
`;

const StyleInjector = () => {
  useEffect(() => {
    const id = 'mapa-global-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id; tag.textContent = GLOBAL_STYLES;
      document.head.appendChild(tag);
    }
  }, []);
  return null;
};

// ============================================================
// COMPONENTES INTERNOS
// ============================================================

// 🧭 Brújula
const BrujulaFuncional = ({ bearing, onRotate }) => {
  const [angle, setAngle] = useState(bearing || 0);
  useEffect(() => setAngle(bearing || 0), [bearing]);

  return (
    <motion.button
      animate={{ rotate: angle }}
      transition={{ duration: 0.3 }}
      onClick={() => onRotate?.(0)}
      title="Orientar al norte"
      className="hud-btn hud-btn-gold"
      style={{
        position: 'absolute', bottom: 88, right: 16,
        width: 46, height: 46, borderRadius: '50%',
        zIndex: 1000,
      }}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
    >
      <Compass color="#fbbf24" size={21} />
    </motion.button>
  );
};

// 🎛️ HUD Superior
const HUDHeader = ({
  playerLevel, discoveredPlaces, totalLugares, xp,
  lugarEspecial, onOpenGaleria, onOpenAnclar,
  onToggleQuestLog, onToggleMenuExplorador, showQuestLog, isMobile, sistemaExp,
  userAvatar,
}) => {
  const xpParaSiguiente = sistemaExp?.expAcumulada?.[playerLevel - 1] ?? 0;
  const xpAnterior = playerLevel > 1 ? (sistemaExp?.expAcumulada?.[playerLevel - 2] ?? 0) : 0;
  const progreso = xpParaSiguiente > 0
    ? Math.min(((xp - xpAnterior) / (xpParaSiguiente - xpAnterior)) * 100, 100)
    : 100;

  const levelColors = {
    1: { from: '#052e16', to: '#14532d', border: '#22c55e', text: '#4ade80', glow: 'rgba(34,197,94,0.3)' },
    2: { from: '#0c1f3f', to: '#1e3a5f', border: '#60a5fa', text: '#93c5fd', glow: 'rgba(96,165,250,0.3)' },
    3: { from: '#1a1040', to: '#312e81', border: '#818cf8', text: '#a5b4fc', glow: 'rgba(129,140,248,0.3)' },
    4: { from: '#1c0900', to: '#451a03', border: '#f59e0b', text: '#fcd34d', glow: 'rgba(245,158,11,0.3)' },
    5: { from: '#1a0505', to: '#450a0a', border: '#ef4444', text: '#fca5a5', glow: 'rgba(239,68,68,0.35)' },
  };
  const lc = levelColors[Math.min(playerLevel, 5)];
  const LevelIcon = playerLevel >= 5 ? Crown : playerLevel >= 3 ? Zap : Star;

  return (
    <motion.div
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
      className="hud-font"
      style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: isMobile ? '10px 10px 0' : '12px 14px 0',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      {/* ── Lado izquierdo ── */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', pointerEvents: 'auto', flexWrap: 'wrap' }}>
        {/* Badge nivel */}
        <div className="level-badge" style={{
          background: `linear-gradient(150deg, ${lc.from}, ${lc.to})`,
          border: `1.5px solid ${lc.border}`,
          boxShadow: `0 0 18px ${lc.glow}, 0 2px 10px rgba(0,0,0,0.5)`,
          padding: isMobile ? '5px 10px 6px' : '5px 13px 7px',
          minWidth: isMobile ? 72 : 84,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <LevelIcon size={11} color={lc.text} />
            <span style={{ color: lc.text, fontWeight: 700, fontSize: isMobile ? 12 : 14, letterSpacing: '.06em' }}>
              NV.{playerLevel}
            </span>
          </div>
          {/* XP bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 3 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${lc.border}99, ${lc.text})`,
                boxShadow: `0 0 6px ${lc.border}`,
              }}
            />
          </div>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '.06em' }}>
            {xp} / {xpParaSiguiente} XP
          </span>
        </div>

        {/* Descubrimientos */}
        <div style={{
          background: 'rgba(2,6,18,0.82)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(34,197,94,0.35)',
          borderRadius: 12,
          padding: isMobile ? '4px 9px' : '5px 11px',
          boxShadow: '0 0 10px rgba(34,197,94,0.1), 0 2px 8px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.04), transparent)',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={10} color="#4ade80" />
            <span style={{ color: '#4ade80', fontWeight: 700, fontSize: isMobile ? 12 : 13 }}>
              {discoveredPlaces.length}
              <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>/{totalLugares}</span>
            </span>
          </div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '.08em', marginTop: 1 }}>
            LUGARES
          </div>
        </div>

        {/* XP badge */}
        <div style={{
          background: 'rgba(2,6,18,0.82)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 12,
          padding: isMobile ? '4px 9px' : '5px 11px',
          boxShadow: '0 0 10px rgba(168,85,247,0.1), 0 2px 8px rgba(0,0,0,0.4)',
          display: isMobile ? 'none' : 'block',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} color="#c084fc" />
            <span style={{ color: '#c084fc', fontWeight: 700, fontSize: 13 }}>{xp}</span>
          </div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '.08em', marginTop: 1 }}>
            XP TOTAL
          </div>
        </div>

        {/* Botón galería especial */}
        {playerLevel >= 5 && lugarEspecial && (
          <motion.button
            whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.94 }}
            onClick={onOpenGaleria}
            className="hud-btn"
            style={{
              background: 'linear-gradient(135deg, #92400e, #78350f)',
              border: '1px solid rgba(245,158,11,0.6)',
              borderRadius: 12,
              padding: isMobile ? '5px 9px' : '6px 11px',
              boxShadow: '0 0 16px rgba(245,158,11,0.3), 0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <Award size={15} color="#fcd34d" />
          </motion.button>
        )}

        {/* Botón anclar guardián */}
        {playerLevel >= 5 && discoveredPlaces.length === totalLugares && (
          <motion.button
            whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.94 }}
            onClick={onOpenAnclar}
            title="Anclar Guardián"
            className="hud-btn"
            style={{
              background: 'linear-gradient(135deg, #2e0764, #1e1b4b)',
              border: '1px solid rgba(168,85,247,0.5)',
              borderRadius: 12,
              padding: isMobile ? '5px 9px' : '6px 11px',
              fontSize: 15,
              boxShadow: '0 0 16px rgba(168,85,247,0.25), 0 2px 8px rgba(0,0,0,0.5)',
            }}
          >🛡️</motion.button>
        )}
      </div>

      {/* ── Lado derecho — botones de navegación ── */}
      <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto', flexShrink: 0 }}>

        {/* Botón Perfil / Menú Explorador - Abre la barra lateral */}
        <motion.button
          onClick={onToggleMenuExplorador}
          whileHover={{ scale: 1.06, y: -1 }}
          whileTap={{ scale: 0.93 }}
          className="hud-btn hud-btn-gold"
          title="Perfil y estadísticas"
          style={{
            width: isMobile ? 40 : 46,
            height: isMobile ? 40 : 46,
            borderRadius: 12,
            flexDirection: 'column',
            gap: 2,
            background: 'rgba(2,6,18,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(251,191,36,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Perfil"
              style={{ 
                width: isMobile ? 26 : 30, 
                height: isMobile ? 26 : 30, 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: '1.5px solid rgba(251,191,36,0.5)' 
              }}
            />
          ) : (
            <>
              <UserCircle size={isMobile ? 18 : 21} color="#fbbf24" />
              {!isMobile && (
                <span style={{ 
                  fontSize: 7, 
                  color: 'rgba(251,191,36,0.7)', 
                  letterSpacing: '.06em', 
                  fontWeight: 700 
                }}>
                  PERFIL
                </span>
              )}
            </>
          )}
        </motion.button>

        {/* Botón Quest Log */}
        <motion.button
          onClick={onToggleQuestLog}
          whileHover={{ scale: 1.06, y: -1 }}
          whileTap={{ scale: 0.93 }}
          className={`hud-btn ${showQuestLog ? 'hud-btn-danger' : 'hud-btn-gold'}`}
          title={showQuestLog ? 'Cerrar descubrimientos' : 'Ver descubrimientos'}
          style={{
            width: isMobile ? 40 : 46,
            height: isMobile ? 40 : 46,
            borderRadius: 12,
            flexDirection: 'column',
            gap: 2,
            background: 'rgba(2,6,18,0.85)',
            backdropFilter: 'blur(10px)',
            border: showQuestLog ? '1.5px solid #ef4444' : '1.5px solid rgba(251,191,36,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {showQuestLog ? (
            <X size={isMobile ? 18 : 20} color="#f87171" />
          ) : (
            <>
              <Menu size={isMobile ? 18 : 20} color="#fbbf24" />
              {!isMobile && (
                <span style={{ 
                  fontSize: 7, 
                  color: 'rgba(251,191,36,0.7)', 
                  letterSpacing: '.06em', 
                  fontWeight: 700 
                }}>
                  MAPA
                </span>
              )}
            </>
          )}
          {/* Indicador de progreso en el botón del quest log */}
          {!showQuestLog && discoveredPlaces.length > 0 && (
            <div style={{
              position: 'absolute', 
              top: -4, 
              right: -4,
              width: 16, 
              height: 16,
              background: discoveredPlaces.length === totalLugares ? '#22c55e' : '#f59e0b',
              borderRadius: '50%',
              border: '2px solid rgba(2,6,18,0.9)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 7, 
              fontWeight: 700, 
              color: 'white',
            }}>
              {discoveredPlaces.length === totalLugares ? '✓' : discoveredPlaces.length}
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// 🗺️ Botón de ubicación
const BotonUbicacion = ({ userPosition, onCenter }) => {
  if (!userPosition) return null;
  return (
    <motion.button
      onClick={onCenter}
      whileHover={{ scale: 1.08, y: -1 }}
      whileTap={{ scale: 0.93 }}
      title="Centrar en mi ubicación"
      className="hud-btn hud-btn-blue"
      style={{
        position: 'absolute', bottom: 88, left: 16,
        width: 46, height: 46, borderRadius: '50%',
        zIndex: 1000,
      }}
    >
      <Navigation size={20} color="#60a5fa" />
    </motion.button>
  );
};

// 📜 Quest Log
const QuestLogPanel = ({ show, lugares, discoveredPlaces, getTipoIcon, onClose, onSelectLugar, isMobile }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ x: '110%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '110%', opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="hud-font quest-scroll"
        style={{
          position: 'absolute',
          top: isMobile ? 62 : 72,
          right: 10,
          zIndex: 1000,
          background: 'rgba(2,6,18,0.97)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 18,
          padding: '14px 12px',
          width: isMobile ? 'calc(100% - 20px)' : 300,
          maxWidth: 300,
          maxHeight: '68vh',
          overflowY: 'auto',
          boxShadow: '0 0 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}>📜</div>
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14, letterSpacing: '.06em' }}>
            DESCUBRIMIENTOS
          </span>
          <div style={{
            marginLeft: 'auto',
            background: discoveredPlaces.length === lugares.length ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${discoveredPlaces.length === lugares.length ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
            borderRadius: 20, padding: '2px 9px',
            fontSize: 10, color: '#4ade80', fontWeight: 700,
          }}>
            {discoveredPlaces.length}/{lugares.length}
          </div>
        </div>

        {/* Barra progreso total */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 10, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: lugares.length > 0 ? `${(discoveredPlaces.length / lugares.length) * 100}%` : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: 4 }}
          />
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {lugares.map((lugar, i) => {
            const found = discoveredPlaces.includes(lugar.id);
            return (
              <motion.div
                key={lugar.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                onClick={() => { onClose(); onSelectLugar(lugar); }}
                style={{
                  padding: '7px 9px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: found ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                  border: found ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all .15s',
                }}
                whileHover={{ background: found ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', x: 2 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ opacity: found ? 1 : 0.4, transition: 'opacity .15s' }}>
                    {getTipoIcon(lugar.tipo)}
                  </span>
                  <span style={{
                    color: found ? '#e2e8f0' : '#4b5563',
                    fontSize: 12, fontWeight: found ? 600 : 400,
                    maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {found ? lugar.nombre : '— Por descubrir —'}
                  </span>
                </div>
                {found
                  ? <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>✓</div>
                  : <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>⚔️</div>
                }
              </motion.div>
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
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 22 }}
        className="hud-font"
        style={{
          position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000,
          background: 'rgba(2,6,18,0.97)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(34,197,94,0.3)', borderRadius: 22,
          padding: '22px 26px', width: '88%', maxWidth: 340,
          boxShadow: '0 0 60px rgba(0,0,0,0.7), 0 0 40px rgba(34,197,94,0.06)',
          textAlign: 'center',
        }}
      >
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ marginBottom: 14 }}>
          <LocateFixed size={44} color="#4ade80" style={{ margin: '0 auto' }} />
        </motion.div>
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 8, letterSpacing: '.04em' }}>
          ¿ACTIVAMOS TU UBICACIÓN?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20, lineHeight: 1.65 }}>
          Necesitamos tu ubicación para descubrir lugares automáticamente cuando estés cerca.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onAccept}
            style={{ flex: 1, background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, border: '1px solid rgba(34,197,94,0.5)', cursor: 'pointer', letterSpacing: '.05em', boxShadow: '0 0 16px rgba(34,197,94,0.2)' }}
          >ACTIVAR</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onDeny}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', padding: '11px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >AHORA NO</motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 🎯 Modal de Evento
const EventoModal = ({ evento, respuesta, setRespuesta, onResponder, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <motion.div
      initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 24 }}
      transition={{ type: 'spring', damping: 22 }}
      className="hud-font"
      style={{ background: 'rgba(2,6,18,0.99)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 24, maxWidth: 380, width: '100%', padding: 26, boxShadow: '0 0 80px rgba(0,0,0,0.8), 0 0 30px rgba(251,191,36,0.05)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #b45309, #78350f)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 12px rgba(245,158,11,0.2)' }}>🎯</div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '.12em', marginBottom: 3 }}>EVENTO DIARIO</div>
          <h3 style={{ color: '#fcd34d', fontWeight: 700, fontSize: 16, margin: 0 }}>{evento.titulo}</h3>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 30, height: 30, color: 'rgba(255,255,255,0.4)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>×</button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 18, lineHeight: 1.65, borderLeft: '2px solid rgba(251,191,36,0.25)', paddingLeft: 12 }}>{evento.pregunta}</p>
      <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Tu respuesta..." onKeyPress={(e) => e.key === 'Enter' && onResponder()}
        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 14, color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onResponder}
          style={{ flex: 1, background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, border: '1px solid rgba(34,197,94,0.4)', cursor: 'pointer', letterSpacing: '.05em', boxShadow: '0 0 16px rgba(34,197,94,0.15)' }}
        >RESPONDER</motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', padding: '12px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
        >CANCELAR</motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// 📍 Pin de lugar en el mapa
const LugarPin = ({ lugar, discovered, isMobile, onClick }) => {
  const TIPO_EMOJI = { historico: '🏛️', natural: '🌲', cultural: '🎭', gastronomico: '🍽️' };
  const size = isMobile ? 36 : 44;
  return (
    <motion.div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.93 }}
      style={{ cursor: 'pointer' }}
    >
      <div
        className={discovered ? 'pin-discovered' : 'pin-undiscovered'}
        style={{
          width: size, height: size,
          background: discovered
            ? 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)'
            : 'linear-gradient(135deg, #f87171, #ef4444, #b91c1c)',
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: `${discovered ? 2.5 : 2}px solid rgba(255,255,255,0.9)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ transform: 'rotate(45deg)', fontSize: isMobile ? 16 : 20 }}>
          {TIPO_EMOJI[lugar.tipo] || '📍'}
        </span>
      </div>
    </motion.div>
  );
};

// 🏆 Popup del lugar
const LugarPopupContent = ({ lugar, discovered, userPosition, onExplorar, calcularDistancia }) => {
  const distance = userPosition ? calcularDistancia(userPosition.lat, userPosition.lng, parseFloat(lugar.latitud), parseFloat(lugar.longitud)) : null;
  const canExplore = distance !== null && distance <= 20;
  const metersToGo = distance ? Math.round(distance) : null;

  const getTipoEmoji = (tipo) => ({ historico: '🏛️', natural: '🌲', cultural: '🎭', gastronomico: '🍽️' }[tipo] || '📍');
  const getTipoFotoEmoji = (tipo) => ({ historico: '🏰', natural: '🏞️', cultural: '🎨', gastronomico: '🍜' }[tipo] || '📸');

  const descripcionCorta = lugar.descripcion?.length > 80
    ? lugar.descripcion.substring(0, 80) + '...'
    : lugar.descripcion || 'Un lugar maravilloso por descubrir en Concepción.';

  return (
    <div style={{ padding: '14px 16px', minWidth: 200, maxWidth: 240 }}>
      {/* Imagen o emoji */}
      <div style={{
        width: '100%', height: 110, borderRadius: 12, marginBottom: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {lugar.imagen_url ? (
          <img src={lugar.imagen_url} alt={lugar.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="font-size:48px">${getTipoFotoEmoji(lugar.tipo)}</span>`; }}
          />
        ) : (
          <span style={{ fontSize: 48 }}>{getTipoFotoEmoji(lugar.tipo)}</span>
        )}
        {discovered && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(34,197,94,0.9)', borderRadius: 20, padding: '2px 8px', fontSize: 9, color: 'white', fontWeight: 700, letterSpacing: '.06em' }}>
            ✓ DESCUBIERTO
          </div>
        )}
      </div>

      {/* Tipo badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 8px', marginBottom: 8, fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {getTipoEmoji(lugar.tipo)} {lugar.tipo}
      </div>

      <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>{lugar.nombre}</h3>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.6, margin: '0 0 10px' }}>{descripcionCorta}</p>

      {/* Tip */}
      <div style={{ background: 'rgba(251,191,36,0.06)', borderLeft: '2px solid rgba(251,191,36,0.35)', padding: '5px 8px', marginBottom: 12, borderRadius: '0 6px 6px 0' }}>
        <span style={{ color: 'rgba(251,191,36,0.8)', fontSize: 9, fontWeight: 600 }}>🔍 Visítanos para conocer toda la historia</span>
      </div>

      {/* Distancia */}
      {!canExplore && distance !== null && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 8px', marginBottom: 10, textAlign: 'center' }}>
          <span style={{ color: '#fca5a5', fontSize: 11, fontWeight: 600 }}>📍 A {metersToGo} metros</span>
        </div>
      )}

      {/* Botón explorar */}
      <motion.button
        whileHover={canExplore ? { scale: 1.03 } : {}} whileTap={canExplore ? { scale: 0.97 } : {}}
        onClick={(e) => { e.stopPropagation(); if (canExplore) onExplorar(); }}
        disabled={!canExplore}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 11, fontWeight: 700, fontSize: 12, cursor: canExplore ? 'pointer' : 'not-allowed', letterSpacing: '.05em',
          background: canExplore ? 'linear-gradient(135deg, #15803d, #14532d)' : 'rgba(255,255,255,0.04)',
          color: canExplore ? 'white' : 'rgba(255,255,255,0.3)',
          border: canExplore ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.07)',
          boxShadow: canExplore ? '0 0 16px rgba(34,197,94,0.15)' : 'none',
        }}
      >
        {canExplore ? '✨ VER DETALLES COMPLETOS' : '🔒 ACÉRCATE MÁS'}
      </motion.button>
      {!canExplore && distance !== null && (
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 8, textAlign: 'center', marginTop: 7, letterSpacing: '.04em' }}>
          NECESITAS ESTAR A MENOS DE 20 METROS
        </p>
      )}
    </div>
  );
};

// ⏳ Loading screen
const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 35%, #0a1a0a, #0a0e1a 60%)', position: 'relative', overflow: 'hidden' }}>
    <motion.div animate={{ y: ['-100%', '200vh'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
      style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.35), transparent)', pointerEvents: 'none' }}
    />
    <div style={{ position: 'relative', marginBottom: 36 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        style={{ width: 84, height: 84, border: '2px solid transparent', borderTopColor: '#22c55e', borderRightColor: 'rgba(34,197,94,0.25)', borderRadius: '50%' }}
      />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 11, border: '1.5px solid transparent', borderTopColor: '#4ade80', borderLeftColor: 'rgba(74,222,128,0.25)', borderRadius: '50%' }}
      />
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}
      >🦆</motion.div>
    </div>
    <div style={{ fontFamily: "'Rajdhani',system-ui", color: '#4ade80', fontWeight: 700, fontSize: 15, letterSpacing: '.2em', marginBottom: 4 }}>CARGANDO MAPA</div>
    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: '.14em', marginBottom: 28 }}>CONCEPCIÓN · ANTIOQUIA</div>
    <div style={{ width: 180, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ height: '100%', background: 'linear-gradient(90deg, #16a34a, #4ade80)', borderRadius: 4, boxShadow: '0 0 8px rgba(74,222,128,0.4)' }}
      />
    </div>
  </div>
);

// ============================================================
// 🎮 COMPONENTE PRINCIPAL
// ============================================================
function Mapa() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLugar, setSelectedLugar] = useState(null);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [mostrarMenuExplorador, setMostrarMenuExplorador] = useState(false);
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
  const [sistemaExp, setSistemaExp] = useState({ expRequerida: [], expAcumulada: [], expBase: 10 });
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [lugarEspecial, setLugarEspecial] = useState(null);
  const [mostrarAnclar, setMostrarAnclar] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [respuestaEvento, setRespuestaEvento] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -75.2592802, latitude: 6.3953494, zoom: 18, pitch: 60, bearing: 15,
  });

  const navigate = useNavigate();
  const mapRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────
  const mostrarMensajeGuia = (mensaje, tipo = 'normal', duracion = 5000) => {
    setMensajeGuia(mensaje); setTipoGuia(tipo);
    setTimeout(() => setMensajeGuia(''), duracion);
  };

  const toggleMenuExplorador = () => setMostrarMenuExplorador(prev => !prev);

  const getTipoIcon = (tipo) => {
    const icons = {
      historico:    <Landmark  size={isMobile ? 14 : 17} color="#94a3b8" />,
      natural:      <TreePine  size={isMobile ? 14 : 17} color="#4ade80" />,
      cultural:     <Users     size={isMobile ? 14 : 17} color="#a78bfa" />,
      gastronomico: <Utensils  size={isMobile ? 14 : 17} color="#fb923c" />,
    };
    return icons[tipo] || <MapPin size={isMobile ? 14 : 17} color="#94a3b8" />;
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3, φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calcularSistemaExp = (totalLugares) => {
    const pesosPorNivel = [1, 1.5, 2, 2.5, 3];
    const sumaPesos = pesosPorNivel.reduce((a, b) => a + b, 0);
    const expBase = 10;
    const expRequerida = pesosPorNivel.map(p => Math.round((p / sumaPesos) * totalLugares * expBase));
    const expAcumulada = [];
    expRequerida.reduce((acc, curr, i) => { expAcumulada[i] = acc + curr; return expAcumulada[i]; }, 0);
    return { expRequerida, expAcumulada, expBase };
  };

  const calcularNivelPorXP = (xpActual, expAcumulada) => {
    for (let i = 0; i < expAcumulada.length; i++) if (xpActual < expAcumulada[i]) return i + 1;
    return expAcumulada.length + 1;
  };

  const cargarFotoPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/auth/perfil');
      if (response.data?.foto_perfil) setUserAvatar(response.data.foto_perfil);
    } catch (error) {
      if (error.response?.status !== 401) console.error('Error cargando foto de perfil:', error);
    }
  };

  const registrarDescubrimiento = async (lugar) => {
    try {
      if (!userPosition) { mostrarMensajeGuia('📍 Activa tu ubicación para explorar lugares', 'pensativo', 3000); return false; }
      const distance = calcularDistancia(userPosition.lat, userPosition.lng, parseFloat(lugar.latitud), parseFloat(lugar.longitud));
      if (distance > 20) { mostrarMensajeGuia(`❌ Debes acercarte más (${Math.round(distance)} m)`, 'pensativo', 3000); return false; }
      if (discoveredPlaces.includes(lugar.id)) { mostrarMensajeGuia(`📖 Ya descubriste ${lugar.nombre}`, 'normal', 2000); return false; }
      const response = await api.post('/descubrimientos/registrar', { lugar_id: lugar.id, latitud: userPosition.lat, longitud: userPosition.lng });
      if (response.data.success) {
        const nuevosDescubiertos = [...discoveredPlaces, lugar.id];
        setDiscoveredPlaces(nuevosDescubiertos);
        setLastVisitedPlace(lugar);
        setTimeout(() => setLastVisitedPlace(null), 3000);
        const nuevaXP = nuevosDescubiertos.length * sistemaExp.expBase;
        setXp(nuevaXP);
        localStorage.setItem('player_xp', nuevaXP);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosDescubiertos));
        if (sistemaExp.expAcumulada.length > 0) {
          const nuevoNivel = Math.min(calcularNivelPorXP(nuevaXP, sistemaExp.expAcumulada), 5);
          if (nuevoNivel > playerLevel) { setPlayerLevel(nuevoNivel); mostrarMensajeGuia(`🎉 ¡SUBISTE AL NIVEL ${nuevoNivel}!`, 'celebrando', 5000); }
        }
        return true;
      }
    } catch (error) {
      mostrarMensajeGuia(error.response?.data?.error || 'Error al registrar descubrimiento', 'error', 3000);
      return false;
    }
  };

  const handleExplorarLugar = async (lugar) => {
    const registrado = await registrarDescubrimiento(lugar);
    if (registrado) { setSelectedLugar(null); navigate(`/lugar/${lugar.id}`); }
  };

  const handleMarkerClick = (lugar) => setSelectedLugar(lugar);

  const cargarLugarEspecial = async () => {
    try {
      const COORDENADAS_PARQUE = { latitud: 6.3953494, longitud: -75.2592802, nombre: '📸 Parque Principal - Rincón de Recuerdos' };
      setLugarEspecial({ id: 'parque_principal_galeria', nombre: COORDENADAS_PARQUE.nombre, latitud: COORDENADAS_PARQUE.latitud, longitud: COORDENADAS_PARQUE.longitud, tipo: 'especial' });
    } catch (e) {
      setLugarEspecial({ id: 'fallback', nombre: '📸 Galería de Recuerdos', latitud: 6.3953494, longitud: -75.2592802, tipo: 'especial' });
    }
  };

  // ── Efectos ─────────────────────────────────────────────
  useEffect(() => { const h = () => setIsMobile(window.innerWidth < 640); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  useEffect(() => { cargarLugarEspecial(); cargarFotoPerfil(); }, []);

  useEffect(() => {
    const handleSessionExpired = (event) => {
      mostrarMensajeGuia(event.detail?.message || 'Tu sesión ha expirado.', 'error', 3000);
      setTimeout(() => navigate('/login'), 2500);
    };
    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, [navigate]);

  useEffect(() => { if (!loading && lugares.length > 0) { mostrarMensajeGuia('¡Bienvenido a Concepción! Explora el mapa y descubre lugares increíbles.', 'bienvenida', 6000); cargarEventos(); } }, [loading]);
  useEffect(() => { if (lastVisitedPlace) mostrarMensajeGuia(`¡Has descubierto ${lastVisitedPlace.nombre}! +${sistemaExp.expBase} XP`, 'descubrimiento', 4000); }, [lastVisitedPlace]);
  useEffect(() => { if (playerLevel > 1 && discoveredPlaces.length > 0) mostrarMensajeGuia(`¡Felicidades! Has alcanzado el nivel ${playerLevel}!`, 'nivel', 5000); }, [playerLevel]);

  useEffect(() => {
    const consejos = ['Los marcadores dorados son lugares que ya descubriste.', 'Cada lugar descubierto te da 10 XP.', 'Tu avatar cambia de aspecto al subir de nivel.', 'Usa el botón azul para volver a tu ubicación.', '¡Los eventos diarios te dan XP extra!'];
    const id = setInterval(() => { if (!lastVisitedPlace && !showQuestLog) mostrarMensajeGuia(consejos[Math.floor(Math.random() * consejos.length)], 'consejo', 4000); }, 30000);
    return () => clearInterval(id);
  }, [lastVisitedPlace, showQuestLog]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setDiscoveredPlaces(parsed); }
      const savedXp = localStorage.getItem('player_xp');
      if (savedXp) setXp(parseInt(savedXp));
    } catch (e) { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  useEffect(() => {
    if (lugares.length > 0) {
      const sistema = calcularSistemaExp(lugares.length);
      setSistemaExp(sistema);
      if (xp > 0) setPlayerLevel(Math.min(calcularNivelPorXP(xp, sistema.expAcumulada), 5));
    }
  }, [lugares]);

  useEffect(() => {
    if (discoveredPlaces.length > 0 && sistemaExp.expBase > 0) {
      const nuevoXP = discoveredPlaces.length * sistemaExp.expBase;
      setXp(nuevoXP);
      localStorage.setItem('player_xp', nuevoXP);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(discoveredPlaces));
      if (sistemaExp.expAcumulada.length > 0) setPlayerLevel(Math.min(calcularNivelPorXP(nuevoXP, sistemaExp.expAcumulada), 5));
    }
  }, [discoveredPlaces, sistemaExp]);

  useEffect(() => {
    const check = async () => {
      const saved = localStorage.getItem('locationResponse');
      if (saved === 'granted') { setShouldLocate(true); setLocationPermission('granted'); setUserResponded(true); return; }
      if (saved === 'denied') { setLocationPermission('denied'); setUserResponded(true); return; }
      if (navigator.permissions?.query) {
        try {
          const r = await navigator.permissions.query({ name: 'geolocation' });
          if (r.state === 'granted') { setShouldLocate(true); setLocationPermission('granted'); setUserResponded(true); localStorage.setItem('locationResponse', 'granted'); }
          else if (r.state === 'denied') { setLocationPermission('denied'); setUserResponded(true); localStorage.setItem('locationResponse', 'denied'); }
          else setTimeout(() => setShowLocationPrompt(true), 1000);
        } catch { setTimeout(() => setShowLocationPrompt(true), 1000); }
      } else { setTimeout(() => setShowLocationPrompt(true), 1000); }
    };
    check();
  }, []);

  useEffect(() => {
    if (!shouldLocate || !navigator.geolocation) return undefined;
    const handlePosition = (pos) => {
      setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, updatedAt: pos.timestamp });
      setLocationPermission('granted');
    };
    const handleError = (error) => {
      if (error.code === error.PERMISSION_DENIED) { setLocationPermission('denied'); localStorage.setItem('locationResponse', 'denied'); }
    };
    const watchId = navigator.geolocation.watchPosition(handlePosition, handleError, { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [shouldLocate]);

  const cargarLugares = async () => {
    try { const r = await api.get('/lugares'); if (r.data?.success && Array.isArray(r.data.data)) setLugares(r.data.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const cargarEventos = async () => {
    try { const r = await api.get('/eventos/activos'); setEventos(r.data.eventos || []); } catch (e) { console.error(e); }
  };

  const handleCompletarEvento = async (eventoId, respuesta) => {
    try {
      const r = await api.post('/eventos/completar', { eventoId, respuesta });
      if (r.data.success) { mostrarMensajeGuia(`🎉 ¡Completaste el reto! +${r.data.xp_ganada} XP`, 'celebrando', 4000); setEventoSeleccionado(null); setRespuestaEvento(''); cargarEventos(); }
    } catch { mostrarMensajeGuia('❌ Respuesta incorrecta. ¡Sigue intentando!', 'pensativo', 3000); }
  };

  useEffect(() => { cargarLugares(); }, []);

  if (loading) return <LoadingScreen />;
  if (!MAPBOX_TOKEN) return (
    <div className="h-screen flex items-center justify-center bg-red-950 p-4">
      <div className="text-center"><h2 className="text-xl font-bold text-red-400">Error de Configuración</h2><p className="text-red-500 text-sm mt-1">No se detectó VITE_MAPBOX_TOKEN</p></div>
    </div>
  );

  return (
    <div className="h-screen relative overflow-hidden">
      <StyleInjector />

      <HUDHeader
        playerLevel={playerLevel}
        discoveredPlaces={discoveredPlaces}
        totalLugares={lugares.length}
        xp={xp}
        sistemaExp={sistemaExp}
        lugarEspecial={lugarEspecial}
        onOpenGaleria={() => setMostrarGaleria(true)}
        onOpenAnclar={() => setMostrarAnclar(true)}
        onToggleQuestLog={() => setShowQuestLog(!showQuestLog)}
        onToggleMenuExplorador={toggleMenuExplorador}
        showQuestLog={showQuestLog}
        isMobile={isMobile}
        userAvatar={userAvatar}
      />

      <BrujulaFuncional bearing={viewState.bearing} onRotate={(b) => setViewState(prev => ({ ...prev, bearing: b }))} />

      <CompaneroVirtual
        mensaje={mensajeGuia} nivel={playerLevel} tipo={tipoGuia}
        emocion={lastVisitedPlace ? 'celebrando' : locationPermission === 'granted' ? 'feliz' : 'pensativo'}
      />

      {mostrarGaleria && <GaleriaFotos nivelUsuario={playerLevel} onCerrar={() => setMostrarGaleria(false)} />}

      <LocationPrompt
        show={showLocationPrompt && !userResponded}
        onAccept={() => { setShowLocationPrompt(false); setShouldLocate(true); setUserResponded(true); localStorage.setItem('locationResponse', 'granted'); }}
        onDeny={() => { setShowLocationPrompt(false); setLocationPermission('denied'); setUserResponded(true); localStorage.setItem('locationResponse', 'denied'); }}
      />

      <QuestLogPanel show={showQuestLog} lugares={lugares} discoveredPlaces={discoveredPlaces} getTipoIcon={getTipoIcon} onClose={() => setShowQuestLog(false)} onSelectLugar={handleMarkerClick} isMobile={isMobile} />

      <MenuExplorador nivel={playerLevel} xp={xp} lugaresDescubiertos={discoveredPlaces.length} totalLugares={lugares.length} fotoPerfil={userAvatar} isOpen={mostrarMenuExplorador} onClose={() => setMostrarMenuExplorador(false)} />

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        onError={(e) => console.log('Mapbox Error:', e)}
        onClick={() => setSelectedLugar(null)}
      >
        <Map3DEffect />
        <NavigationControl position="top-right" />

        {/* Avatar del jugador */}
        {userPosition && (
          <Marker longitude={userPosition.lng} latitude={userPosition.lat}>
            <AvatarJugador level={playerLevel} isMobile={isMobile} />
          </Marker>
        )}

        {/* Lugares */}
        {lugares.map((lugar) => (
          <Marker key={lugar.id} longitude={parseFloat(lugar.longitud)} latitude={parseFloat(lugar.latitud)}
            onClick={(e) => { e.originalEvent.stopPropagation(); handleMarkerClick(lugar); }}
          >
            <LugarPin lugar={lugar} discovered={discoveredPlaces.includes(lugar.id)} isMobile={isMobile} onClick={() => handleMarkerClick(lugar)} />
          </Marker>
        ))}

        {/* Marcador especial galería */}
        {lugarEspecial && (
          <Marker longitude={parseFloat(lugarEspecial.longitud)} latitude={parseFloat(lugarEspecial.latitud)} anchor="bottom" style={{ zIndex: 3000 }}>
            <motion.div
              animate={{ scale: [1, 1.14, 1], y: [0, -7, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => {
                setMostrarGaleria(true);
                mostrarMensajeGuia(
                  playerLevel >= 5 ? '📸 ¡Bienvenido a la Galería de Recuerdos!' : `🔒 Necesitas nivel 5 para subir fotos. ¡Sigue explorando!`,
                  playerLevel >= 5 ? 'celebrando' : 'pensativo', 4000
                );
              }}
              style={{
                width: isMobile ? 60 : 72, height: isMobile ? 60 : 72,
                background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #d97706 100%)',
                borderRadius: '50%', border: '4px solid rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMobile ? 28 : 34,
                boxShadow: '0 0 36px rgba(251,191,36,0.85), 0 8px 24px rgba(0,0,0,0.55)',
                cursor: 'pointer', position: 'relative',
              }}
            >
              <span style={{ fontSize: isMobile ? 28 : 34 }}>📸</span>
              {playerLevel < 5 && (
                <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 18 }}>🔒</span>
              )}
            </motion.div>
          </Marker>
        )}

        {/* Eventos */}
        {eventos.map((evento) => (
          <Marker key={`evento_${evento.id}`} longitude={parseFloat(evento.longitud)} latitude={parseFloat(evento.latitud)} onClick={() => setEventoSeleccionado(evento)}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #b45309, #78350f)', borderRadius: '50%', border: '2px solid rgba(251,191,36,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', boxShadow: '0 0 18px rgba(251,191,36,0.45), 0 4px 12px rgba(0,0,0,0.4)' }}
            >❓</motion.div>
          </Marker>
        ))}

        {/* Popup */}
        {selectedLugar && (
          <Popup longitude={parseFloat(selectedLugar.longitud)} latitude={parseFloat(selectedLugar.latitud)} onClose={() => setSelectedLugar(null)} closeButton={true} closeOnClick={false} anchor="bottom" offset={16}>
            <LugarPopupContent lugar={selectedLugar} discovered={discoveredPlaces.includes(selectedLugar.id)} userPosition={userPosition} onExplorar={() => handleExplorarLugar(selectedLugar)} calcularDistancia={calcularDistancia} />
          </Popup>
        )}
      </Map>

      <BotonUbicacion userPosition={userPosition} onCenter={() => userPosition && setViewState(prev => ({ ...prev, longitude: userPosition.lng, latitude: userPosition.lat, zoom: 16 }))} />

      {mostrarAnclar && <AnclarGuardian userPosition={userPosition} onClose={() => setMostrarAnclar(false)} onAnclado={() => setMostrarAnclar(false)} />}

      <AnimatePresence>
        {eventoSeleccionado && (
          <EventoModal evento={eventoSeleccionado} respuesta={respuestaEvento} setRespuesta={setRespuestaEvento} onResponder={() => handleCompletarEvento(eventoSeleccionado.id, respuestaEvento)} onClose={() => setEventoSeleccionado(null)} />
        )}
      </AnimatePresence>

      <EstadoReserva />
    </div>
  );
}

export default Mapa;