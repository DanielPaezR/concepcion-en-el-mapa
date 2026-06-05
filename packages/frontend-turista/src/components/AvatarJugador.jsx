import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// SVGs por nivel — mejorados
// ─────────────────────────────────────────────

const AvatarNivel1 = () => (
  <svg viewBox="0 0 60 74" width="88" height="104">
    <ellipse cx="30" cy="16" rx="18" ry="5" fill="#92400e" />
    <rect x="16" y="11" width="28" height="10" rx="4" fill="#b45309" />
    <rect x="16" y="18" width="28" height="2.5" rx="1" fill="#d97706" />
    <ellipse cx="30" cy="27" rx="12" ry="13" fill="#fcd9b0" />
    <path d="M22 22 Q30 19 38 22" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="25" cy="27" r="2.5" fill="#1e293b" />
    <circle cx="35" cy="27" r="2.5" fill="#1e293b" />
    <circle cx="26" cy="26.2" r=".9" fill="white" />
    <circle cx="36" cy="26.2" r=".9" fill="white" />
    <ellipse cx="30" cy="31" rx="1" ry=".7" fill="#f6b73c" opacity=".4" />
    <path d="M26 33 Q30 36 34 33" stroke="#92400e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    <rect x="20" y="39" width="20" height="22" rx="4" fill="#065f46" />
    <line x1="30" y1="42" x2="30" y2="57" stroke="#22c55e" strokeWidth="1" />
    <rect x="38" y="41" width="8" height="14" rx="3" fill="#78350f" stroke="#d97706" strokeWidth=".6" />
    <line x1="38" y1="46" x2="46" y2="46" stroke="#92400e" strokeWidth=".8" />
    <line x1="20" y1="43" x2="12" y2="52" stroke="#065f46" strokeWidth="5" strokeLinecap="round" />
    <circle cx="12" cy="52" r="3.5" fill="#fcd9b0" />
    <line x1="40" y1="43" x2="47" y2="51" stroke="#065f46" strokeWidth="5" strokeLinecap="round" />
    <circle cx="47" cy="51" r="3.5" fill="#fcd9b0" />
    <rect x="21" y="60" width="7" height="13" rx="3" fill="#1e293b" />
    <rect x="32" y="60" width="7" height="13" rx="3" fill="#1e293b" />
    <ellipse cx="24" cy="73" rx="5.5" ry="3" fill="#0f172a" />
    <ellipse cx="35" cy="73" rx="5.5" ry="3" fill="#0f172a" />
    <line x1="20" y1="73" x2="29" y2="73" stroke="#22c55e" strokeWidth="1" />
    <line x1="31" y1="73" x2="40" y2="73" stroke="#22c55e" strokeWidth="1" />
  </svg>
);

