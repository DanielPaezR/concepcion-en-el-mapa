import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { NavigationControl, Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Navigation, Award, LocateFixed,
  Star, Zap, Crown, Sparkles, Menu, X,
  MapPin, Users, Landmark, TreePine, Utensils, UserCircle,
} from 'lucide-react';
import api from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPublicGuideAvatars } from '../services/guias';
import { SOCKET_URL } from '../config/runtime';
import io from 'socket.io-client';
import CompaneroVirtual from '../components/CompaneroVirtual';
import AvatarJugador from '../components/AvatarJugador';
import AvatarGuia from '../components/AvatarGuia';
import GaleriaFotos from '../components/GaleriaFotos';
import Map3DEffect from '../components/Map3DEffect';
import AnclarGuardian from '../components/AnclarGuardian';
import EstadoReserva from '../components/EstadoReserva';
import MenuExplorador from '../components/MenuExplorador';
import LocationPrompt from '../components/LocationPrompt';
import TomarRecuerdo from '../components/TomarRecuerdo';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const STORAGE_KEY  = 'concepcion_descubiertos';

// ─── Mapa oscuro de aventura (dark adventure Mapbox style) ─────
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// ─── Estilos globales ──────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');

  * { -webkit-tap-highlight-color: transparent; }

  .hud-font   { font-family: 'Rajdhani', system-ui, sans-serif; }
  .orb-font   { font-family: 'Orbitron', monospace; }

  .quest-scroll::-webkit-scrollbar { width: 3px; }
  .quest-scroll::-webkit-scrollbar-track { background: transparent; }
  .quest-scroll::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.5); border-radius: 4px; }

  /* Mapbox popup override */
  .mapboxgl-popup-content {
    background: rgba(4,10,30,0.98) !important;
    backdrop-filter: blur(20px) saturate(1.4) !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-top: 1px solid rgba(255,255,255,0.14) !important;
    border-radius: 20px !important;
    padding: 0 !important;
    box-shadow: 0 0 0 1px rgba(34,197,94,0.08), 0 32px 80px rgba(0,0,0,0.85), 0 0 60px rgba(34,197,94,0.04) !important;
  }
  .mapboxgl-popup-tip { display: none !important; }
  .mapboxgl-popup-close-button {
    color: rgba(255,255,255,0.35) !important;
    font-size: 22px !important;
    top: 10px !important; right: 12px !important;
    background: none !important;
    transition: color .15s !important;
    z-index: 10 !important;
  }
  .mapboxgl-popup-close-button:hover { color: rgba(255,255,255,0.85) !important; }

  /* Ocultar controles por defecto de mapbox (los reemplazamos) */
  .mapboxgl-ctrl-top-right { display: none !important; }

  /* ── Animaciones de pins ── */
  @keyframes pin-enemy {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7), 0 0 20px rgba(239,68,68,0.3), 0 6px 20px rgba(0,0,0,0.5); }
    60%      { box-shadow: 0 0 0 14px rgba(239,68,68,0), 0 0 20px rgba(239,68,68,0.3), 0 6px 20px rgba(0,0,0,0.5); }
  }
  @keyframes pin-gold {
    0%,100% { box-shadow: 0 0 8px 3px rgba(251,191,36,0.55), 0 0 28px rgba(251,191,36,0.25), 0 6px 20px rgba(0,0,0,0.5); }
    50%     { box-shadow: 0 0 20px 8px rgba(251,191,36,0.8), 0 0 50px rgba(251,191,36,0.45), 0 6px 20px rgba(0,0,0,0.5); }
  }
  @keyframes sonar {
    0%   { transform: scale(1);   opacity: .8; }
    100% { transform: scale(3.5); opacity: 0; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes holo-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes level-flash {
    0%,100% { opacity:1; text-shadow: 0 0 20px currentColor; }
    50%      { opacity:.6; text-shadow: 0 0 40px currentColor, 0 0 80px currentColor; }
  }
  @keyframes xp-float {
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-80px) scale(1.4); opacity: 0; }
  }
  @keyframes particle-burst {
    0%   { transform: translate(0,0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  }
  @keyframes radar-sweep {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes radar-ping {
    0%,100% { opacity: 0.15; }
    50%     { opacity: 0.45; }
  }
  @keyframes glow-pulse {
    0%,100% { opacity: .6; }
    50%     { opacity: 1; }
  }
  @keyframes hud-in {
    0%   { opacity: 0; transform: translateY(-12px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .pin-enemy    { animation: pin-enemy 2s ease-in-out infinite; }
  .pin-gold     { animation: pin-gold  2s ease-in-out infinite; }

  /* ── Botones HUD ── */
  .hud-btn {
    display: flex; align-items: center; justify-content: center;
    background: rgba(4,10,30,0.88);
    backdrop-filter: blur(14px) saturate(1.5);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 13px;
    cursor: pointer;
    transition: all .18s ease;
    position: relative; overflow: hidden;
  }
  .hud-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06), transparent 60%);
    pointer-events: none;
  }
  .hud-btn:hover  { background: rgba(4,10,30,0.96); transform: translateY(-1px); }
  .hud-btn:active { transform: translateY(0) scale(.97); }

  .hud-btn-gold {
    border-color: rgba(251,191,36,0.45);
    box-shadow: 0 0 14px rgba(251,191,36,0.14), 0 3px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .hud-btn-gold:hover  { border-color: rgba(251,191,36,0.75); box-shadow: 0 0 24px rgba(251,191,36,0.3), 0 6px 16px rgba(0,0,0,0.5); }
  .hud-btn-danger { border-color: rgba(239,68,68,0.55) !important; box-shadow: 0 0 16px rgba(239,68,68,0.22), 0 3px 10px rgba(0,0,0,0.5) !important; }
  .hud-btn-blue   { border-color: rgba(59,130,246,0.45); box-shadow: 0 0 14px rgba(59,130,246,0.18), 0 3px 10px rgba(0,0,0,0.5); }
  .hud-btn-blue:hover { border-color: rgba(59,130,246,0.75); box-shadow: 0 0 24px rgba(59,130,246,0.35), 0 6px 16px rgba(0,0,0,0.5); }
  .hud-btn-green  { border-color: rgba(34,197,94,0.45); box-shadow: 0 0 14px rgba(34,197,94,0.16), 0 3px 10px rgba(0,0,0,0.5); }

  /* ── Badge nivel ── */
  .level-badge { position: relative; overflow: hidden; }
  .level-badge::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    animation: holo-shimmer 5s linear infinite;
  }

  /* ── Overlay CRT/scanlines ── */
  .crt-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.04) 2px,
      rgba(0,0,0,0.04) 4px
    );
  }
  .crt-vignette {
    position: fixed; inset: 0; pointer-events: none; z-index: 9998;
    background: radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%);
  }
  .crt-scanline {
    position: fixed; left: 0; right: 0; height: 120px; pointer-events: none; z-index: 9997;
    background: linear-gradient(transparent, rgba(34,197,94,0.025), transparent);
    animation: scanline 7s linear infinite;
    top: 0;
  }
