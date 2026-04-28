// components/AvatarJugador.jsx
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────
// SVGs por nivel — aventurero que evoluciona
// ─────────────────────────────────────────────

const AvatarNivel1 = () => (
  <svg viewBox="0 0 60 74" width="52" height="64">
    {/* Sombrero explorador */}
    <ellipse cx="30" cy="16" rx="18" ry="5" fill="#92400e" />
    <rect x="16" y="11" width="28" height="10" rx="4" fill="#b45309" />
    {/* Cabeza */}
    <ellipse cx="30" cy="27" rx="12" ry="13" fill="#fcd9b0" />
    {/* Ojos */}
    <circle cx="25" cy="25" r="2" fill="#1e293b" />
    <circle cx="35" cy="25" r="2" fill="#1e293b" />
    <circle cx="25.8" cy="24.2" r=".7" fill="white" />
    <circle cx="35.8" cy="24.2" r=".7" fill="white" />
    {/* Boca */}
    <path d="M26 31 Q30 34 34 31" stroke="#92400e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Cuerpo - camisa verde */}
    <rect x="20" y="39" width="20" height="22" rx="4" fill="#065f46" />
    {/* Mochila */}
    <rect x="38" y="41" width="8" height="14" rx="3" fill="#92400e" />
    <line x1="38" y1="46" x2="46" y2="46" stroke="#78350f" strokeWidth=".8" />
    {/* Brazos */}
    <line x1="20" y1="43" x2="12" y2="52" stroke="#065f46" strokeWidth="5" strokeLinecap="round" />
    <line x1="40" y1="43" x2="47" y2="51" stroke="#065f46" strokeWidth="5" strokeLinecap="round" />
    {/* Manos */}
    <circle cx="12" cy="52" r="3" fill="#fcd9b0" />
    <circle cx="47" cy="51" r="3" fill="#fcd9b0" />
    {/* Piernas */}
    <rect x="21" y="60" width="7" height="13" rx="3" fill="#1e293b" />
    <rect x="32" y="60" width="7" height="13" rx="3" fill="#1e293b" />
    {/* Botas */}
    <ellipse cx="24" cy="73" rx="5" ry="3" fill="#1c1917" />
    <ellipse cx="35" cy="73" rx="5" ry="3" fill="#1c1917" />
  </svg>
);

const AvatarNivel2 = () => (
  <svg viewBox="0 0 60 74" width="54" height="66">
    {/* Sombrero con pluma */}
    <ellipse cx="30" cy="16" rx="18" ry="5" fill="#1e3a5f" />
    <rect x="16" y="10" width="28" height="11" rx="4" fill="#1d4ed8" />
    <path d="M42 8 Q48 3 45 12 Q43 14 42 11Z" fill="#22c55e" />
    {/* Cabeza */}
    <ellipse cx="30" cy="27" rx="12" ry="13" fill="#fcd9b0" />
    {/* Cicatriz */}
    <path d="M24 22 L27 26" stroke="#b45309" strokeWidth="1" strokeLinecap="round" />
    {/* Ojos determinados */}
    <path d="M23 24 L27 24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M33 24 L37 24" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M25 31 Q30 33 35 31" stroke="#92400e" strokeWidth="1.2" fill="none" />
    {/* Cuerpo con chaleco */}
    <rect x="20" y="39" width="20" height="22" rx="4" fill="#1d4ed8" />
    <rect x="25" y="39" width="10" height="22" rx="2" fill="#1e3a8a" />
    {/* Escudo pequeño */}
    <path d="M10 40 Q10 50 16 54 Q22 50 22 40Z" fill="#94a3b8" stroke="#475569" strokeWidth=".8" />
    <path d="M13 43 L19 43" stroke="#1e293b" strokeWidth="1.2" />
    <path d="M16 41 L16 47" stroke="#1e293b" strokeWidth="1.2" />
    {/* Espada */}
    <line x1="42" y1="38" x2="50" y2="55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <rect x="39" y="37" width="10" height="3" rx="1" fill="#6b7280" transform="rotate(-30 44 38.5)" />
    <circle cx="40" cy="36" r="2.5" fill="#475569" />
    {/* Brazos */}
    <line x1="20" y1="43" x2="10" y2="50" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
    <circle cx="10" cy="50" r="3" fill="#fcd9b0" />
    {/* Piernas */}
    <rect x="21" y="60" width="7" height="13" rx="3" fill="#1e3a8a" />
    <rect x="32" y="60" width="7" height="13" rx="3" fill="#1e3a8a" />
    <ellipse cx="24" cy="73" rx="5.5" ry="3" fill="#1e293b" />
    <ellipse cx="35" cy="73" rx="5.5" ry="3" fill="#1e293b" />
  </svg>
);