const AvatarNivel2 = () => (
  <svg viewBox="0 0 60 74" width="88" height="104">
    <ellipse cx="30" cy="16" rx="18" ry="5" fill="#1e3a5f" />
    <rect x="16" y="10" width="28" height="11" rx="4" fill="#1d4ed8" />
    <path d="M42 8 Q48 3 45 12 Q43 14 42 11Z" fill="#22c55e" />
    <rect x="16" y="18" width="28" height="2.5" rx="1" fill="#3b82f6" />
    <ellipse cx="30" cy="27" rx="12" ry="13" fill="#fcd9b0" />
    <path d="M24 22 L27 26" stroke="#b45309" strokeWidth="1" strokeLinecap="round" />
    <path d="M23 24 L27 24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M33 24 L37 24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="25" cy="26" r="1.5" fill="#1e293b" />
    <circle cx="35" cy="26" r="1.5" fill="#1e293b" />
    <path d="M25 33 Q30 35 35 33" stroke="#92400e" strokeWidth="1.2" fill="none" />
    <rect x="20" y="39" width="20" height="22" rx="4" fill="#1d4ed8" />
    <rect x="25" y="39" width="10" height="22" rx="2" fill="#1e3a8a" />
    <line x1="30" y1="42" x2="30" y2="57" stroke="#60a5fa" strokeWidth="1" />
    <path d="M10 40 Q10 50 16 54 Q22 50 22 40Z" fill="#94a3b8" stroke="#475569" strokeWidth=".8" />
    <path d="M13 45 L19 45" stroke="#1e293b" strokeWidth="1.2" />
    <path d="M16 43 L16 49" stroke="#1e293b" strokeWidth="1.2" />
    <line x1="42" y1="38" x2="50" y2="55" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
    <rect x="39" y="37" width="10" height="3" rx="1" fill="#6b7280" transform="rotate(-30 44 38.5)" />
    <circle cx="40" cy="36" r="2.5" fill="#475569" />
    <line x1="20" y1="43" x2="10" y2="50" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
    <circle cx="10" cy="50" r="3.5" fill="#fcd9b0" />
    <rect x="21" y="60" width="7" height="13" rx="3" fill="#1e3a8a" />
    <rect x="32" y="60" width="7" height="13" rx="3" fill="#1e3a8a" />
    <ellipse cx="24" cy="73" rx="5.5" ry="3" fill="#1e293b" />
    <ellipse cx="35" cy="73" rx="5.5" ry="3" fill="#1e293b" />
    <line x1="19" y1="73" x2="29" y2="73" stroke="#3b82f6" strokeWidth="1" />
    <line x1="31" y1="73" x2="41" y2="73" stroke="#3b82f6" strokeWidth="1" />
  </svg>
);

const AvatarNivel3 = () => (
  <svg viewBox="0 0 64 78" width="88" height="104">
    <ellipse cx="32" cy="14" rx="16" ry="10" fill="#475569" />
    <rect x="18" y="10" width="28" height="12" rx="3" fill="#64748b" />
    <rect x="28" y="5" width="8" height="8" rx="2" fill="#f59e0b" />
    <rect x="20" y="18" width="24" height="6" rx="2" fill="#374151" />
    <ellipse cx="32" cy="30" rx="11" ry="10" fill="#fcd9b0" />
    <path d="M23 26 Q27 24 31 25" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M33 25 Q37 24 41 26" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="27" cy="29" r="2.5" fill="#1e293b" />
    <circle cx="37" cy="29" r="2.5" fill="#1e293b" />
    <circle cx="28" cy="28.3" r=".9" fill="white" />
    <circle cx="38" cy="28.3" r=".9" fill="white" />
    <circle cx="27" cy="29" r="1.2" fill="#6366f1" opacity=".7" />
    <circle cx="37" cy="29" r="1.2" fill="#6366f1" opacity=".7" />
    <rect x="20" y="40" width="24" height="24" rx="4" fill="#475569" />
    <path d="M22 42 L32 38 L42 42 L42 56 L32 62 L22 56Z" fill="#64748b" />
    <path d="M32 40 L32 60" stroke="#a5b4fc" strokeWidth=".8" opacity=".7" />
    <path d="M24 50 L40 50" stroke="#a5b4fc" strokeWidth=".8" opacity=".7" />
    <circle cx="32" cy="50" r="3.5" fill="#6366f1" opacity=".8" />
    <ellipse cx="20" cy="42" rx="7" ry="5" fill="#64748b" stroke="#818cf8" strokeWidth=".8" />
    <ellipse cx="44" cy="42" rx="7" ry="5" fill="#64748b" stroke="#818cf8" strokeWidth=".8" />
    <path d="M6 40 Q5 53 13 58 Q21 53 20 40Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" />
    <path d="M13 44 L13 55" stroke="#93c5fd" strokeWidth="1.5" />
    <path d="M9 49 L17 49" stroke="#93c5fd" strokeWidth="1.5" />
    <line x1="46" y1="36" x2="58" y2="56" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
    <rect x="43" y="35" width="12" height="4" rx="1.5" fill="#94a3b8" transform="rotate(-30 49 37)" />
    <circle cx="44.5" cy="34" r="3" fill="#f59e0b" />
    <rect x="22" y="63" width="8" height="13" rx="3" fill="#374151" />
    <rect x="34" y="63" width="8" height="13" rx="3" fill="#374151" />
    <ellipse cx="26" cy="76" rx="6" ry="3" fill="#1e293b" />
    <ellipse cx="38" cy="76" rx="6" ry="3" fill="#1e293b" />
    <line x1="21" y1="76" x2="31" y2="76" stroke="#6366f1" strokeWidth="1" />
    <line x1="33" y1="76" x2="43" y2="76" stroke="#6366f1" strokeWidth="1" />
  </svg>
);