`;

const StyleInjector = () => {
  useEffect(() => {
    const id = 'mapa-global-styles-v2';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id; tag.textContent = GLOBAL_STYLES;
      document.head.appendChild(tag);
    }
  }, []);
  return null;
};

// ─── TIPOS ────────────────────────────────────────────────────────
const TIPO_DATA = {
  historico:    { emoji: '🏛️', color: '#94a3b8', glow: 'rgba(148,163,184,0.6)', label: 'Histórico' },
  natural:      { emoji: '🌲', color: '#4ade80', glow: 'rgba(74,222,128,0.6)',  label: 'Natural' },
  cultural:     { emoji: '🎭', color: '#a78bfa', glow: 'rgba(167,139,250,0.6)', label: 'Cultural' },
  gastronomico: { emoji: '🍽️', color: '#fb923c', glow: 'rgba(251,146,60,0.6)',  label: 'Gastronómico' },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

// ✨ Partículas de XP (explotan al descubrir)
const XPBurst = ({ x, y, xp, onDone }) => {
  const PARTS = 14;
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9000 }}>
      <div style={{
        position: 'absolute', left: -24, top: -50,
        fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 22,
        color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.9)',
        animation: 'xp-float 1.1s ease-out forwards',
        whiteSpace: 'nowrap',
      }}>+{xp} XP</div>
      {Array.from({ length: PARTS }).map((_, i) => {
        const angle = (i / PARTS) * 360;
        const dist  = 40 + Math.random() * 50;
        const tx = Math.cos(angle * Math.PI / 180) * dist;
        const ty = Math.sin(angle * Math.PI / 180) * dist;
        const colors = ['#fbbf24','#4ade80','#f87171','#818cf8','#34d399'];
        const c = colors[i % colors.length];
        return (
          <div key={i} style={{
            position: 'absolute', left: -3, top: -3,
            width: 6, height: 6, borderRadius: '50%',
            background: c, boxShadow: `0 0 6px ${c}`,
            '--tx': `${tx}px`, '--ty': `${ty}px`,
            animation: `particle-burst 0.9s ease-out ${i * 0.02}s forwards`,
          }} />
        );
      })}
    </div>
  );
};

// 🌟 Banner de subida de nivel
const LevelUpBanner = ({ level, show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -40 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 8000, textAlign: 'center',
          background: 'rgba(4,10,30,0.97)',
          border: '1.5px solid rgba(251,191,36,0.6)',
          borderRadius: 24,
          padding: '28px 44px',
          boxShadow: '0 0 80px rgba(251,191,36,0.35), 0 0 0 1px rgba(251,191,36,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 10 }}>⚔️</div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 13,
          color: 'rgba(251,191,36,0.5)', letterSpacing: '.25em', marginBottom: 8,
        }}>NIVEL ALCANZADO</div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 52,
          color: '#fbbf24', lineHeight: 1,
          animation: 'level-flash 1.5s ease-in-out infinite',
          textShadow: '0 0 40px rgba(251,191,36,0.8)',
        }}>{level}</div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 10, letterSpacing: '.1em' }}>
          EXPLORADOR ASCENDIDO
        </div>
        <div style={{ position: 'absolute', top: '50%', left: 16, right: 16, height: 1, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)', pointerEvents: 'none' }} />
      </motion.div>
    )}
  </AnimatePresence>
);

// 📡 Radar mini
const RadarMini = ({ userPosition, lugares, discoveredPlaces, isMobile }) => {
  if (!userPosition || isMobile) return null;
  const SIZE = 90;
  const RANGE_M = 500;
  return (
    <div style={{
      position: 'absolute', bottom: 100, right: 16, zIndex: 1000,
      width: SIZE, height: SIZE,
      background: 'rgba(4,10,30,0.90)',
      border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: '50%',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 0 20px rgba(34,197,94,0.12), 0 4px 16px rgba(0,0,0,0.5)',
      overflow: 'hidden',
    }}>
      {[0.3, 0.6, 0.9].map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${50 - r * 50}%`, top: `${50 - r * 50}%`,
          width: `${r * 100}%`, height: `${r * 100}%`,
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: '50%',
          animation: `radar-ping ${2 + i * 0.7}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: 1, background: 'rgba(34,197,94,0.12)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1, height: '100%', background: 'rgba(34,197,94,0.12)' }} />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'conic-gradient(rgba(34,197,94,0.18) 0deg, transparent 60deg)',
        borderRadius: '50%',
        animation: 'radar-sweep 3s linear infinite',
        transformOrigin: '50% 50%',
      }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
      {lugares.slice(0, 12).map((l) => {
        const dlat = (parseFloat(l.latitud) - userPosition.lat) * 111000;
        const dlng = (parseFloat(l.longitud) - userPosition.lng) * 111000 * Math.cos(userPosition.lat * Math.PI / 180);
        const dist = Math.sqrt(dlat * dlat + dlng * dlng);
        if (dist > RANGE_M) return null;
        const px = 50 + (dlng / RANGE_M) * 42;
        const py = 50 - (dlat / RANGE_M) * 42;
        const found = discoveredPlaces.includes(l.id);
        return (
          <div key={l.id} style={{
            position: 'absolute', left: `${px}%`, top: `${py}%`,
            transform: 'translate(-50%,-50%)',
            width: found ? 5 : 4, height: found ? 5 : 4, borderRadius: '50%',
            background: found ? '#fbbf24' : '#ef4444',
            boxShadow: found ? '0 0 6px #fbbf24' : '0 0 4px #ef4444',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }} />
        );
      })}
      <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontFamily: "'Orbitron',monospace", fontSize: 6, color: 'rgba(34,197,94,0.5)', letterSpacing: '.1em' }}>RADAR</div>
    </div>
  );
};

// 🧭 Brújula
const BrujulaFuncional = ({ bearing, onRotate, isMobile }) => (
  <motion.button
    animate={{ rotate: bearing || 0 }}
    transition={{ duration: 0.3 }}
    onClick={() => onRotate?.(0)}
    title="Orientar al norte"
    className="hud-btn hud-btn-gold"
    style={{
      position: 'absolute',
      bottom: isMobile ? 100 : 108,
      right: isMobile ? 12 : 16,
      width: isMobile ? 42 : 46,
      height: isMobile ? 42 : 46,
      borderRadius: '50%',
      zIndex: 1000,
    }}
    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
  >
    <Compass color="#fbbf24" size={isMobile ? 19 : 21} />
  </motion.button>
);

// 🎛️ HUD Superior
const HUDHeader = ({
  playerLevel, discoveredPlaces, totalLugares, xp,
  lugarEspecial, onOpenGaleria, onOpenAnclar,
  onToggleQuestLog, onToggleMenuExplorador, showQuestLog, isMobile, sistemaExp, userAvatar,
}) => {
  const xpParaSiguiente = sistemaExp?.expAcumulada?.[playerLevel - 1] ?? 0;
  const xpAnterior  = playerLevel > 1 ? (sistemaExp?.expAcumulada?.[playerLevel - 2] ?? 0) : 0;
  const progreso    = xpParaSiguiente > 0 ? Math.min(((xp - xpAnterior) / (xpParaSiguiente - xpAnterior)) * 100, 100) : 100;

  const LC = {
    1: { from: '#041a04', to: '#0d2e0d', border: '#22c55e', text: '#4ade80', glow: 'rgba(34,197,94,0.4)' },
    2: { from: '#04121a', to: '#0d2240', border: '#60a5fa', text: '#93c5fd', glow: 'rgba(96,165,250,0.4)' },
    3: { from: '#0c0440', to: '#1a1060', border: '#818cf8', text: '#a5b4fc', glow: 'rgba(129,140,248,0.4)' },
    4: { from: '#1a0c00', to: '#3d1800', border: '#f59e0b', text: '#fcd34d', glow: 'rgba(245,158,11,0.4)' },
    5: { from: '#1a0202', to: '#3d0808', border: '#ef4444', text: '#fca5a5', glow: 'rgba(239,68,68,0.45)' },
  };
  const lc = LC[Math.min(playerLevel, 5)];
  const LevelIcon = playerLevel >= 5 ? Crown : playerLevel >= 3 ? Zap : Star;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.1 }}
      className="hud-font"
      style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: isMobile ? '10px 10px 0' : '12px 14px 0',
        pointerEvents: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', pointerEvents: 'auto', flexWrap: 'wrap' }}>

        <div className="level-badge" style={{
          background: `linear-gradient(150deg, ${lc.from}, ${lc.to})`,
          border: `1.5px solid ${lc.border}`,
          boxShadow: `0 0 22px ${lc.glow}, 0 3px 12px rgba(0,0,0,0.65)`,
          padding: isMobile ? '5px 10px 6px' : '5px 13px 7px',
          borderRadius: 13,
          minWidth: isMobile ? 68 : 80,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <LevelIcon size={10} color={lc.text} />
            <span className="orb-font" style={{ color: lc.text, fontWeight: 700, fontSize: isMobile ? 11 : 13, letterSpacing: '.06em' }}>
              NV.{playerLevel}
            </span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden', marginBottom: 3 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${lc.border}88, ${lc.text})`,
                boxShadow: `0 0 8px ${lc.border}`,
              }}
            />
          </div>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.28)', letterSpacing: '.06em', fontFamily: "'Orbitron',monospace" }}>
            {xp}/{xpParaSiguiente} XP
          </span>
        </div>

        <div style={{
          background: 'rgba(4,10,30,0.88)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 13,
          padding: isMobile ? '4px 9px' : '5px 12px',
          boxShadow: '0 0 14px rgba(34,197,94,0.1), 0 3px 10px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(34,197,94,0.04), transparent)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={9} color="#4ade80" />
            <span style={{ color: '#4ade80', fontWeight: 700, fontSize: isMobile ? 11 : 13, fontFamily: "'Orbitron',monospace" }}>
              {discoveredPlaces.length}
              <span style={{ color: 'rgba(255,255,255,0.22)', fontWeight: 400 }}>/{totalLugares}</span>
            </span>
          </div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.22)', letterSpacing: '.1em', marginTop: 1 }}>LUGARES</div>
        </div>

        {!isMobile && (
          <div style={{
            background: 'rgba(4,10,30,0.88)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(168,85,247,0.28)', borderRadius: 13,
            padding: '5px 12px', boxShadow: '0 0 14px rgba(168,85,247,0.1), 0 3px 10px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={9} color="#c084fc" />
              <span style={{ color: '#c084fc', fontWeight: 700, fontSize: 13, fontFamily: "'Orbitron',monospace" }}>{xp}</span>
            </div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.22)', letterSpacing: '.1em', marginTop: 1 }}>XP TOTAL</div>
          </div>
        )}

        {playerLevel >= 5 && lugarEspecial && (
          <motion.button whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.93 }} onClick={onOpenGaleria}
            className="hud-btn"
            style={{ background: 'linear-gradient(135deg, #92400e, #78350f)', border: '1px solid rgba(245,158,11,0.6)', borderRadius: 13, padding: isMobile ? '5px 9px' : '6px 11px', boxShadow: '0 0 20px rgba(245,158,11,0.35)' }}>
            <Award size={15} color="#fcd34d" />
          </motion.button>
        )}
        {playerLevel >= 5 && (
          <motion.button whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.93 }} onClick={onOpenAnclar}
            className="hud-btn"
            style={{ background: 'linear-gradient(135deg, #2e0764, #1e1b4b)', border: '1px solid rgba(168,85,247,0.5)', borderRadius: 13, padding: isMobile ? '5px 9px' : '6px 11px', fontSize: 15, boxShadow: '0 0 20px rgba(168,85,247,0.28)' }}>🛡️</motion.button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto', flexShrink: 0 }}>
        <motion.button onClick={onToggleMenuExplorador} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.93 }}
          className="hud-btn hud-btn-gold"
          style={{ width: isMobile ? 40 : 46, height: isMobile ? 40 : 46, borderRadius: 13 }}>
          {userAvatar
            ? <img src={userAvatar} alt="Perfil" style={{ width: isMobile ? 26 : 30, height: isMobile ? 26 : 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(251,191,36,0.5)' }} />
            : <UserCircle size={isMobile ? 18 : 21} color="#fbbf24" />}
        </motion.button>

        <motion.button onClick={onToggleQuestLog} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.93 }}
          className={`hud-btn ${showQuestLog ? 'hud-btn-danger' : 'hud-btn-gold'}`}
          style={{ width: isMobile ? 40 : 46, height: isMobile ? 40 : 46, borderRadius: 13, position: 'relative' }}>
          {showQuestLog ? <X size={isMobile ? 18 : 20} color="#f87171" /> : <Menu size={isMobile ? 18 : 20} color="#fbbf24" />}
          {!showQuestLog && discoveredPlaces.length > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4, width: 16, height: 16,
              background: discoveredPlaces.length === totalLugares ? '#22c55e' : '#f59e0b',
              borderRadius: '50%', border: '2px solid rgba(4,10,30,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 700, color: 'white', fontFamily: "'Orbitron',monospace",
            }}>{discoveredPlaces.length === totalLugares ? '✓' : discoveredPlaces.length}</div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// 📍 Pin de lugar épico