const AvatarNivel3 = () => (
  <svg viewBox="0 0 64 78" width="58" height="70">
    {/* Casco guerrero */}
    <ellipse cx="32" cy="14" rx="16" ry="10" fill="#475569" />
    <rect x="18" y="10" width="28" height="12" rx="3" fill="#64748b" />
    <rect x="28" y="5" width="8" height="8" rx="2" fill="#f59e0b" />
    <rect x="20" y="18" width="24" height="6" rx="2" fill="#374151" />
    {/* Cabeza */}
    <ellipse cx="32" cy="30" rx="11" ry="10" fill="#fcd9b0" />
    {/* Ojos determinados con brillo */}
    <circle cx="27" cy="29" r="2.5" fill="#1e293b" />
    <circle cx="37" cy="29" r="2.5" fill="#1e293b" />
    <circle cx="28" cy="28.3" r=".9" fill="white" />
    <circle cx="38" cy="28.3" r=".9" fill="white" />
    {/* Cuerpo armadura */}
    <rect x="20" y="40" width="24" height="24" rx="4" fill="#475569" />
    <path d="M22 42 L32 38 L42 42 L42 56 L32 62 L22 56Z" fill="#64748b" />
    <path d="M32 40 L32 60" stroke="#94a3b8" strokeWidth=".8" />
    <path d="M24 50 L40 50" stroke="#94a3b8" strokeWidth=".8" />
    {/* Hombreras */}
    <ellipse cx="20" cy="42" rx="7" ry="5" fill="#64748b" />
    <ellipse cx="44" cy="42" rx="7" ry="5" fill="#64748b" />
    {/* Escudo mejorado */}
    <path d="M6 40 Q5 53 13 58 Q21 53 20 40Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" />
    <path d="M13 44 L13 55" stroke="#93c5fd" strokeWidth="1.5" />
    <path d="M9 49 L17 49" stroke="#93c5fd" strokeWidth="1.5" />
    {/* Espada grande */}
    <line x1="46" y1="36" x2="58" y2="56" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
    <rect x="43" y="35" width="12" height="4" rx="1.5" fill="#94a3b8" transform="rotate(-30 49 37)" />
    <circle cx="44.5" cy="34" r="3" fill="#f59e0b" />
    {/* Piernas con botas */}
    <rect x="22" y="63" width="8" height="13" rx="3" fill="#374151" />
    <rect x="34" y="63" width="8" height="13" rx="3" fill="#374151" />
    <ellipse cx="26" cy="76" rx="6" ry="3" fill="#1e293b" />
    <ellipse cx="38" cy="76" rx="6" ry="3" fill="#1e293b" />
  </svg>
);

const AvatarNivel4 = () => (
  <svg viewBox="0 0 68 82" width="62" height="74">
    {/* Cuernos de casco */}
    <path d="M16 16 Q10 8 14 4 Q18 10 22 14Z" fill="#92400e" />
    <path d="M52 16 Q58 8 54 4 Q50 10 46 14Z" fill="#92400e" />
    <ellipse cx="34" cy="15" rx="18" ry="11" fill="#92400e" />
    <rect x="18" y="11" width="32" height="14" rx="4" fill="#b45309" />
    <rect x="22" y="8" width="24" height="8" rx="3" fill="#f59e0b" />
    <rect x="20" y="21" width="28" height="7" rx="3" fill="#78350f" />
    <path d="M20 24 L48 24" stroke="#f59e0b" strokeWidth=".8" />
    {/* Cara */}
    <ellipse cx="34" cy="33" rx="12" ry="11" fill="#fcd9b0" />
    {/* Ojos furiosos */}
    <path d="M26 30 L23 32 L26 32" stroke="#1e293b" strokeWidth="1.5" fill="none" />
    <path d="M42 30 L45 32 L42 32" stroke="#1e293b" strokeWidth="1.5" fill="none" />
    <circle cx="27" cy="32" r="2" fill="#1e293b" />
    <circle cx="41" cy="32" r="2" fill="#1e293b" />
    <circle cx="27.8" cy="31.2" r=".8" fill="white" />
    <circle cx="41.8" cy="31.2" r=".8" fill="white" />
    {/* Barba */}
    <path d="M26 40 Q34 44 42 40" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Armadura campeón */}
    <rect x="20" y="43" width="28" height="26" rx="4" fill="#92400e" />
    <path d="M22 44 L34 39 L46 44 L46 60 L34 67 L22 60Z" fill="#b45309" />
    <path d="M34 41 L34 64" stroke="#f59e0b" strokeWidth="1" />
    <path d="M24 52 L44 52" stroke="#f59e0b" strokeWidth="1" />
    <circle cx="34" cy="52" r="4" fill="#f59e0b" opacity=".8" />
    {/* Hombreras épicas */}
    <path d="M14 42 Q8 44 10 52 Q16 54 22 50Z" fill="#b45309" />
    <path d="M54 42 Q60 44 58 52 Q52 54 46 50Z" fill="#b45309" />
    <circle cx="11" cy="47" r="3.5" fill="#f59e0b" />
    <circle cx="57" cy="47" r="3.5" fill="#f59e0b" />
    {/* Capa roja */}
    <path d="M16 46 Q10 62 18 74" stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".8" />
    <path d="M52 46 Q58 62 50 74" stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".8" />
    {/* Hacha doble */}
    <line x1="58" y1="34" x2="62" y2="68" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="60" cy="36" rx="8" ry="10" fill="#f59e0b" opacity=".9" transform="rotate(15 60 36)" />
    <ellipse cx="61" cy="66" rx="7" ry="9" fill="#f59e0b" opacity=".9" transform="rotate(-15 61 66)" />
    {/* Piernas */}
    <rect x="22" y="68" width="10" height="12" rx="3" fill="#78350f" />
    <rect x="36" y="68" width="10" height="12" rx="3" fill="#78350f" />
    <ellipse cx="27" cy="80" rx="7" ry="3.5" fill="#1e293b" />
    <ellipse cx="41" cy="80" rx="7" ry="3.5" fill="#1e293b" />
  </svg>
);