const AvatarNivel4 = () => (
  <svg viewBox="0 0 68 82" width="88" height="104">
    <path d="M16 16 Q10 8 14 4 Q18 10 22 14Z" fill="#92400e" />
    <path d="M52 16 Q58 8 54 4 Q50 10 46 14Z" fill="#92400e" />
    <ellipse cx="34" cy="15" rx="18" ry="11" fill="#92400e" />
    <rect x="18" y="11" width="32" height="14" rx="4" fill="#b45309" />
    <rect x="22" y="8" width="24" height="8" rx="3" fill="#f59e0b" />
    <rect x="20" y="21" width="28" height="7" rx="3" fill="#78350f" />
    <path d="M20 24 L48 24" stroke="#f59e0b" strokeWidth=".8" />
    <ellipse cx="34" cy="33" rx="12" ry="11" fill="#fcd9b0" />
    <path d="M26 29 L23 31" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M42 29 L45 31" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="27" cy="32" r="2.2" fill="#1e293b" />
    <circle cx="41" cy="32" r="2.2" fill="#1e293b" />
    <circle cx="28" cy="31.2" r=".9" fill="white" />
    <circle cx="42" cy="31.2" r=".9" fill="white" />
    <circle cx="27" cy="32" r="1.1" fill="#f59e0b" opacity=".7" />
    <circle cx="41" cy="32" r="1.1" fill="#f59e0b" opacity=".7" />
    <path d="M26 40 Q34 44 42 40" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="20" y="43" width="28" height="26" rx="4" fill="#92400e" />
    <path d="M22 44 L34 39 L46 44 L46 60 L34 67 L22 60Z" fill="#b45309" />
    <path d="M34 41 L34 64" stroke="#f59e0b" strokeWidth="1" />
    <path d="M24 52 L44 52" stroke="#f59e0b" strokeWidth="1" />
    <circle cx="34" cy="52" r="4.5" fill="#f59e0b" opacity=".7" />
    <circle cx="34" cy="52" r="2" fill="#fde68a" />
    <path d="M14 42 Q8 44 10 52 Q16 54 22 50Z" fill="#b45309" />
    <path d="M54 42 Q60 44 58 52 Q52 54 46 50Z" fill="#b45309" />
    <circle cx="11" cy="47" r="3.5" fill="#f59e0b" />
    <circle cx="57" cy="47" r="3.5" fill="#f59e0b" />
    <path d="M16 46 Q10 62 18 74" stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".85" />
    <path d="M52 46 Q58 62 50 74" stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".85" />
    <line x1="58" y1="34" x2="62" y2="68" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="60" cy="36" rx="8" ry="10" fill="#f59e0b" opacity=".9" transform="rotate(15 60 36)" />
    <ellipse cx="61" cy="66" rx="7" ry="9" fill="#f59e0b" opacity=".9" transform="rotate(-15 61 66)" />
    <rect x="22" y="68" width="10" height="12" rx="3" fill="#78350f" />
    <rect x="36" y="68" width="10" height="12" rx="3" fill="#78350f" />
    <ellipse cx="27" cy="80" rx="7" ry="3.5" fill="#1e293b" />
    <ellipse cx="41" cy="80" rx="7" ry="3.5" fill="#1e293b" />
    <line x1="21" y1="80" x2="33" y2="80" stroke="#f59e0b" strokeWidth="1.2" />
    <line x1="35" y1="80" x2="47" y2="80" stroke="#f59e0b" strokeWidth="1.2" />
  </svg>
);