const LugarPin = React.memo(({ lugar, discovered, isMobile, onClick }) => {
  const td   = TIPO_DATA[lugar.tipo] || TIPO_DATA.historico;
  const SIZE = isMobile ? 38 : 46;
  return (
    <motion.div onClick={(e) => { e.stopPropagation(); onClick(); }}
      whileHover={{ scale: 1.18, y: -3 }} whileTap={{ scale: 0.9 }}
      style={{ cursor: 'pointer', position: 'relative' }}>

      {!discovered && (
        <div style={{
          position: 'absolute', inset: -6,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: `radial-gradient(circle at 30% 30%, ${td.glow}30, transparent 70%)`,
          filter: 'blur(4px)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        position: 'absolute', bottom: -8, left: '50%',
        transform: 'translateX(-50%)',
        width: SIZE * 0.6, height: 6,
        background: 'rgba(0,0,0,0.45)',
        borderRadius: '50%',
        filter: 'blur(3px)',
        pointerEvents: 'none',
      }} />

      <div
        className={discovered ? 'pin-gold' : 'pin-enemy'}
        style={{
          width: SIZE, height: SIZE,
          background: discovered
            ? 'linear-gradient(135deg, #fef9c3 0%, #fde68a 35%, #fbbf24 70%, #d97706 100%)'
            : `linear-gradient(135deg, ${td.color}55 0%, #1e0a0a 40%, #ef4444 80%, #991b1b 100%)`,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: discovered
            ? '2.5px solid rgba(255,255,255,0.92)'
            : `2px solid ${td.color}99`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: '40%', height: '40%',
          background: discovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)',
          borderRadius: '50%',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }} />
        <span style={{ transform: 'rotate(45deg)', fontSize: isMobile ? 16 : 20, position: 'relative', zIndex: 1 }}>
          {discovered ? td.emoji : '❓'}
        </span>
      </div>

      {discovered && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.8))',
          pointerEvents: 'none',
        }}>👑</div>
      )}
    </motion.div>
  );
});

