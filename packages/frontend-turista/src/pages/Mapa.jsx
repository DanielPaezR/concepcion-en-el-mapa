import React, { useState, useEffect, useRef } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Navigation, Award, LocateFixed,
  Star, Zap, Crown, Sparkles, Menu, X,
  MapPin, Users, Landmark, TreePine, Utensils,
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

// ─── Estilos globales inyectados una vez ────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');

  .hud-font { font-family: 'Rajdhani', system-ui, sans-serif; }

  /* Scrollbar del quest log */
  .quest-scroll::-webkit-scrollbar { width: 4px; }
  .quest-scroll::-webkit-scrollbar-track { background: transparent; }
  .quest-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.4); border-radius: 4px; }

  /* Popup de Mapbox — override del fondo blanco por defecto */
  .mapboxgl-popup-content {
    background: rgba(2,6,18,0.97) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 14px !important;
    padding: 0 !important;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6) !important;
  }
  .mapboxgl-popup-tip { display: none !important; }
  .mapboxgl-popup-close-button {
    color: rgba(255,255,255,0.5) !important;
    font-size: 18px !important;
    top: 8px !important;
    right: 10px !important;
    background: none !important;
  }
  .mapboxgl-popup-close-button:hover { color: white !important; }

  /* Pulso en marcadores no descubiertos */
  @keyframes pin-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5), 0 4px 15px rgba(0,0,0,0.3); }
    60%       { box-shadow: 0 0 0 10px rgba(239,68,68,0), 0 4px 15px rgba(0,0,0,0.3); }
  }
  @keyframes pin-glow {
    0%, 100% { box-shadow: 0 0 8px 2px rgba(251,191,36,0.4), 0 4px 15px rgba(0,0,0,0.3); }
    50%       { box-shadow: 0 0 16px 6px rgba(251,191,36,0.7), 0 4px 15px rgba(0,0,0,0.3); }
  }
  @keyframes scan-line {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.15; }
    90%  { opacity: 0.15; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  .pin-undiscovered { animation: pin-pulse 2.2s ease-in-out infinite; }
  .pin-discovered   { animation: pin-glow 2s ease-in-out infinite; }
`;

// ─── Inyector de estilos ────────────────────────────────────
const StyleInjector = () => {
  useEffect(() => {
    const id = 'mapa-global-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id;
      tag.textContent = GLOBAL_STYLES;
      document.head.appendChild(tag);
    }
    return () => {};
  }, []);
  return null;
};

// ============================================================
// COMPONENTES INTERNOS
// ============================================================

// 🧭 Brújula funcional
const BrujulaFuncional = ({ bearing, onRotate }) => {
  const [angle, setAngle] = useState(bearing || 0);
  useEffect(() => setAngle(bearing || 0), [bearing]);

  return (
    <motion.button
      animate={{ rotate: angle }}
      transition={{ duration: 0.3 }}
      onClick={() => onRotate?.(0)}
      title="Orientar al norte"
      style={{
        position: 'absolute',
        bottom: 80,
        right: 16,
        width: 48,
        height: 48,
        background: 'rgba(2,6,18,0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        border: '1.5px solid rgba(251,191,36,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer',
        boxShadow: '0 0 12px rgba(251,191,36,0.2), 0 4px 12px rgba(0,0,0,0.4)',
      }}
      whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(251,191,36,0.4)' }}
      whileTap={{ scale: 0.94 }}
    >
      <Compass color="#fbbf24" size={22} />
    </motion.button>
  );
};

// 🎛️ HUD Superior
const HUDHeader = ({
  playerLevel, discoveredPlaces, totalLugares, xp,
  lugarEspecial, onOpenGaleria, onOpenAnclar,
  onToggleQuestLog, showQuestLog, isMobile, sistemaExp,
}) => {
  const xpParaSiguiente = sistemaExp?.expAcumulada?.[playerLevel - 1] ?? 0;
  const xpAnterior = playerLevel > 1 ? (sistemaExp?.expAcumulada?.[playerLevel - 2] ?? 0) : 0;
  const progreso = xpParaSiguiente > 0
    ? Math.min(((xp - xpAnterior) / (xpParaSiguiente - xpAnterior)) * 100, 100)
    : 100;

  const levelColors = {
    1: { from: '#065f46', to: '#14532d', border: '#22c55e', text: '#4ade80' },
    2: { from: '#1e3a5f', to: '#0f2d4a', border: '#60a5fa', text: '#93c5fd' },
    3: { from: '#312e81', to: '#1e1b4b', border: '#818cf8', text: '#a5b4fc' },
    4: { from: '#451a03', to: '#1c0900', border: '#f59e0b', text: '#fcd34d' },
    5: { from: '#450a0a', to: '#1a0505', border: '#ef4444', text: '#fca5a5' },
  };
  const lc = levelColors[Math.min(playerLevel, 5)];
  const LevelIcon = playerLevel >= 5 ? Crown : playerLevel >= 3 ? Zap : Star;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="hud-font"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: isMobile ? '8px 10px' : '10px 14px',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', pointerEvents: 'auto', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            background: `linear-gradient(135deg, ${lc.from}, ${lc.to})`,
            border: `1.5px solid ${lc.border}`,
            borderRadius: 10,
            padding: '5px 12px 6px',
            boxShadow: `0 0 14px ${lc.border}44, 0 4px 12px rgba(0,0,0,0.4)`,
            minWidth: 80,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <LevelIcon size={12} color={lc.text} />
              <span style={{ color: lc.text, fontWeight: 700, fontSize: 13, letterSpacing: '.05em' }}>
                NV. {playerLevel}
              </span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: lc.border, borderRadius: 4 }}
              />
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '.06em' }}>
              {xp} / {xpParaSiguiente} XP
            </span>
          </div>

          <div style={{
            background: 'rgba(2,6,18,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(34,197,94,0.45)',
            borderRadius: 10,
            padding: '5px 11px',
            boxShadow: '0 0 8px rgba(34,197,94,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={11} color="#4ade80" />
              <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 13 }}>
                {discoveredPlaces.length}<span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/{totalLugares}</span>
              </span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '.06em', marginTop: 1 }}>
              EXPLORADOS
            </div>
          </div>

          {playerLevel >= 5 && lugarEspecial && (
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
              onClick={onOpenGaleria}
              style={{
                background: 'linear-gradient(135deg, #b45309, #92400e)',
                border: '1px solid #f59e0b',
                borderRadius: 10,
                padding: '6px 10px',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(245,158,11,0.3)',
              }}
            >
              <Award size={16} color="#fcd34d" />
            </motion.button>
          )}

          {playerLevel >= 5 && discoveredPlaces.length === totalLugares && (
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
              onClick={onOpenAnclar}
              title="Anclar Guardián"
              style={{
                background: 'linear-gradient(135deg, #3b0764, #1e1b4b)',
                border: '1px solid #a855f7',
                borderRadius: 10,
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 16,
                boxShadow: '0 0 12px rgba(168,85,247,0.3)',
              }}
            >🛡️</motion.button>
          )}
        </div>
      </div>

      <motion.button
        onClick={onToggleQuestLog}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        style={{
          background: 'rgba(2,6,18,0.85)',
          backdropFilter: 'blur(10px)',
          border: showQuestLog ? '1.5px solid #ef4444' : '1.5px solid rgba(251,191,36,0.6)',
          borderRadius: 10,
          padding: '8px 10px',
          cursor: 'pointer',
          pointerEvents: 'auto',
          boxShadow: showQuestLog
            ? '0 0 12px rgba(239,68,68,0.3)'
            : '0 0 10px rgba(251,191,36,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color .2s, box-shadow .2s',
        }}
      >
        {showQuestLog
          ? <X size={20} color="#ef4444" />
          : <Menu size={20} color="#fbbf24" />}
      </motion.button>
    </motion.div>
  );
};

// 🗺️ Botón de ubicación actual
const BotonUbicacion = ({ userPosition, onCenter }) => {
  if (!userPosition) return null;
  return (
    <motion.button
      onClick={onCenter}
      whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}
      whileTap={{ scale: 0.94 }}
      title="Centrar en mi ubicación"
      style={{
        position: 'absolute',
        bottom: 80,
        left: 16,
        background: 'rgba(2,6,18,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(59,130,246,0.6)',
        borderRadius: '50%',
        width: 48, height: 48,
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 0 12px rgba(59,130,246,0.2), 0 4px 12px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Navigation size={20} color="#60a5fa" />
    </motion.button>
  );
};

// 📜 Quest Log Panel
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
          top: isMobile ? 58 : 68,
          right: 10,
          zIndex: 1000,
          background: 'rgba(2,6,18,0.97)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 16,
          padding: '14px 12px',
          width: isMobile ? 'calc(100% - 20px)' : 300,
          maxWidth: 300,
          maxHeight: '68vh',
          overflowY: 'auto',
          boxShadow: '0 0 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
          <span style={{ fontSize: 16 }}>📜</span>
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 15, letterSpacing: '.04em' }}>
            DESCUBRIMIENTOS
          </span>
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 20,
            padding: '1px 8px',
            fontSize: 11,
            color: '#4ade80',
            fontWeight: 700,
          }}>
            {discoveredPlaces.length}/{lugares.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {lugares.map((lugar, i) => {
            const found = discoveredPlaces.includes(lugar.id);
            return (
              <motion.div
                key={lugar.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { onClose(); onSelectLugar(lugar); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: found ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                  border: found ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background .15s',
                }}
                whileHover={{ background: found ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: found ? '#4ade80' : '#6b7280', fontSize: 14, opacity: found ? 1 : 0.7 }}>
                    {getTipoIcon(lugar.tipo)}
                  </span>
                  <span style={{
                    color: found ? '#e2e8f0' : '#6b7280',
                    fontSize: 13,
                    fontWeight: found ? 600 : 400,
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {found ? lugar.nombre : '???'}
                  </span>
                </div>
                {found
                  ? <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>✓</span>
                  : <span style={{ fontSize: 11, color: '#6b7280' }}>⚔️</span>}
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
          position: 'absolute',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: 'rgba(2,6,18,0.97)',
          backdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(34,197,94,0.5)',
          borderRadius: 20,
          padding: '20px 24px',
          width: '88%',
          maxWidth: 340,
          boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(34,197,94,0.08)',
          textAlign: 'center',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ marginBottom: 12 }}
        >
          <LocateFixed size={44} color="#4ade80" style={{ margin: '0 auto' }} />
        </motion.div>

        <h3 style={{ color: 'white', fontWeight: 700, fontSize: 17, marginBottom: 6, letterSpacing: '.03em' }}>
          ¿ACTIVAMOS TU UBICACIÓN?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
          Necesitamos tu ubicación para descubrir lugares automáticamente cuando estés cerca.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onAccept}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #16a34a, #14532d)',
              color: 'white',
              padding: '10px 0',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              border: '1px solid #22c55e',
              cursor: 'pointer',
              letterSpacing: '.04em',
              boxShadow: '0 0 12px rgba(34,197,94,0.25)',
            }}
          >ACTIVAR</motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onDeny}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
              padding: '10px 0',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              letterSpacing: '.04em',
            }}
          >AHORA NO</motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 🎯 Modal de Evento
const EventoModal = ({ evento, respuesta, setRespuesta, onResponder, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: 16,
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <motion.div
      initial={{ scale: 0.88, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.88, y: 20 }}
      transition={{ type: 'spring', damping: 22 }}
      className="hud-font"
      style={{
        background: 'rgba(2,6,18,0.99)',
        border: '1.5px solid rgba(251,191,36,0.5)',
        borderRadius: 22,
        maxWidth: 380,
        width: '100%',
        padding: 26,
        boxShadow: '0 0 60px rgba(0,0,0,0.7), 0 0 30px rgba(251,191,36,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, #b45309, #78350f)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, border: '1px solid rgba(251,191,36,0.4)',
        }}>🎯</div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '.1em', marginBottom: 2 }}>EVENTO DIARIO</div>
          <h3 style={{ color: '#fcd34d', fontWeight: 700, fontSize: 16, margin: 0 }}>{evento.titulo}</h3>
        </div>
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
        >×</button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16, lineHeight: 1.6, borderLeft: '2px solid rgba(251,191,36,0.3)', paddingLeft: 12 }}>
        {evento.pregunta}
      </p>

      <input
        type="text"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Tu respuesta..."
        onKeyPress={(e) => e.key === 'Enter' && onResponder()}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          marginBottom: 14,
          color: 'white',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onResponder}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #16a34a, #14532d)',
            color: 'white',
            padding: '11px 0',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            border: '1px solid #22c55e',
            cursor: 'pointer',
            letterSpacing: '.04em',
          }}
        >RESPONDER</motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onClose}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.45)',
            padding: '11px 0',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            letterSpacing: '.04em',
          }}
        >CANCELAR</motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// 📍 Pin de lugar en el mapa
const LugarPin = ({ lugar, discovered, isMobile, onClick }) => {
  const TIPO_EMOJI = {
    historico: '🏛️', natural: '🌲', cultural: '🎭', gastronomico: '🍽️',
  };
  const size = isMobile ? 38 : 46;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
      style={{ cursor: 'pointer' }}
    >
      <div
        className={discovered ? 'pin-discovered' : 'pin-undiscovered'}
        style={{
          width: size,
          height: size,
          background: discovered
            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
            : 'linear-gradient(135deg, #ef4444, #b91c1c)',
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: `${discovered ? 2.5 : 2}px solid white`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ transform: 'rotate(45deg)', fontSize: isMobile ? 17 : 21 }}>
          {TIPO_EMOJI[lugar.tipo] || '📍'}
        </span>
      </div>
    </motion.div>
  );
};

// 🏆 Popup del lugar seleccionado
const LugarPopupContent = ({ lugar, discovered, userPosition, onExplorar, calcularDistancia }) => {
  const distance = userPosition ? calcularDistancia(
    userPosition.lat, userPosition.lng,
    parseFloat(lugar.latitud), parseFloat(lugar.longitud)
  ) : null;

  const canExplore = distance !== null && distance <= 20;
  const metersToGo = distance ? Math.round(distance) : null;

  const getTipoEmoji = (tipo) => {
    const emojis = { historico: '🏛️', natural: '🌲', cultural: '🎭', gastronomico: '🍽️' };
    return emojis[tipo] || '📍';
  };

  return (
    <div style={{ padding: '14px 16px', minWidth: 180, maxWidth: 210 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '2px 8px', marginBottom: 8,
        fontSize: 10, color: 'rgba(255,255,255,0.5)',
      }}>
        {getTipoEmoji(lugar.tipo)} {lugar.tipo}
      </div>

      <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
        {lugar.nombre}
      </h3>

      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.55, marginBottom: 12 }}>
        {lugar.descripcion}
      </p>

      {!canExplore && distance !== null && (
        <div style={{
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '6px', marginBottom: 12, textAlign: 'center'
        }}>
          <span style={{ color: '#fca5a5', fontSize: 11 }}>
            📍 A {metersToGo} metros del lugar
          </span>
        </div>
      )}

      <motion.button
        whileHover={canExplore ? { scale: 1.03 } : {}}
        whileTap={canExplore ? { scale: 0.97 } : {}}
        onClick={canExplore ? onExplorar : null}
        disabled={!canExplore}
        style={{
          width: '100%',
          background: canExplore
            ? 'linear-gradient(135deg, #15803d, #14532d)'
            : 'linear-gradient(135deg, #4a4a4a, #3a3a3a)',
          color: canExplore ? 'white' : 'rgba(255,255,255,0.4)',
          padding: '9px 0',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 13,
          border: canExplore ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
          cursor: canExplore ? 'pointer' : 'not-allowed',
          opacity: canExplore ? 1 : 0.6,
        }}
      >
        {canExplore ? '✨ EXPLORAR AHORA' : '🔒 ACERCATE MÁS'}
      </motion.button>

      {!canExplore && distance && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, textAlign: 'center', marginTop: 8 }}>
          Necesitas estar a menos de 20 metros
        </p>
      )}
    </div>
  );
};

// ⏳ Loading screen RPG
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 40%, #0f1e0f, #0a0e1a)',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <motion.div
      animate={{ y: ['-100%', '200vh'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)',
        pointerEvents: 'none',
      }}
    />

    <div style={{ position: 'relative', marginBottom: 32 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 80, height: 80,
          border: '2px solid transparent',
          borderTopColor: '#22c55e',
          borderRightColor: 'rgba(34,197,94,0.3)',
          borderRadius: '50%',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 10,
          border: '1.5px solid transparent',
          borderTopColor: '#4ade80',
          borderLeftColor: 'rgba(74,222,128,0.3)',
          borderRadius: '50%',
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>🦆</div>
    </div>

    <div style={{ fontFamily: "'Rajdhani', system-ui", color: '#4ade80', fontWeight: 700, fontSize: 16, letterSpacing: '.18em', marginBottom: 6 }}>
      CARGANDO MAPA
    </div>
    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, letterSpacing: '.12em' }}>
      CONCEPCIÓN · ANTIOQUIA
    </div>

    <motion.div
      style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 24 }}
    >
      <motion.div
        animate={{ width: ['0%', '100%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ height: '100%', background: 'linear-gradient(90deg, #16a34a, #4ade80)', borderRadius: 4 }}
      />
    </motion.div>
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
  const [viewState, setViewState] = useState({
    longitude: -75.2581,
    latitude: 6.3944,
    zoom: 18,
    pitch: 60,
    bearing: 15,
  });

  const navigate = useNavigate();

  // ── Helpers ────────────────────────────────────────────────
  const mostrarMensajeGuia = (mensaje, tipo = 'normal', duracion = 5000) => {
    setMensajeGuia(mensaje);
    setTipoGuia(tipo);
    setTimeout(() => setMensajeGuia(''), duracion);
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      historico: <Landmark size={isMobile ? 15 : 18} color="#94a3b8" />,
      natural:   <TreePine size={isMobile ? 15 : 18} color="#4ade80" />,
      cultural:  <Users    size={isMobile ? 15 : 18} color="#a78bfa" />,
      gastronomico: <Utensils size={isMobile ? 15 : 18} color="#fb923c" />,
    };
    return icons[tipo] || <MapPin size={isMobile ? 15 : 18} color="#94a3b8" />;
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calcularSistemaExp = (totalLugares) => {
    const pesosPorNivel = [1, 1.5, 2, 2.5, 3];
    const sumaPesos = pesosPorNivel.reduce((a, b) => a + b, 0);
    const expBase = 10;
    const expRequerida = pesosPorNivel.map(p => Math.round((p/sumaPesos)*totalLugares*expBase));
    const expAcumulada = [];
    expRequerida.reduce((acc, curr, i) => { expAcumulada[i] = acc + curr; return expAcumulada[i]; }, 0);
    return { expRequerida, expAcumulada, expBase };
  };

  const calcularNivelPorXP = (xpActual, expAcumulada) => {
    for (let i = 0; i < expAcumulada.length; i++) {
      if (xpActual < expAcumulada[i]) return i + 1;
    }
    return expAcumulada.length + 1;
  };

  // ── Función para registrar descubrimiento ───────────────────
  const registrarDescubrimiento = async (lugar) => {
    try {
      if (!userPosition) {
        mostrarMensajeGuia('📍 Activa tu ubicación para explorar lugares', 'pensativo', 3000);
        return false;
      }
      
      const distance = calcularDistancia(
        userPosition.lat, userPosition.lng,
        parseFloat(lugar.latitud), parseFloat(lugar.longitud)
      );
      
      if (distance > 20) {
        mostrarMensajeGuia(`❌ Debes acercarte más al lugar (${Math.round(distance)} metros de distancia)`, 'pensativo', 3000);
        return false;
      }
      
      if (discoveredPlaces.includes(lugar.id)) {
        mostrarMensajeGuia(`📖 Ya descubriste ${lugar.nombre}`, 'normal', 2000);
        return false;
      }
      
      const response = await api.post('/descubrimientos/registrar', {
        lugar_id: lugar.id,
        latitud: userPosition.lat,
        longitud: userPosition.lng
      });
      
      if (response.data.success) {
        const nuevosDescubiertos = [...discoveredPlaces, lugar.id];
        setDiscoveredPlaces(nuevosDescubiertos);
        setLastVisitedPlace(lugar);
        setTimeout(() => setLastVisitedPlace(null), 3000);
        
        const nuevaXP = (nuevosDescubiertos.length) * sistemaExp.expBase;
        setXp(nuevaXP);
        localStorage.setItem('player_xp', nuevaXP);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosDescubiertos));
        
        if (sistemaExp.expAcumulada.length > 0) {
          const nuevoNivel = Math.min(calcularNivelPorXP(nuevaXP, sistemaExp.expAcumulada), 5);
          if (nuevoNivel > playerLevel) {
            setPlayerLevel(nuevoNivel);
            mostrarMensajeGuia(`🎉 ¡SUBISTE AL NIVEL ${nuevoNivel}! 🎉`, 'celebrando', 5000);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error al registrar descubrimiento:', error);
      mostrarMensajeGuia(error.response?.data?.error || 'Error al registrar descubrimiento', 'error', 3000);
      return false;
    }
  };

  const handleExplorarLugar = async (lugar) => {
    const registrado = await registrarDescubrimiento(lugar);
    if (registrado) {
      setSelectedLugar(null);
      navigate(`/lugar/${lugar.id}`);
    }
  };

  // ── Función para cargar lugar especial ───────────────────
  const cargarLugarEspecial = async () => {
    try {
      console.log('🔍 Buscando lugar especial, nivel actual:', playerLevel);
      
      const COORDENADAS_PARQUE = {
        latitud: 6.3953494,
        longitud: -75.2592802,
        nombre: '📸 Parque Principal - Rincón de Recuerdos'
      };
      
      try {
        const lugaresResponse = await api.get('/lugares');
        const lugares = lugaresResponse.data.data || [];
        
        let lugarEncontrado = lugares.find(l => 
          l.nombre && (l.nombre.includes('Parque') || l.nombre.includes('Principal') || l.tipo === 'especial')
        );
        
        if (lugarEncontrado) {
          console.log('✅ Lugar encontrado en BD:', lugarEncontrado.nombre);
          setLugarEspecial({
            ...lugarEncontrado,
            nombre: '📸 ' + lugarEncontrado.nombre
          });
        } else {
          console.log('📌 Usando coordenadas del Parque Principal');
          setLugarEspecial({
            id: 'parque_principal',
            nombre: COORDENADAS_PARQUE.nombre,
            latitud: COORDENADAS_PARQUE.latitud,
            longitud: COORDENADAS_PARQUE.longitud,
            tipo: 'especial'
          });
        }
      } catch (error) {
        console.log('⚠️ Error consultando BD, usando coordenadas fijas');
        setLugarEspecial({
          id: 'parque_principal',
          nombre: COORDENADAS_PARQUE.nombre,
          latitud: COORDENADAS_PARQUE.latitud,
          longitud: COORDENADAS_PARQUE.longitud,
          tipo: 'especial'
        });
      }
      
      console.log('✅ Lugar especial ACTIVADO');
      
    } catch (e) { 
      console.error('Error cargando lugar especial:', e);
      setLugarEspecial({
        id: 'fallback',
        nombre: '📸 Galería de Recuerdos',
        latitud: 6.3953494,
        longitud: -75.2592802,
        tipo: 'especial'
      });
    }
  };

  // ── Efectos ────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    console.log('🎮 Cargando lugar especial...');
    cargarLugarEspecial();
  }, []); // Solo se ejecuta una vez al montar

  useEffect(() => {
    if (!loading && lugares.length > 0) {
      mostrarMensajeGuia('¡Bienvenido a Concepción! Explora el mapa y descubre lugares increíbles.', 'bienvenida', 6000);
      cargarEventos();
    }
  }, [loading]);

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
    const consejos = [
      'Los marcadores dorados son lugares que ya descubriste.',
      'Cada lugar descubierto te da 10 XP.',
      'Tu avatar cambia de aspecto al subir de nivel.',
      'Usa el botón azul para volver a tu ubicación.',
      '¡Los eventos diarios te dan XP extra!',
    ];
    const id = setInterval(() => {
      if (!lastVisitedPlace && !showQuestLog) {
        mostrarMensajeGuia(consejos[Math.floor(Math.random() * consejos.length)], 'consejo', 4000);
      }
    }, 30000);
    return () => clearInterval(id);
  }, [lastVisitedPlace, showQuestLog]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setDiscoveredPlaces(parsed);
      }
      const savedXp = localStorage.getItem('player_xp');
      if (savedXp) setXp(parseInt(savedXp));
    } catch (e) {
      console.error('Error cargando progreso:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
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
      if (sistemaExp.expAcumulada.length > 0)
        setPlayerLevel(Math.min(calcularNivelPorXP(nuevoXP, sistemaExp.expAcumulada), 5));
    }
  }, [discoveredPlaces, sistemaExp]);

  useEffect(() => {
    const check = async () => {
      const saved = localStorage.getItem('locationResponse');
      if (saved === 'granted') { setShouldLocate(true); setLocationPermission('granted'); setUserResponded(true); return; }
      if (saved === 'denied')  { setLocationPermission('denied'); setUserResponded(true); return; }
      if (navigator.permissions?.query) {
        try {
          const r = await navigator.permissions.query({ name: 'geolocation' });
          if (r.state === 'granted') { setShouldLocate(true); setLocationPermission('granted'); setUserResponded(true); localStorage.setItem('locationResponse','granted'); }
          else if (r.state === 'denied') { setLocationPermission('denied'); setUserResponded(true); localStorage.setItem('locationResponse','denied'); }
          else setTimeout(() => setShowLocationPrompt(true), 1000);
        } catch { setTimeout(() => setShowLocationPrompt(true), 1000); }
      } else { setTimeout(() => setShowLocationPrompt(true), 1000); }
    };
    check();
  }, []);

  useEffect(() => {
    if (shouldLocate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationPermission('granted');
          setViewState(prev => ({ ...prev, longitude: pos.coords.longitude, latitude: pos.coords.latitude, zoom: 16 }));
        },
        () => setLocationPermission('denied')
      );
    }
  }, [shouldLocate]);

  // ── Carga de datos ─────────────────────────────────────────
  const cargarLugares = async () => {
    try {
      const r = await api.get('/lugares');
      if (r.data?.success && Array.isArray(r.data.data)) setLugares(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cargarEventos = async () => {
    try {
      const r = await api.get('/eventos/activos');
      setEventos(r.data.eventos || []);
    } catch (e) { console.error(e); }
  };

  const handleCompletarEvento = async (eventoId, respuesta) => {
    try {
      const r = await api.post('/eventos/completar', { eventoId, respuesta });
      if (r.data.success) {
        mostrarMensajeGuia(`🎉 ¡Completaste el reto! +${r.data.xp_ganada} XP`, 'celebrando', 4000);
        setEventoSeleccionado(null);
        setRespuestaEvento('');
        cargarEventos();
      }
    } catch {
      mostrarMensajeGuia('❌ Respuesta incorrecta. ¡Sigue intentando!', 'pensativo', 3000);
    }
  };

  useEffect(() => { cargarLugares(); }, []);

  // ── Renders condicionales ──────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (!MAPBOX_TOKEN) return (
    <div className="h-screen flex items-center justify-center bg-red-950 p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-400">Error de Configuración</h2>
        <p className="text-red-500 text-sm mt-1">No se detectó VITE_MAPBOX_TOKEN</p>
      </div>
    </div>
  );

  // ── Render principal ───────────────────────────────────────
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
        showQuestLog={showQuestLog}
        isMobile={isMobile}
      />

      <BrujulaFuncional
        bearing={viewState.bearing}
        onRotate={(b) => setViewState(prev => ({ ...prev, bearing: b }))}
      />

      <CompaneroVirtual
        mensaje={mensajeGuia}
        nivel={playerLevel}
        tipo={tipoGuia}
        emocion={lastVisitedPlace ? 'celebrando' : locationPermission === 'granted' ? 'feliz' : 'pensativo'}
      />

      {mostrarGaleria && (
        <GaleriaFotos 
          nivelUsuario={playerLevel}
          onCerrar={() => setMostrarGaleria(false)}
        />
      )}

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

      <QuestLogPanel
        show={showQuestLog}
        lugares={lugares}
        discoveredPlaces={discoveredPlaces}
        getTipoIcon={getTipoIcon}
        onClose={() => setShowQuestLog(false)}
        onSelectLugar={setSelectedLugar}
        isMobile={isMobile}
      />

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

        {userPosition && (
          <Marker longitude={userPosition.lng} latitude={userPosition.lat}>
            <AvatarJugador level={playerLevel} isMobile={isMobile} />
          </Marker>
        )}

        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            longitude={parseFloat(lugar.longitud)}
            latitude={parseFloat(lugar.latitud)}
            onClick={() => setSelectedLugar(lugar)}
          >
            <LugarPin
              lugar={lugar}
              discovered={discoveredPlaces.includes(lugar.id)}
              isMobile={isMobile}
              onClick={() => setSelectedLugar(lugar)}
            />
          </Marker>
        ))}

        {/* Marcador especial para la Galería - SIEMPRE VISIBLE */}
        {lugarEspecial && (
          <Marker 
            longitude={parseFloat(lugarEspecial.longitud)} 
            latitude={parseFloat(lugarEspecial.latitud)}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1], 
                y: [0, -6, 0] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => {
                setMostrarGaleria(true);
                if (playerLevel >= 5) {
                  mostrarMensajeGuia('📸 ¡Bienvenido a la Galería de Recuerdos!', 'celebrando', 3000);
                } else {
                  mostrarMensajeGuia(
                    `🔒 Puedes ver la Galería, pero necesitas nivel 5 para subir fotos. ¡Tu nivel actual es ${playerLevel}! Sigue explorando.`,
                    'pensativo',
                    5000
                  );
                }
              }}
              style={{
                width: 56,
                height: 56,
                background: playerLevel >= 5 
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                  : 'linear-gradient(135deg, #6b7280, #4b5563)',
                borderRadius: '50%',
                border: `3px solid ${playerLevel >= 5 ? 'white' : '#9ca3af'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                boxShadow: playerLevel >= 5 
                  ? '0 0 24px rgba(251,191,36,0.7), 0 4px 16px rgba(0,0,0,0.5)' 
                  : '0 0 12px rgba(107,114,128,0.4)',
                cursor: 'pointer',
                opacity: 1,
              }}
            >
              <span style={{ 
                filter: playerLevel >= 5 ? 'none' : 'grayscale(100%)',
                fontSize: 26 
              }}>
                📸
              </span>
              {playerLevel < 5 && (
                <span style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  fontSize: 18,
                  filter: 'none'
                }}>
                  🔒
                </span>
              )}
            </motion.div>
          </Marker>
        )}

        {eventos.map((evento) => (
          <Marker
            key={`evento_${evento.id}`}
            longitude={parseFloat(evento.longitud)}
            latitude={parseFloat(evento.latitud)}
            onClick={() => setEventoSeleccionado(evento)}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{
                width: 44, height: 44,
                background: 'linear-gradient(135deg, #b45309, #78350f)',
                borderRadius: '50%',
                border: '2px solid #fbbf24',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                cursor: 'pointer',
                boxShadow: '0 0 14px rgba(251,191,36,0.4)',
              }}
            >❓</motion.div>
          </Marker>
        ))}

        {selectedLugar && (
          <Popup
            longitude={parseFloat(selectedLugar.longitud)}
            latitude={parseFloat(selectedLugar.latitud)}
            onClose={() => setSelectedLugar(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={16}
          >
            <LugarPopupContent
              lugar={selectedLugar}
              discovered={discoveredPlaces.includes(selectedLugar.id)}
              userPosition={userPosition}
              onExplorar={() => handleExplorarLugar(selectedLugar)}
              calcularDistancia={calcularDistancia}
            />
          </Popup>
        )}
      </Map>

      <BotonUbicacion
        userPosition={userPosition}
        onCenter={() => userPosition && setViewState(prev => ({
          ...prev,
          longitude: userPosition.lng,
          latitude: userPosition.lat,
          zoom: 16,
        }))}
      />

      <MenuExplorador
        nivel={playerLevel}
        xp={xp}
        lugaresDescubiertos={discoveredPlaces.length}
        totalLugares={lugares.length}
      />

      {mostrarAnclar && (
        <AnclarGuardian
          userPosition={userPosition}
          onClose={() => setMostrarAnclar(false)}
          onAnclado={() => setMostrarAnclar(false)}
        />
      )}

      <AnimatePresence>
        {eventoSeleccionado && (
          <EventoModal
            evento={eventoSeleccionado}
            respuesta={respuestaEvento}
            setRespuesta={setRespuestaEvento}
            onResponder={() => handleCompletarEvento(eventoSeleccionado.id, respuestaEvento)}
            onClose={() => setEventoSeleccionado(null)}
          />
        )}
      </AnimatePresence>

      <EstadoReserva />
    </div>
  );
}

export default Mapa;