const AvatarNivel5 = () => (
  <svg viewBox="0 0 72 88" width="88" height="104">
    <path d="M20 12 L24 4 L28 12 L34 2 L40 12 L44 4 L48 12 L52 16 L20 16Z" fill="#f59e0b" />
    <circle cx="24" cy="4" r="2.5" fill="#ef4444" />
    <circle cx="34" cy="2" r="3" fill="#ef4444" />
    <circle cx="44" cy="4" r="2.5" fill="#ef4444" />
    <ellipse cx="36" cy="22" rx="18" ry="12" fill="#0f172a" />
    <rect x="20" y="18" width="32" height="14" rx="5" fill="#1e293b" />
    <rect x="20" y="27" width="32" height="8" rx="3" fill="#0f172a" />
    <ellipse cx="36" cy="31" rx="10" ry="3" fill="#991b1b" opacity=".6" />
    <ellipse cx="36" cy="31" rx="5" ry="1.5" fill="#ef4444" />
    <path d="M22 21 L22 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <path d="M26 20 L26 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <path d="M46 20 L46 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <path d="M50 21 L50 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <ellipse cx="36" cy="40" rx="10" ry="9" fill="#fcd9b0" />
    <circle cx="31" cy="39" r="3.2" fill="#1e293b" />
    <circle cx="41" cy="39" r="3.2" fill="#1e293b" />
    <circle cx="31" cy="39" r="1.6" fill="#ef4444" />
    <circle cx="41" cy="39" r="1.6" fill="#ef4444" />
    <circle cx="32" cy="38" r=".7" fill="rgba(255,255,255,.6)" />
    <circle cx="42" cy="38" r=".7" fill="rgba(255,255,255,.6)" />
    <path d="M29 36 L32 40" stroke="#dc2626" strokeWidth=".8" />
    <path d="M40 37 L43 40" stroke="#dc2626" strokeWidth=".8" />
    <rect x="18" y="49" width="36" height="28" rx="4" fill="#0f172a" />
    <path d="M20 50 L36 44 L52 50 L52 68 L36 76 L20 68Z" fill="#1e293b" />
    <path d="M36 46 L36 72" stroke="#ef4444" strokeWidth=".8" opacity=".6" />
    <path d="M22 59 L50 59" stroke="#ef4444" strokeWidth=".8" opacity=".6" />
    <circle cx="36" cy="59" r="5" fill="#991b1b" opacity=".8" />
    <circle cx="36" cy="59" r="2.5" fill="#ef4444" />
    <path d="M10 48 Q4 50 6 60 Q12 63 20 58Z" fill="#1e293b" stroke="#ef4444" strokeWidth=".5" />
    <path d="M62 48 Q68 50 66 60 Q60 63 52 58Z" fill="#1e293b" stroke="#ef4444" strokeWidth=".5" />
    <circle cx="8" cy="54" r="3.5" fill="#ef4444" />
    <circle cx="64" cy="54" r="3.5" fill="#ef4444" />
    <path d="M14 52 Q6 68 14 80 Q20 82 22 72" stroke="#dc2626" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".85" />
    <path d="M58 52 Q66 68 58 80 Q52 82 50 72" stroke="#dc2626" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".85" />
    <line x1="62" y1="36" x2="68" y2="74" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
    <path d="M57 37 L70 43" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="60" cy="35" r="5" fill="#ef4444" />
    <rect x="20" y="76" width="12" height="10" rx="3" fill="#1e293b" />
    <rect x="40" y="76" width="12" height="10" rx="3" fill="#1e293b" />
    <path d="M24 78 L24 84" stroke="#ef4444" strokeWidth=".8" opacity=".5" />
    <path d="M44 78 L44 84" stroke="#ef4444" strokeWidth=".8" opacity=".5" />
    <ellipse cx="26" cy="86" rx="8" ry="4" fill="#0f172a" />
    <ellipse cx="46" cy="86" rx="8" ry="4" fill="#0f172a" />
    <line x1="18" y1="86" x2="34" y2="86" stroke="#dc2626" strokeWidth="1.2" />
    <line x1="38" y1="86" x2="54" y2="86" stroke="#dc2626" strokeWidth="1.2" />
  </svg>
);