// 🏪 Pin de comercio aliado en el mapa — distinto de los pines de lugares
// (color ámbar en vez de rojo/dorado, ícono de tienda) para que se
// distingan de un vistazo.
const ComercioPin = React.memo(({ comercio, isMobile }) => {
  const tamano = isMobile ? 36 : 42;
  return (
    <div
      style={{
        width: tamano, height: tamano,
        background: 'linear-gradient(135deg, #d97706, #92400e)',
        border: '2px solid #fde68a',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
        cursor: 'pointer',
      }}
    >
      <span style={{ transform: 'rotate(45deg)', fontSize: isMobile ? 16 : 19 }}>🏪</span>
    </div>
  );
});

const ComercioPopupContent = ({ comercio, onVerFicha }) => (
  <div style={{ padding: '12px 14px', minWidth: 180, maxWidth: 'min(230px, 78vw)', boxSizing: 'border-box' }}>
    <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 2 }}>{comercio.nombre}</div>
    <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
      {comercio.categoria}
    </div>
    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 8px', fontSize: 12.5, color: '#78350f', marginBottom: 8 }}>
      🎁 {comercio.beneficio}
    </div>
    {Number(comercio.total_resenas) > 0 && (
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        ⭐ {Number(comercio.calificacion_promedio).toFixed(1)} · {comercio.total_resenas} reseña{comercio.total_resenas != 1 ? 's' : ''}
      </div>
    )}
    <button
      onClick={onVerFicha}
      style={{ width: '100%', background: '#d97706', color: 'white', border: 'none', borderRadius: 8, padding: '8px 10px', fontWeight: 700, fontSize: 12.5 }}
    >
      Ver ficha completa
    </button>
  </div>
);

// 📜 Quest Log holográfico
const QuestLogPanel = ({ show, lugares, discoveredPlaces, onClose, onSelectLugar, isMobile }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ x: '110%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '110%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 270 }}
        className="hud-font quest-scroll"
        style={{
          position: 'absolute',
          top: isMobile ? 60 : 70, right: 10,
          zIndex: 1800,
          background: 'rgba(4,10,30,0.97)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderTop: '1px solid rgba(34,197,94,0.35)',
          borderRadius: 20,
          padding: '14px 12px',
          width: isMobile ? 'calc(100% - 20px)' : 300,
          maxWidth: 300,
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), 0 0 40px rgba(34,197,94,0.04)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📜</div>
          <span className="orb-font" style={{ color: '#fbbf24', fontWeight: 700, fontSize: 12, letterSpacing: '.1em' }}>MISIONES</span>
          <div style={{ marginLeft: 'auto', background: discoveredPlaces.length === lugares.length ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.08)', border: `1px solid ${discoveredPlaces.length === lugares.length ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 20, padding: '2px 9px', fontSize: 9, color: '#4ade80', fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>
            {discoveredPlaces.length}/{lugares.length}
          </div>
        </div>

        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 10, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: lugares.length > 0 ? `${(discoveredPlaces.length / lugares.length) * 100}%` : '0%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #15803d, #4ade80)', borderRadius: 4, boxShadow: '0 0 6px rgba(74,222,128,0.5)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {lugares.map((lugar, i) => {
            const found = discoveredPlaces.includes(lugar.id);
            const td = TIPO_DATA[lugar.tipo] || TIPO_DATA.historico;
            return (
              <motion.div key={lugar.id}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => { onClose(); onSelectLugar(lugar); }}
                style={{
                  padding: '7px 10px', borderRadius: 11, cursor: 'pointer',
                  background: found ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.02)',
                  border: found ? '1px solid rgba(34,197,94,0.18)' : '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all .15s',
                }}
                whileHover={{ background: found ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.06)', x: 2 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ opacity: found ? 1 : 0.35 }}>{found ? td.emoji : '⚔️'}</span>
                  <span style={{ color: found ? '#e2e8f0' : '#374151', fontSize: 12, fontWeight: found ? 600 : 400, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {found ? lugar.nombre : '— Desconocido —'}
                  </span>
                </div>
                {found
                  ? <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#4ade80', fontWeight: 700, flexShrink: 0, fontFamily: "'Orbitron',monospace" }}>✓</div>
                  : <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, flexShrink: 0 }}>?</div>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// 🎯 Modal Evento
const EventoModal = ({ evento, respuesta, setRespuesta, onResponder, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <motion.div
      initial={{ scale: 0.85, y: 28 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 28 }}
      transition={{ type: 'spring', damping: 22 }}
      className="hud-font"
      style={{ background: 'rgba(4,10,30,0.99)', border: '1px solid rgba(251,191,36,0.22)', borderTop: '1px solid rgba(251,191,36,0.5)', borderRadius: 24, maxWidth: 380, width: '100%', padding: 26, boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(251,191,36,0.05)', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 30, right: 30, height: 1, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.7), transparent)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #b45309, #78350f)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 16px rgba(245,158,11,0.25)' }}>🎯</div>
        <div>
          <div className="orb-font" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, letterSpacing: '.15em', marginBottom: 3 }}>RETO DIARIO</div>
          <h3 style={{ color: '#fcd34d', fontWeight: 700, fontSize: 15, margin: 0 }}>{evento.titulo}</h3>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, width: 30, height: 30, color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14, marginBottom: 18, lineHeight: 1.65, borderLeft: '2px solid rgba(251,191,36,0.25)', paddingLeft: 12 }}>{evento.pregunta}</p>
      <input type="text" value={respuesta} onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Tu respuesta..." onKeyPress={(e) => e.key === 'Enter' && onResponder()}
        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, marginBottom: 14, color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onResponder}
          style={{ flex: 1, background: 'linear-gradient(135deg, #16a34a, #14532d)', color: 'white', padding: '12px 0', borderRadius: 13, fontWeight: 700, fontSize: 13, border: '1px solid rgba(34,197,94,0.4)', cursor: 'pointer', letterSpacing: '.07em', fontFamily: "'Orbitron',monospace", boxShadow: '0 0 18px rgba(34,197,94,0.18)' }}>RESPONDER</motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose}
          style={{ flex: 1, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.38)', padding: '12px 0', borderRadius: 13, fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>CANCELAR</motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// 🏆 Popup del lugar (NUEVA VERSIÓN CON DOS BOTONES)
const LugarPopupContent = ({ lugar, discovered, userPosition, onExplorar, onVerDetalles, onAbrirMapa, calcularDistancia }) => {
  const distance   = userPosition ? calcularDistancia(userPosition.lat, userPosition.lng, parseFloat(lugar.latitud), parseFloat(lugar.longitud)) : null;
  const canExplore = distance !== null && distance <= 100;
  const td         = TIPO_DATA[lugar.tipo] || TIPO_DATA.historico;
  const desc       = lugar.descripcion?.length > 85 ? lugar.descripcion.substring(0, 85) + '…' : lugar.descripcion || 'Un lugar increíble por descubrir.';

  return (
    <div style={{ padding: '16px 16px 14px', minWidth: 210, maxWidth: 'min(240px, 78vw)', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: 116, borderRadius: 14, marginBottom: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {lugar.imagen_url
          ? <img src={lugar.imagen_url} alt={lugar.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="font-size:46px">${td.emoji}</span>`; }} />
          : <span style={{ fontSize: 46 }}>{td.emoji}</span>}
        {discovered && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(34,197,94,0.88)', borderRadius: 20, padding: '2px 9px', fontSize: 9, color: 'white', fontWeight: 700, letterSpacing: '.06em', fontFamily: "'Orbitron',monospace" }}>✓ HALLADO</div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(4,10,30,0.7))', pointerEvents: 'none' }} />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${td.color}14`, border: `1px solid ${td.color}30`, borderRadius: 20, padding: '2px 9px', marginBottom: 8, fontSize: 9, color: td.color, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>
        {td.emoji} {td.label}
      </div>

      <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>{lugar.nombre}</h3>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.65, margin: '0 0 10px' }}>{desc}</p>

      {!discovered && (
        <div style={{ background: 'rgba(251,191,36,0.05)', borderLeft: '2px solid rgba(251,191,36,0.3)', padding: '5px 8px', marginBottom: 12, borderRadius: '0 7px 7px 0' }}>
          <span style={{ color: 'rgba(251,191,36,0.7)', fontSize: 9, fontWeight: 600 }}>🔍 Acércate para desbloquear la historia completa</span>
        </div>
      )}

      {!discovered && !canExplore && distance !== null && (
        <div style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 9, padding: '6px 9px', marginBottom: 10, textAlign: 'center' }}>
          <span style={{ color: '#fca5a5', fontSize: 11, fontWeight: 600 }}>📍 A {Math.round(distance)} m de aquí</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        {!discovered ? (
          <motion.button
            whileHover={canExplore ? { scale: 1.03 } : {}}
            whileTap={canExplore ? { scale: 0.97 } : {}}
            onClick={(e) => { e.stopPropagation(); if (canExplore) onExplorar(); }}
            disabled={!canExplore}
            className="orb-font"
            style={{
              width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 11,
              cursor: canExplore ? 'pointer' : 'not-allowed', letterSpacing: '.07em',
              background: canExplore ? 'linear-gradient(135deg, #15803d, #14532d)' : 'rgba(255,255,255,0.04)',
              color: canExplore ? 'white' : 'rgba(255,255,255,0.25)',
              border: canExplore ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: canExplore ? '0 0 20px rgba(34,197,94,0.18)' : 'none',
            }}
          >
            {canExplore ? '✨ EXPLORAR LUGAR' : '🔒 ACÉRCATE MÁS'}
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onVerDetalles(); }}
              className="orb-font"
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 11,
                cursor: 'pointer', letterSpacing: '.07em',
                background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
                color: 'white',
                border: '1px solid rgba(59,130,246,0.35)',
                boxShadow: '0 0 20px rgba(59,130,246,0.18)',
              }}
            >
              📖 VER DETALLES
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onAbrirMapa(); }}
              className="orb-font"
              style={{
                width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 11,
                cursor: 'pointer', letterSpacing: '.07em',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                border: '1px solid rgba(16,185,129,0.35)',
                boxShadow: '0 0 20px rgba(16,185,129,0.18)',
              }}
            >
              🗺️ CÓMO LLEGAR
            </motion.button>
          </>
        )}
      </div>

      {!discovered && !canExplore && distance !== null && (
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 8, textAlign: 'center', marginTop: 6, letterSpacing: '.05em', fontFamily: "'Orbitron',monospace" }}>
          NECESITAS ESTAR A MENOS DE 100 M
        </p>
      )}
    </div>
  );
};