const AvatarNivel5 = () => (
  <svg viewBox="0 0 72 88" width="66" height="80">
    {/* Corona legendaria */}
    <path d="M20 12 L24 4 L28 12 L34 2 L40 12 L44 4 L48 12 L52 16 L20 16Z" fill="#f59e0b" />
    <circle cx="24" cy="4" r="2.5" fill="#ef4444" />
    <circle cx="34" cy="2" r="3" fill="#ef4444" />
    <circle cx="44" cy="4" r="2.5" fill="#ef4444" />
    {/* Casco oscuro legendario */}
    <ellipse cx="36" cy="22" rx="18" ry="12" fill="#0f172a" />
    <rect x="20" y="18" width="32" height="14" rx="5" fill="#1e293b" />
    <rect x="20" y="27" width="32" height="8" rx="3" fill="#0f172a" />
    <ellipse cx="36" cy="31" rx="10" ry="3" fill="#991b1b" opacity=".6" />
    <ellipse cx="36" cy="31" rx="5" ry="1.5" fill="#ef4444" />
    {/* Runas casco */}
    <path d="M22 21 L22 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <path d="M26 20 L26 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <path d="M46 20 L46 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    <path d="M50 21 L50 26" stroke="#ef4444" strokeWidth=".8" opacity=".7" />
    {/* Cara */}
    <ellipse cx="36" cy="40" rx="10" ry="9" fill="#fcd9b0" />
    {/* Ojos que brillan en rojo */}
    <circle cx="31" cy="39" r="3" fill="#1e293b" />
    <circle cx="41" cy="39" r="3" fill="#1e293b" />
    <circle cx="31" cy="39" r="1.5" fill="#ef4444" />
    <circle cx="41" cy="39" r="1.5" fill="#ef4444" />
    {/* Cicatrices de batalla */}
    <path d="M29 36 L32 40" stroke="#dc2626" strokeWidth=".8" />
    <path d="M40 37 L43 40" stroke="#dc2626" strokeWidth=".8" />
    {/* Armadura legendaria */}
    <rect x="18" y="49" width="36" height="28" rx="4" fill="#0f172a" />
    <path d="M20 50 L36 44 L52 50 L52 68 L36 76 L20 68Z" fill="#1e293b" />
    <path d="M36 46 L36 72" stroke="#ef4444" strokeWidth=".8" opacity=".6" />
    <path d="M22 59 L50 59" stroke="#ef4444" strokeWidth=".8" opacity=".6" />
    <circle cx="36" cy="59" r="5" fill="#991b1b" opacity=".7" />
    <circle cx="36" cy="59" r="2.5" fill="#ef4444" />
    {/* Hombreras élite */}
    <path d="M10 48 Q4 50 6 60 Q12 63 20 58Z" fill="#1e293b" stroke="#ef4444" strokeWidth=".5" />
    <path d="M62 48 Q68 50 66 60 Q60 63 52 58Z" fill="#1e293b" stroke="#ef4444" strokeWidth=".5" />
    <circle cx="8" cy="54" r="3.5" fill="#ef4444" />
    <circle cx="64" cy="54" r="3.5" fill="#ef4444" />
    {/* Capa roja épica */}
    <path d="M14 52 Q6 68 14 80 Q20 82 22 72" stroke="#dc2626" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".8" />
    <path d="M58 52 Q66 68 58 80 Q52 82 50 72" stroke="#dc2626" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".8" />
    {/* Espada legendaria */}
    <line x1="62" y1="36" x2="68" y2="74" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
    <path d="M57 37 L70 43" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
    <circle cx="60" cy="35" r="5" fill="#ef4444" />
    <path d="M63 42 Q66 48 64 52" stroke="#ef4444" strokeWidth="1" fill="none" opacity=".7" strokeDasharray="2 2" />
    {/* Piernas armadas */}
    <rect x="20" y="76" width="12" height="10" rx="3" fill="#1e293b" />
    <rect x="40" y="76" width="12" height="10" rx="3" fill="#1e293b" />
    <path d="M24 78 L24 84" stroke="#ef4444" strokeWidth=".8" opacity=".5" />
    <path d="M44 78 L44 84" stroke="#ef4444" strokeWidth=".8" opacity=".5" />
    <ellipse cx="26" cy="86" rx="8" ry="4" fill="#0f172a" />
    <ellipse cx="46" cy="86" rx="8" ry="4" fill="#0f172a" />
  </svg>
);