// ─────────────────────────────────────────────
// Configuración visual por nivel
// ─────────────────────────────────────────────
const NIVEL_CONFIG = {
  1: {
    label: '🌲 NIVEL 1 · NOVATO',
    bg: 'linear-gradient(145deg,#14532d,#052e16)',
    border: '#22c55e',
    ringColor: 'rgba(34,197,94,.5)',
    ring2Color: 'rgba(34,197,94,.2)',
    glow: 'rgba(34,197,94,.3)',
    labelBg: '#14532d', labelColor: '#4ade80', labelBorder: '#22c55e',
    nombre: 'Kai el Explorador', rango: 'AVENTURERO NOVATO',
    xp: 1200, xpMax: 3000,
    xpBg: 'linear-gradient(90deg,#065f46,#22c55e 80%,#86efac)',
    stats: [
      { l: 'EXPLORAR', v: 42, c: '#4ade80' }, { l: 'FUERZA', v: 28, c: '#86efac' },
      { l: 'AGILIDAD', v: 35, c: '#34d399' }, { l: 'CARISMA', v: 31, c: '#6ee7b7' },
    ],
    logros: [
      { e: '🌿', t: 'Primer paso', bg: '#14532d', b: '#22c55e', c: '#4ade80' },
      { e: '🗺️', t: 'Explorador', bg: '#064e3b', b: '#34d399', c: '#6ee7b7' },
    ],
    particles: ['#22c55e', '#4ade80', '#86efac', '#d1fae5'],
    spinColor: 'rgba(34,197,94,.2)', spin2Color: 'rgba(34,197,94,.3)', orbitDots: '#22c55e',
  },
  2: {
    label: '⚔️ NIVEL 2 · CURTIDO',
    bg: 'linear-gradient(145deg,#1c3a5e,#0f2040)',
    border: '#60a5fa',
    ringColor: 'rgba(96,165,250,.55)', ring2Color: 'rgba(96,165,250,.2)', glow: 'rgba(96,165,250,.3)',
    labelBg: '#1c3a5e', labelColor: '#93c5fd', labelBorder: '#3b82f6',
    nombre: 'Rune el Curtido', rango: 'EXPLORADOR VETERANO',
    xp: 4800, xpMax: 8000,
    xpBg: 'linear-gradient(90deg,#1e3a8a,#3b82f6 80%,#93c5fd)',
    stats: [
      { l: 'EXPLORAR', v: 61, c: '#60a5fa' }, { l: 'FUERZA', v: 55, c: '#93c5fd' },
      { l: 'AGILIDAD', v: 58, c: '#bfdbfe' }, { l: 'CARISMA', v: 48, c: '#7dd3fc' },
    ],
    logros: [
      { e: '⚔️', t: 'Primera sangre', bg: '#1e3a8a', b: '#3b82f6', c: '#93c5fd' },
      { e: '🛡️', t: 'Defensor', bg: '#1c3a5e', b: '#60a5fa', c: '#bfdbfe' },
      { e: '🗺️', t: 'Rastreador', bg: '#0c2a4a', b: '#38bdf8', c: '#7dd3fc' },
    ],
    particles: ['#60a5fa', '#93c5fd', '#bfdbfe', '#38bdf8'],
    spinColor: 'rgba(96,165,250,.2)', spin2Color: 'rgba(96,165,250,.35)', orbitDots: '#60a5fa',
  },
  3: {
    label: '🛡️ NIVEL 3 · GUERRERO',
    bg: 'linear-gradient(145deg,#312e81,#1a1740)',
    border: '#818cf8',
    ringColor: 'rgba(129,140,248,.6)', ring2Color: 'rgba(129,140,248,.2)', glow: 'rgba(129,140,248,.35)',
    labelBg: '#312e81', labelColor: '#a5b4fc', labelBorder: '#6366f1',
    nombre: 'Vex el Guerrero', rango: 'MAESTRO DE COMBATE',
    xp: 9100, xpMax: 15000,
    xpBg: 'linear-gradient(90deg,#312e81,#6366f1 80%,#a5b4fc)',
    stats: [
      { l: 'EXPLORAR', v: 74, c: '#818cf8' }, { l: 'FUERZA', v: 79, c: '#a5b4fc' },
      { l: 'AGILIDAD', v: 68, c: '#c7d2fe' }, { l: 'CARISMA', v: 62, c: '#6366f1' },
    ],
    logros: [
      { e: '🛡️', t: 'Invencible', bg: '#312e81', b: '#6366f1', c: '#a5b4fc' },
      { e: '⚡', t: 'Élite', bg: '#2e1065', b: '#818cf8', c: '#c4b5fd' },
      { e: '🔮', t: 'Arcano', bg: '#1e1b4b', b: '#6366f1', c: '#a5b4fc' },
      { e: '⚔️', t: 'Veterano', bg: '#1e1b4b', b: '#4f46e5', c: '#c7d2fe' },
    ],
    particles: ['#818cf8', '#a5b4fc', '#c7d2fe', '#6366f1', '#e0e7ff'],
    spinColor: 'rgba(129,140,248,.2)', spin2Color: 'rgba(129,140,248,.4)', orbitDots: '#818cf8',
  },
  4: {
    label: '🔥 NIVEL 4 · CAMPEÓN',
    bg: 'linear-gradient(145deg,#451a03,#1c0900)',
    border: '#f59e0b',
    ringColor: 'rgba(245,158,11,.6)', ring2Color: 'rgba(245,158,11,.2)', glow: 'rgba(245,158,11,.4)',
    labelBg: '#451a03', labelColor: '#fcd34d', labelBorder: '#f59e0b',
    nombre: 'Aldric el Campeón', rango: 'CAMPEÓN DE LAS TIERRAS',
    xp: 22500, xpMax: 30000,
    xpBg: 'linear-gradient(90deg,#92400e,#f59e0b 80%,#fde68a)',
    stats: [
      { l: 'EXPLORAR', v: 85, c: '#fbbf24' }, { l: 'FUERZA', v: 91, c: '#fcd34d' },
      { l: 'AGILIDAD', v: 78, c: '#fde68a' }, { l: 'CARISMA', v: 72, c: '#f59e0b' },
    ],
    logros: [
      { e: '🔥', t: 'Incombustible', bg: '#451a03', b: '#f59e0b', c: '#fcd34d' },
      { e: '👑', t: 'Campeón', bg: '#78350f', b: '#fbbf24', c: '#fde68a' },
      { e: '🪓', t: 'Berserker', bg: '#3b0f00', b: '#dc2626', c: '#fca5a5' },
      { e: '⚡', t: 'Legendario', bg: '#451a03', b: '#f59e0b', c: '#fcd34d' },
    ],
    particles: ['#f59e0b', '#fbbf24', '#fde68a', '#dc2626', '#fb923c'],
    spinColor: 'rgba(245,158,11,.2)', spin2Color: 'rgba(245,158,11,.4)', orbitDots: '#f59e0b',
  },
  5: {
    label: '💀 NIVEL 5 · GUARDIÁN',
    bg: 'linear-gradient(145deg,#1a0505,#0a0a0a)',
    border: '#dc2626',
    ringColor: 'rgba(220,38,38,.6)', ring2Color: 'rgba(220,38,38,.2)', glow: 'rgba(220,38,38,.45)',
    labelBg: '#450a0a', labelColor: '#fca5a5', labelBorder: '#dc2626',
    nombre: 'Malachar el Guardián', rango: 'SEÑOR DE LA OSCURIDAD',
    xp: 45000, xpMax: 50000,
    xpBg: 'linear-gradient(90deg,#450a0a,#dc2626 75%,#fca5a5)',
    stats: [
      { l: 'EXPLORAR', v: 97, c: '#f87171' }, { l: 'FUERZA', v: 99, c: '#fca5a5' },
      { l: 'AGILIDAD', v: 92, c: '#fecaca' }, { l: 'CARISMA', v: 88, c: '#dc2626' },
    ],
    logros: [
      { e: '💀', t: 'Inmortal', bg: '#450a0a', b: '#dc2626', c: '#fca5a5' },
      { e: '🔴', t: 'Maldito', bg: '#3b0a0a', b: '#ef4444', c: '#fecaca' },
      { e: '⚡', t: 'Legendario', bg: '#450a0a', b: '#dc2626', c: '#fca5a5' },
      { e: '👁️', t: 'Omnisciente', bg: '#1a0505', b: '#7f1d1d', c: '#fca5a5' },
    ],
    particles: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#7f1d1d'],
    spinColor: 'rgba(220,38,38,.2)', spin2Color: 'rgba(220,38,38,.4)', orbitDots: '#dc2626',
  },
};