// ⏳ Loading
const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 35%, #060d06, #04080f 55%, #020408)', position: 'relative', overflow: 'hidden' }}>
    <div className="crt-overlay" />
    <div className="crt-vignette" />
    <div className="crt-scanline" />
    <motion.div animate={{ y: ['-100%', '200vh'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', marginBottom: 36 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        style={{ width: 88, height: 88, border: '2px solid transparent', borderTopColor: '#22c55e', borderRightColor: 'rgba(34,197,94,0.2)', borderRadius: '50%' }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 12, border: '1.5px solid transparent', borderTopColor: '#4ade80', borderLeftColor: 'rgba(74,222,128,0.2)', borderRadius: '50%' }} />
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.7, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🦆</motion.div>
    </div>
    <div className="orb-font" style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, letterSpacing: '.25em', marginBottom: 4 }}>CARGANDO MAPA</div>
    <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, letterSpacing: '.18em', marginBottom: 30, fontFamily: "'Rajdhani',sans-serif" }}>CONCEPCIÓN · ANTIOQUIA</div>
    <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ height: '100%', background: 'linear-gradient(90deg, #16a34a, #4ade80)', borderRadius: 4, boxShadow: '0 0 10px rgba(74,222,128,0.5)' }} />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// 🎮 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
function Mapa() {
  const queryClient = useQueryClient();
  const { data: lugares = [], isLoading: cargandoLugares } = useQuery({
    queryKey: ['lugares'],
    queryFn: async () => {
      const r = await api.get('/lugares');
      return (r.data?.success && Array.isArray(r.data.data)) ? r.data.data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 min — los lugares casi no cambian
  });
  const [loading, setLoading]                       = useState(true);
  const [selectedLugar, setSelectedLugar]           = useState(null);
  const [showQuestLog, setShowQuestLog]             = useState(false);
  const [mostrarMenuExplorador, setMostrarMenuExplorador] = useState(false);
  const [playerLevel, setPlayerLevel]               = useState(1);
  const [discoveredPlaces, setDiscoveredPlaces]     = useState([]);
  const [userPosition, setUserPosition]             = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [lastVisitedPlace, setLastVisitedPlace]     = useState(null);
  const [recuerdoLugar, setRecuerdoLugar]           = useState(null); // lugar recién descubierto, para el prompt de "toma tu recuerdo"
  const [mostrarCamaraRecuerdo, setMostrarCamaraRecuerdo] = useState(false);
  const [isMobile, setIsMobile]                     = useState(window.innerWidth < 640);
  const [shouldLocate, setShouldLocate]             = useState(false);
  const [userResponded, setUserResponded]           = useState(false);
  const [xp, setXp]                                 = useState(0);
  const [mensajeGuia, setMensajeGuia]               = useState('');
  const [tipoGuia, setTipoGuia]                     = useState('normal');
  const [sistemaExp, setSistemaExp]                 = useState({ expRequerida: [], expAcumulada: [], expBase: 10 });
  const [mostrarGaleria, setMostrarGaleria]         = useState(false);
  const [lugarEspecial, setLugarEspecial]           = useState(null);
  const { data: comercios = [] } = useQuery({
    queryKey: ['comercios'],
    queryFn: async () => {
      const r = await api.get('/comercios');
      return Array.isArray(r.data) ? r.data : [];
    },
    staleTime: 10 * 60 * 1000,
  });
  const [selectedComercio, setSelectedComercio]      = useState(null);
  const [mostrarAnclar, setMostrarAnclar]           = useState(false);
  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos-activos'],
    queryFn: async () => {
      const r = await api.get('/eventos/activos');
      return r.data.eventos || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [respuestaEvento, setRespuestaEvento]       = useState('');
  const [userAvatar, setUserAvatar]                 = useState(null);
  const [publicGuides, setPublicGuides]             = useState([]);
  const [selectedGuia, setSelectedGuia]             = useState(null);
  const [showLevelUp, setShowLevelUp]               = useState(false);
  const [xpBurst, setXpBurst]                       = useState(null);
  // Antes: viewState completo vivía en el estado de React y se actualizaba
  // en cada frame de "onMove" — eso re-renderizaba todo el componente Mapa()
  // (pines, HUD, menús) 30-60 veces por segundo mientras arrastrabas el
  // mapa, causando el "trabado". Ahora el mapa es NO controlado
  // (initialViewState): Mapbox maneja su propia cámara internamente durante
  // el pan/zoom, sin tocar React. Solo mantenemos en estado el "bearing"
  // porque la brújula lo necesita para rotar su ícono, actualizado con un
  // umbral para no disparar renders de más.
  const INITIAL_VIEW_STATE = { longitude: -75.2592802, latitude: 6.3953494, zoom: 18, pitch: 55, bearing: 12 };
  const [bearing, setBearing] = useState(INITIAL_VIEW_STATE.bearing);

  // PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const navigate = useNavigate();
  const mapRef   = useRef(null);
  const socketRef = useRef(null);

  // ── helpers ──────────────────────────────────────────────────
  const mostrarMensajeGuia = useCallback((msg, tipo = 'normal', dur = 5000) => {
    setMensajeGuia(msg); setTipoGuia(tipo);
    setTimeout(() => setMensajeGuia(''), dur);
  }, []);

  const updateGuideInState = useCallback((guia) => {
    if (!guia || !guia.id) return;
    if (!guia.mostrar_avatar_publico) {
      setPublicGuides((prev) => prev.filter((item) => item.id !== guia.id));
      return;
    }
    setPublicGuides((prev) => {
      const existing = prev.find((item) => item.id === guia.id);
      if (existing) {
        return prev.map((item) => item.id === guia.id ? { ...item, ...guia } : item);
      }
      return [...prev, guia];
    });
  }, []);

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

  // ✅ Sincronización con backend: perfil y lugares descubiertos
  const cargarPerfilYDescubrimientos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('turista_token');
      if (!token) return;

      const perfilRes = await api.get('/auth/perfil');
      const usuario = perfilRes.data;
      setPlayerLevel(usuario.nivel || 1);
      setXp(usuario.xp_total || 0);
      if (usuario.foto_perfil) setUserAvatar(usuario.foto_perfil);

      const descRes = await api.get('/descubrimientos/mis-descubrimientos');
      const ids = (descRes.data || []).map(d => d.lugar_id);
      setDiscoveredPlaces(ids);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error cargando perfil/descubrimientos:', error);
    }
  }, []);

  useEffect(() => {
    cargarPerfilYDescubrimientos();
  }, [cargarPerfilYDescubrimientos]);

  const registrarDescubrimiento = async (lugar) => {
    if (!userPosition) { mostrarMensajeGuia('📍 Activa tu ubicación para explorar', 'pensativo', 3000); return false; }
    const dist = calcularDistancia(userPosition.lat, userPosition.lng, parseFloat(lugar.latitud), parseFloat(lugar.longitud));
    if (dist > 100) { mostrarMensajeGuia(`❌ Acércate más (${Math.round(dist)} m)`, 'pensativo', 3000); return false; }
    if (discoveredPlaces.includes(lugar.id)) { mostrarMensajeGuia(`📖 Ya hallaste ${lugar.nombre}`, 'normal', 2000); return false; }
    try {
      const res = await api.post('/descubrimientos/registrar', { lugar_id: lugar.id, latitud: userPosition.lat, longitud: userPosition.lng });
      if (res.data.success) {
        await cargarPerfilYDescubrimientos();
        setLastVisitedPlace(lugar);
        setTimeout(() => setLastVisitedPlace(null), 3000);
        setXpBurst({ x: window.innerWidth / 2, y: window.innerHeight / 2, xp: 10 });
        setRecuerdoLugar(lugar); // este NO se limpia solo con un timeout — se queda hasta que el turista lo cierre o tome su foto
        return true;
      }
    } catch (e) {
      mostrarMensajeGuia(e.response?.data?.error || 'Error al registrar', 'error', 3000);
    }
    return false;
  };

  const handleExplorarLugar = async (lugar) => {
    const ok = await registrarDescubrimiento(lugar);
    if (ok) setSelectedLugar(null);
  };

  const handleVerDetalles = (lugar) => {
    navigate(`/lugar/${lugar.id}`);
  };

  const handleAbrirMapa = (lugar) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lugar.latitud},${lugar.longitud}`;
    window.open(url, '_blank');
  };

  const calcularSistemaExp = (total) => {
    const pesos = [1, 1.5, 2, 2.5, 3];
    const suma = pesos.reduce((a, b) => a + b, 0);
    const expBase = 10;
    const expReq = pesos.map(p => Math.round((p / suma) * total * expBase));
    const expAcum = [];
    let acc = 0;
    expReq.forEach((curr) => { acc += curr; expAcum.push(acc); });
    return { expRequerida: expReq, expAcumulada: expAcum, expBase };
  };

  const calcularNivelPorXP = (xpActual, expAcumulada) => {
    for (let i = 0; i < expAcumulada.length; i++) {
      if (xpActual < expAcumulada[i]) return i + 1;
    }
    return expAcumulada.length + 1;
  };

  // Efectos (resize, beforeinstallprompt, etc.)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const cargarEsp = async () => {
      setLugarEspecial({ id: 'parque_principal_galeria', nombre: '📸 Parque Principal - Rincón de Recuerdos', latitud: 6.3953494, longitud: -75.2592802, tipo: 'especial' });
    };
    cargarEsp();
  }, []);

  useEffect(() => {
    const cargarGuiasPublicas = async () => {
      try {
        const response = await getPublicGuideAvatars();
        if (response.data?.success) {
          setPublicGuides(response.data.guias || []);
        }
      } catch (error) {
        console.error('Error cargando guías públicas:', error);
      }
    };
    cargarGuiasPublicas();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });
    socketRef.current = socket;
    socket.on('connect', () => console.log('🛰️ Conectado a WebSocket de guías públicas', socket.id));
    socket.on('guia-ubicacion-actualizada', (guia) => {
      if (!guia?.mostrar_avatar_publico) return;
      updateGuideInState(guia);
    });
    socket.on('guia-desconectado', (data) => {
      if (!data?.guiaId) return;
      if (data.mostrar_avatar_publico === false) {
        setPublicGuides((prev) => prev.filter((guia) => guia.id !== data.guiaId));
        return;
      }
      setPublicGuides((prev) => prev.map((guia) => (
        guia.id === data.guiaId ? { ...guia, conectado: false, latitud: data.latitud ?? guia.latitud, longitud: data.longitud ?? guia.longitud } : guia
      )));
    });
    return () => {
      socket.off('connect');
      socket.off('guia-ubicacion-actualizada');
      socket.off('guia-desconectado');
      socket.disconnect();
    };
  }, [updateGuideInState]);

  useEffect(() => {
    const h = (e) => { mostrarMensajeGuia(e.detail?.message || 'Sesión expirada.', 'error', 3000); setTimeout(() => navigate('/login'), 2500); };
    window.addEventListener('sessionExpired', h);
    return () => window.removeEventListener('sessionExpired', h);
  }, [navigate, mostrarMensajeGuia]);

  useEffect(() => {
    setLoading(cargandoLugares);
  }, [cargandoLugares]);

  useEffect(() => {
    if (!cargandoLugares && lugares.length > 0) {
      mostrarMensajeGuia('¡Bienvenido a Concepción! Descubre sus secretos.', 'bienvenida', 6000);
    }
  }, [cargandoLugares, lugares.length]);

  useEffect(() => {
    if (lugares.length > 0) {
      const sis = calcularSistemaExp(lugares.length);
      setSistemaExp(sis);
    }
  }, [lugares]);

  const handleCompletarEvento = async (eventoId, respuesta) => {
    try {
      const r = await api.post('/eventos/completar', { eventoId, respuesta });
      if (r.data.success) {
        mostrarMensajeGuia(`🎉 ¡Reto completado! +${r.data.xp_ganada} XP`, 'celebrando', 4000);
        setEventoSeleccionado(null);
        setRespuestaEvento('');
        queryClient.invalidateQueries({ queryKey: ['eventos-activos'] });
      }
    } catch {
      mostrarMensajeGuia('❌ Respuesta incorrecta. ¡Sigue intentando!', 'pensativo', 3000);
    }
  };

  // Manejo de ubicación
  useEffect(() => {
    const check = async () => {
      const s = localStorage.getItem('locationResponse');
      if (s === 'granted') { setShouldLocate(true); setLocationPermission('granted'); setUserResponded(true); return; }
      if (s === 'denied')  { setLocationPermission('denied');  setUserResponded(true); return; }
      if (navigator.permissions?.query) {
        try {
          const r = await navigator.permissions.query({ name: 'geolocation' });
          if (r.state === 'granted') { setShouldLocate(true); setLocationPermission('granted'); setUserResponded(true); localStorage.setItem('locationResponse', 'granted'); }
          else if (r.state === 'denied') { setLocationPermission('denied'); setUserResponded(true); localStorage.setItem('locationResponse', 'denied'); }
          else setTimeout(() => setShowLocationPrompt(true), 1200);
        } catch { setTimeout(() => setShowLocationPrompt(true), 1200); }
      } else { setTimeout(() => setShowLocationPrompt(true), 1200); }
    };
    check();
  }, []);

  useEffect(() => {
    if (!shouldLocate || !navigator.geolocation) return;
    const ok  = (p) => { setUserPosition({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }); setLocationPermission('granted'); };
    const err = (e) => { if (e.code === e.PERMISSION_DENIED) { setLocationPermission('denied'); localStorage.setItem('locationResponse', 'denied'); } };
    const id  = navigator.geolocation.watchPosition(ok, err, { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [shouldLocate]);

  const handleLugarClick = (lugar) => {
    setSelectedGuia(null);
    setSelectedLugar(lugar);
  };

  const handleGuiaClick = (guia) => {
    setSelectedLugar(null);
    setSelectedGuia(guia);
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') console.log('Usuario aceptó la instalación PWA');
        else console.log('Usuario rechazó la instalación');
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  if (loading) return <LoadingScreen />;
  if (!MAPBOX_TOKEN) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0010', color: '#f87171', textAlign: 'center' }}>
      <div><h2 style={{ fontSize: 18, fontWeight: 700 }}>Error de Configuración</h2><p style={{ fontSize: 13, marginTop: 6, opacity: .7 }}>No se detectó VITE_MAPBOX_TOKEN</p></div>
    </div>
  );

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <StyleInjector />

      <div className="crt-overlay" />
      <div className="crt-vignette" />
      <div className="crt-scanline" />

      <LevelUpBanner level={playerLevel} show={showLevelUp} />

      {xpBurst && (
        <XPBurst x={xpBurst.x} y={xpBurst.y} xp={xpBurst.xp} onDone={() => setXpBurst(null)} />
      )}

      <AnimatePresence>
        {recuerdoLugar && !mostrarCamaraRecuerdo && (
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            style={{
              position: 'fixed', bottom: 100, left: 16, right: 16, zIndex: 2100,
              background: 'rgba(26,46,26,0.95)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(232,199,117,0.4)', borderRadius: 16,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ fontSize: 28 }}>🎉</div>
            <div style={{ flex: 1, color: '#fdf6e3' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>¡Descubriste {recuerdoLugar.nombre}!</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Toma tu recuerdo antes de seguir explorando</div>
            </div>
            <button
              onClick={() => setMostrarCamaraRecuerdo(true)}
              style={{ background: '#e8c775', color: '#1a2e1a', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}
            >
              📸 Recuerdo
            </button>
            <button
              onClick={() => setRecuerdoLugar(null)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(253,246,227,0.6)', fontSize: 20, padding: 4 }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {mostrarCamaraRecuerdo && recuerdoLugar && (
        <TomarRecuerdo
          lugar={recuerdoLugar}
          nivelActual={playerLevel}
          onClose={() => { setMostrarCamaraRecuerdo(false); setRecuerdoLugar(null); }}
          onSubido={() => {}}
        />
      )}

      <HUDHeader
        playerLevel={playerLevel} discoveredPlaces={discoveredPlaces} totalLugares={lugares.length}
        xp={xp} sistemaExp={sistemaExp} lugarEspecial={lugarEspecial}
        onOpenGaleria={() => setMostrarGaleria(true)} onOpenAnclar={() => setMostrarAnclar(true)}
        onToggleQuestLog={() => setShowQuestLog(v => !v)}
        onToggleMenuExplorador={() => setMostrarMenuExplorador(v => !v)}
        showQuestLog={showQuestLog} isMobile={isMobile} userAvatar={userAvatar}
      />

      <BrujulaFuncional
        bearing={bearing}
        onRotate={() => {
          setBearing(0);
          mapRef.current?.easeTo?.({ bearing: 0, duration: 300 });
        }}
        isMobile={isMobile}
      />

      <RadarMini userPosition={userPosition} lugares={lugares} discoveredPlaces={discoveredPlaces} isMobile={isMobile} />

      <CompaneroVirtual
        mensaje={mensajeGuia} nivel={playerLevel} tipo={tipoGuia}
        emocion={lastVisitedPlace ? 'celebrando' : locationPermission === 'granted' ? 'feliz' : 'pensativo'}
      />

      {mostrarGaleria && <GaleriaFotos nivelUsuario={playerLevel} onCerrar={() => setMostrarGaleria(false)} />}

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

      <QuestLogPanel show={showQuestLog} lugares={lugares} discoveredPlaces={discoveredPlaces}
        onClose={() => setShowQuestLog(false)} onSelectLugar={setSelectedLugar} isMobile={isMobile} />

      <MenuExplorador nivel={playerLevel} xp={xp} lugaresDescubiertos={discoveredPlaces.length}
        totalLugares={lugares.length} fotoPerfil={userAvatar}
        isOpen={mostrarMenuExplorador} onClose={() => setMostrarMenuExplorador(false)} />

      {userPosition && (
        <motion.button onClick={() => mapRef.current?.flyTo?.({ center: [userPosition.lng, userPosition.lat], zoom: 17, duration: 800 })}
          whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.92 }}
          title="Centrar en mi ubicación"
          className="hud-btn hud-btn-blue"
          style={{ position: 'absolute', bottom: isMobile ? 100 : 108, left: isMobile ? 12 : 16, width: isMobile ? 42 : 46, height: isMobile ? 42 : 46, borderRadius: '50%', zIndex: 1000 }}>
          <Navigation size={isMobile ? 19 : 21} color="#60a5fa" />
        </motion.button>
      )}

      {showInstallButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={handleInstallClick}
          className="hud-btn hud-btn-gold"
          style={{
            position: 'absolute',
            bottom: isMobile ? 160 : 170,
            left: isMobile ? 12 : 16,
            width: isMobile ? 42 : 46,
            height: isMobile ? 42 : 46,
            borderRadius: '50%',
            zIndex: 1100,
            background: 'rgba(34,197,94,0.85)',
            border: '1px solid rgba(251,191,36,0.8)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          title="Instalar aplicación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24' }}>
            <path d="M12 5v14M5 12h14" />
            <path d="M5 12h14" />
          </svg>
        </motion.button>
      )}

      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        onMove={(evt) => {
          // Solo nos interesa el bearing (para la brújula). Solo actualizamos
          // si cambió de verdad (>=1°) — durante un pan normal el bearing no
          // cambia, así que esto ya no dispara ningún render mientras
          // arrastras el mapa.
          const nuevoBearing = evt.viewState.bearing;
          setBearing(prev => (Math.abs(prev - nuevoBearing) >= 1 ? nuevoBearing : prev));
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        onClick={() => { setSelectedLugar(null); setSelectedGuia(null); }}
      >
        <Map3DEffect />

        {/* Avatar jugador sin bloquear clics */}
        {userPosition && (
          <Marker
            longitude={userPosition.lng}
            latitude={userPosition.lat}
            anchor="center"
            style={{ pointerEvents: 'none', zIndex: 500 }}
          >
            <AvatarJugador level={playerLevel} isMobile={isMobile} />
          </Marker>
        )}

        {lugares.map((lugar) => (
          <Marker key={lugar.id}
            longitude={parseFloat(lugar.longitud)} latitude={parseFloat(lugar.latitud)}
            anchor="bottom"
            onClick={(e) => { e.originalEvent.stopPropagation(); handleLugarClick(lugar); }}
          >
            <LugarPin lugar={lugar} discovered={discoveredPlaces.includes(lugar.id)} isMobile={isMobile} onClick={() => handleLugarClick(lugar)} />
          </Marker>
        ))}

        {comercios.map((comercio) => (
          <Marker key={`comercio_${comercio.id}`}
            longitude={parseFloat(comercio.longitud)} latitude={parseFloat(comercio.latitud)}
            anchor="bottom"
            onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedComercio(comercio); }}
          >
            <ComercioPin comercio={comercio} isMobile={isMobile} />
          </Marker>
        ))}

        {lugarEspecial && (
          <Marker longitude={parseFloat(lugarEspecial.longitud)} latitude={parseFloat(lugarEspecial.latitud)} anchor="bottom" style={{ zIndex: 1500 }}>
            <motion.div
              animate={{ y: [0, -7, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
              onClick={() => {
                setMostrarGaleria(true);
                mostrarMensajeGuia(playerLevel >= 5 ? '📸 ¡Galería de Recuerdos!' : '🔒 Nivel 5 necesario para subir fotos.', playerLevel >= 5 ? 'celebrando' : 'pensativo', 4000);
              }}
              style={{
                width: isMobile ? 60 : 72, height: isMobile ? 60 : 72,
                background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fbbf24 55%, #d97706)',
                borderRadius: '50%', border: '4px solid rgba(255,255,255,0.88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMobile ? 28 : 34,
                boxShadow: '0 0 40px rgba(251,191,36,0.9), 0 0 80px rgba(251,191,36,0.4), 0 8px 28px rgba(0,0,0,0.6)',
                cursor: 'pointer', position: 'relative',
              }}
            >
              <span>📸</span>
              {playerLevel < 5 && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 16 }}>🔒</span>}
            </motion.div>
          </Marker>
        )}

        {publicGuides.filter(guia => guia.latitud && guia.longitud).map((guia) => (
          <Marker key={`guia_${guia.id}`} longitude={parseFloat(guia.longitud)} latitude={parseFloat(guia.latitud)} anchor="bottom" style={{ zIndex: 1400 }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleGuiaClick(guia);
              }}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <AvatarGuia conectado={guia.conectado} isMobile={isMobile} />
            </div>
          </Marker>
        ))}

        {eventos.map((evento) => (
          <Marker key={`ev_${evento.id}`} longitude={parseFloat(evento.longitud)} latitude={parseFloat(evento.latitud)} onClick={() => setEventoSeleccionado(evento)}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}
              style={{ width: 44, height: 44, background: 'radial-gradient(circle at 35% 35%, #fbbf24, #b45309)', borderRadius: '50%', border: '2px solid rgba(251,191,36,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', boxShadow: '0 0 24px rgba(251,191,36,0.55), 0 4px 14px rgba(0,0,0,0.5)' }}>❓</motion.div>
          </Marker>
        ))}

        {selectedGuia && selectedGuia.latitud && selectedGuia.longitud && (
          <Popup
            longitude={parseFloat(selectedGuia.longitud)} latitude={parseFloat(selectedGuia.latitud)}
            onClose={() => setSelectedGuia(null)} closeButton={true} closeOnClick={false}
            anchor="auto" offset={20} maxWidth="260px"
            style={{ zIndex: 2000 }}
          >
            <div style={{ padding: '14px', width: isMobile ? 220 : 240, color: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#0f172a' }}>
                  {selectedGuia.avatar_url ? (
                    <img src={selectedGuia.avatar_url} alt={selectedGuia.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{selectedGuia.nombre?.charAt(0) || 'G'}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedGuia.nombre}</div>
                  <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.75)' }}>{selectedGuia.conectado ? 'Guía en línea' : 'Guía desconectado'}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(226,232,240,0.82)' }}>
                {selectedGuia.mostrar_avatar_publico ? 'Visibilidad pública activada' : 'Avatar no visible públicamente'}
              </div>
            </div>
          </Popup>
        )}

        {selectedLugar && (
          <Popup
            longitude={parseFloat(selectedLugar.longitud)} latitude={parseFloat(selectedLugar.latitud)}
            onClose={() => setSelectedLugar(null)} closeButton={true} closeOnClick={false}
            anchor="auto" offset={20} maxWidth="260px"
            style={{ zIndex: 3000 }}
          >
            <LugarPopupContent
              lugar={selectedLugar}
              discovered={discoveredPlaces.includes(selectedLugar.id)}
              userPosition={userPosition}
              onExplorar={() => handleExplorarLugar(selectedLugar)}
              onVerDetalles={() => handleVerDetalles(selectedLugar)}
              onAbrirMapa={() => handleAbrirMapa(selectedLugar)}
              calcularDistancia={calcularDistancia}
            />
          </Popup>
        )}

        {selectedComercio && (
          <Popup
            longitude={parseFloat(selectedComercio.longitud)}
            latitude={parseFloat(selectedComercio.latitud)}
            onClose={() => setSelectedComercio(null)}
            closeButton={true}
            closeOnClick={false}
            anchor="auto"
            maxWidth="250px"
            offset={16}
          >
            <ComercioPopupContent
              comercio={selectedComercio}
              onVerFicha={() => navigate(`/comercio/${selectedComercio.id}`)}
            />
          </Popup>
        )}
      </Map>

      {mostrarAnclar && <AnclarGuardian userPosition={userPosition} onClose={() => setMostrarAnclar(false)} onAnclado={() => setMostrarAnclar(false)} />}

      <AnimatePresence>
        {eventoSeleccionado && (
          <EventoModal evento={eventoSeleccionado} respuesta={respuestaEvento} setRespuesta={setRespuestaEvento}
            onResponder={() => handleCompletarEvento(eventoSeleccionado.id, respuestaEvento)}
            onClose={() => setEventoSeleccionado(null)} />
        )}
      </AnimatePresence>

      <EstadoReserva />
    </div>
  );
}

export default Mapa;