// ─────────────────────────────────────────────
// Configuración visual por nivel
// ─────────────────────────────────────────────
const NIVEL_CONFIG = {
  1: {
    label: '🌲 NOVATO',
    bg: 'linear-gradient(160deg, #14532d, #052e16)',
    border: '#22c55e',
    glow: 'rgba(34,197,94,0.25)',
    borderRadius: 14,
    labelBg: '#14532d',
    labelColor: '#4ade80',
    labelBorder: '#22c55e',
  },
  2: {
    label: '⚔️ CURTIDO',
    bg: 'linear-gradient(160deg, #1c3a5e, #0f2d4a)',
    border: '#60a5fa',
    glow: 'rgba(96,165,250,0.25)',
    borderRadius: 14,
    labelBg: '#1c3a5e',
    labelColor: '#93c5fd',
    labelBorder: '#3b82f6',
  },
  3: {
    label: '🛡️ GUERRERO',
    bg: 'linear-gradient(160deg, #312e81, #1e1b4b)',
    border: '#818cf8',
    glow: 'rgba(129,140,248,0.3)',
    borderRadius: 16,
    labelBg: '#312e81',
    labelColor: '#a5b4fc',
    labelBorder: '#6366f1',
  },
  4: {
    label: '🔥 CAMPEÓN',
    bg: 'linear-gradient(160deg, #451a03, #1c0d00)',
    border: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    borderRadius: 16,
    labelBg: '#451a03',
    labelColor: '#fcd34d',
    labelBorder: '#f59e0b',
  },
  5: {
    label: '👑 GUARDIÁN',
    bg: 'linear-gradient(160deg, #1a0505, #0f0f0f)',
    border: '#dc2626',
    glow: 'rgba(220,38,38,0.5)',
    borderRadius: 18,
    labelBg: '#450a0a',
    labelColor: '#fca5a5',
    labelBorder: '#dc2626',
  },
};

const AVATAR_SVG = {
  1: AvatarNivel1,
  2: AvatarNivel2,
  3: AvatarNivel3,
  4: AvatarNivel4,
  5: AvatarNivel5,
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const AvatarJugador = ({ level = 1, isMobile = false }) => {
  const nivelClamped = Math.min(Math.max(Math.floor(level), 1), 5);
  const config = NIVEL_CONFIG[nivelClamped];
  const SvgComponent = AVATAR_SVG[nivelClamped];

  const frameSize = isMobile
    ? { width: 52, height: 64 }
    : { width: 64, height: 78 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
      {/* Aura de poder — solo nivel 4 y 5 */}
      {nivelClamped >= 4 && (
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${config.glow}, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}

      {/* Frame del avatar */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: frameSize.width,
          height: frameSize.height,
          background: config.bg,
          border: `2px solid ${config.border}`,
          borderRadius: config.borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${config.glow}`,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        <SvgComponent />
      </motion.div>

      {/* Etiqueta de rango */}
      <div style={{
        background: config.labelBg,
        color: config.labelColor,
        border: `1px solid ${config.labelBorder}`,
        borderRadius: 20,
        padding: '2px 9px',
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        {config.label} <span style={{ color: '#fbbf24' }}>NV.{nivelClamped}</span>
      </div>
    </div>
  );
};

export default AvatarJugador;