const AVATAR_SVG = { 1: AvatarNivel1, 2: AvatarNivel2, 3: AvatarNivel3, 4: AvatarNivel4, 5: AvatarNivel5 };

// ─────────────────────────────────────────────
// CSS de animaciones (inyectado una sola vez)
// ─────────────────────────────────────────────
const AVATAR_STYLES = `
  @keyframes jFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes jPulse{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(1.22);opacity:.8}}
  @keyframes jPulse2{0%,100%{transform:scale(1);opacity:.15}50%{transform:scale(1.35);opacity:.5}}
  @keyframes jSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes jSpinR{from{transform:rotate(0)}to{transform:rotate(-360deg)}}
  @keyframes jParticle{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-55px) scale(0);opacity:0}}
  @keyframes jShimmer{0%,100%{opacity:.45}50%{opacity:1}}
  @keyframes jBadge{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.12) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
  @keyframes jXp{from{width:0}to{width:var(--xw)}}
  @keyframes jStatIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
`;

let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected) return;
  const s = document.createElement('style');
  s.textContent = AVATAR_STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
};

// ─────────────────────────────────────────────
// Partículas
// ─────────────────────────────────────────────
const Particles = ({ colors }) => {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const spawn = () => {
      const p = document.createElement('div');
      const a = Math.random() * 360, r = 60 + Math.random() * 16;
      const rad = a * Math.PI / 180;
      const x = 85 + Math.cos(rad) * r - 3, y = 85 + Math.sin(rad) * r - 3;
      const c = colors[Math.floor(Math.random() * colors.length)];
      const sz = 3 + Math.random() * 4;
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;border-radius:50%;background:${c};animation:jParticle ${1.1 + Math.random() * .9}s ease-out forwards;pointer-events:none`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1700);
    };
    const id = setInterval(spawn, 260);
    for (let i = 0; i < 5; i++) setTimeout(spawn, i * 100);
    return () => clearInterval(id);
  }, [colors]);
  return <div ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', borderRadius: '50%' }} />;
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const AvatarJugador = ({ level = 1, isMobile = false, conectado = false }) => {
  useEffect(() => { injectStyles(); }, []);

  const n = Math.min(Math.max(Math.floor(level), 1), 5);
  const c = NIVEL_CONFIG[n];
  const SvgComponent = AVATAR_SVG[n];
  const xpPct = (c.xp / c.xpMax * 100).toFixed(1);
  const xpRest = (c.xpMax - c.xp).toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem 2rem', gap: 0 }}>

      {/* Badge de nivel */}
      <div style={{
        background: c.labelBg, color: c.labelColor, border: `1.5px solid ${c.labelBorder}`,
        borderRadius: 20, padding: '3px 14px', fontSize: 11, fontWeight: 700,
        letterSpacing: '.1em', marginBottom: 14, whiteSpace: 'nowrap',
        animation: 'jBadge .6s cubic-bezier(.34,1.56,.64,1) both',
        boxShadow: `0 0 16px ${c.glow}`,
      }}>
        {c.label}
      </div>

      {/* Contenedor del avatar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 170, height: 170 }}>

        {/* Auras */}
        <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: `1.5px solid ${c.ring2Color}`, animation: 'jPulse2 3.2s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${c.ringColor}`, animation: 'jPulse 2.6s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Partículas */}
        <Particles colors={c.particles} />

        {/* Anillo exterior */}
        <svg style={{ position: 'absolute', inset: -22, animation: 'jSpin 11s linear infinite' }} width="214" height="214" viewBox="0 0 214 214">
          <circle cx="107" cy="107" r="100" fill="none" stroke={c.spinColor} strokeWidth="1" strokeDasharray="3 9" />
          <circle cx="107" cy="15"  r="4.5" fill={c.orbitDots} opacity=".8" />
          <circle cx="199" cy="107" r="3.5" fill={c.orbitDots} opacity=".55" />
          <circle cx="107" cy="199" r="4.5" fill={c.orbitDots} opacity=".8" />
          <circle cx="15"  cy="107" r="3.5" fill={c.orbitDots} opacity=".55" />
        </svg>

        {/* Anillo interior inverso */}
        <svg style={{ position: 'absolute', inset: -11, animation: 'jSpinR 7s linear infinite' }} width="192" height="192" viewBox="0 0 192 192">
          <circle cx="96" cy="96" r="88" fill="none" stroke={c.spin2Color} strokeWidth="1.5" strokeDasharray="2 15" />
          <polygon points="96,12 99,21 109,21 101,27 104,36 96,31 88,36 91,27 83,21 93,21" fill={c.orbitDots} opacity=".7" style={{ animation: 'jShimmer 2s ease-in-out infinite' }} />
          <polygon points="96,168 99,177 109,177 101,183 104,192 96,187 88,192 91,183 83,177 93,177" fill={c.orbitDots} opacity=".7" style={{ animation: 'jShimmer 2s ease-in-out .5s infinite' }} />
        </svg>

        {/* Frame del avatar */}
        <div style={{
          width: 130, height: 130, borderRadius: '50%',
          background: c.bg, border: `2.5px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'jFloat 2.8s ease-in-out infinite',
          boxShadow: `0 0 0 4px ${c.ring2Color}, 0 10px 36px rgba(0,0,0,.55)`,
          position: 'relative', zIndex: 2,
        }}>
          <SvgComponent />
        </div>

        {/* Estado online */}
        <div style={{
          position: 'absolute', bottom: 4, right: 4, zIndex: 3,
          background: 'rgba(0,0,0,.6)',
          border: `1.5px solid ${conectado ? '#4ade80' : '#64748b'}`,
          borderRadius: 12, padding: '2px 8px', fontSize: 10, fontWeight: 700,
          color: conectado ? '#4ade80' : '#94a3b8',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: conectado ? '#4ade80' : '#64748b', boxShadow: conectado ? '0 0 5px #4ade80' : 'none' }} />
          {conectado ? 'EN LÍNEA' : 'AUSENTE'}
        </div>
      </div>

      {/* Nombre y rango */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 500, color: 'white', letterSpacing: '.04em' }}>{c.nombre}</div>
        <div style={{ fontSize: 11, color: c.border, fontWeight: 700, marginTop: 2, letterSpacing: '.13em' }}>{c.rango}</div>
      </div>

      {/* Barra de XP */}
      <div style={{ width: 210, marginTop: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 5 }}>
          <span>Experiencia</span>
          <span style={{ color: c.border, fontWeight: 700 }}>{c.xp.toLocaleString()} / {c.xpMax.toLocaleString()} XP</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,.08)', borderRadius: 6, overflow: 'hidden', border: `1px solid ${c.ring2Color}` }}>
          <div style={{ '--xw': `${xpPct}%`, height: '100%', width: `${xpPct}%`, background: c.xpBg, borderRadius: 6, animation: 'jXp 1.1s cubic-bezier(.4,0,.2,1) .5s both', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(255,255,255,.14) 8px,rgba(255,255,255,.14) 9px)', borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
          {xpRest} XP para el nivel {n === 5 ? 'MAX' : n + 1}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {c.stats.map((s, i) => (
          <div key={s.l} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '7px 11px', textAlign: 'center', minWidth: 58, animation: `jStatIn .4s ease ${.15 + i * .12}s both` }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.45)', marginTop: 1, letterSpacing: '.06em' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Logros */}
      <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {c.logros.map(l => (
          <div key={l.t} style={{ background: l.bg, border: `1px solid ${l.b}`, borderRadius: 8, padding: '4px 10px', fontSize: 10, color: l.c, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <span style={{ fontSize: 13 }}>{l.e}</span>{l.t}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarJugador;