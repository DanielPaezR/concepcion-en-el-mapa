// components/AvatarGuia.jsx
import { motion } from 'framer-motion';

const AvatarGuiaSVG = () => (
  <svg viewBox="0 0 64 78" width="58" height="70">
    {/* Sombrero tipo guardaparques */}
    <ellipse cx="32" cy="16" rx="20" ry="6" fill="#2d3748" />
    <rect x="18" y="11" width="28" height="10" rx="4" fill="#4a5568" />
    <path d="M44 12 L50 8 L48 16 Z" fill="#ecc94b" />
    {/* Cabello / cejas */}
    <path d="M22 22 Q32 18 42 22" stroke="#2d3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Cara */}
    <ellipse cx="32" cy="32" rx="11" ry="12" fill="#fbd38d" />
    {/* Ojos atentos */}
    <circle cx="27" cy="31" r="3" fill="#1a202c" />
    <circle cx="37" cy="31" r="3" fill="#1a202c" />
    <circle cx="28" cy="30" r="1" fill="white" />
    <circle cx="38" cy="30" r="1" fill="white" />
    {/* Sonrisa amigable */}
    <path d="M28 38 Q32 42 36 38" stroke="#b7791f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Barba fina */}
    <path d="M27 43 Q32 46 37 43" stroke="#a0522d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Chaleco de trabajo verde oscuro */}
    <rect x="20" y="44" width="24" height="22" rx="4" fill="#2f855a" />
    <rect x="24" y="44" width="16" height="22" rx="2" fill="#276749" />
    <path d="M32 48 L32 62" stroke="#68d391" strokeWidth="1" />
    {/* Placa de identificación */}
    <rect x="28" y="50" width="8" height="6" rx="1" fill="#fefcbf" />
    <circle cx="32" cy="53" r="1.5" fill="#d69e2e" />
    {/* Mapa en la mano */}
    <rect x="8" y="52" width="10" height="14" rx="1" fill="#fefcbf" transform="rotate(-15 13 59)" />
    <line x1="10" y1="56" x2="16" y2="56" stroke="#d69e2e" strokeWidth="0.8" />
    <line x1="10" y1="60" x2="16" y2="60" stroke="#d69e2e" strokeWidth="0.8" />
    <line x1="10" y1="64" x2="16" y2="64" stroke="#d69e2e" strokeWidth="0.8" />
    {/* Bastón / radio */}
    <line x1="50" y1="50" x2="56" y2="68" stroke="#4a5568" strokeWidth="3" strokeLinecap="round" />
    <circle cx="56" cy="68" r="3.5" fill="#2d3748" />
    <rect x="48" y="54" width="6" height="8" rx="2" fill="#1a202c" />
    <line x1="51" y1="56" x2="51" y2="60" stroke="#48bb78" strokeWidth="1.5" />
    {/* Brazos */}
    <line x1="20" y1="48" x2="10" y2="56" stroke="#2f855a" strokeWidth="6" strokeLinecap="round" />
    <circle cx="10" cy="56" r="3.5" fill="#fbd38d" />
    {/* Piernas y botas de caminata */}
    <rect x="22" y="65" width="8" height="12" rx="3" fill="#4a5568" />
    <rect x="34" y="65" width="8" height="12" rx="3" fill="#4a5568" />
    <ellipse cx="26" cy="77" rx="6" ry="3.5" fill="#1a202c" />
    <ellipse cx="38" cy="77" rx="6" ry="3.5" fill="#1a202c" />
    {/* Detalle de suela */}
    <path d="M22 77 L30 77" stroke="#f6e05e" strokeWidth="1" />
    <path d="M34 77 L42 77" stroke="#f6e05e" strokeWidth="1" />
  </svg>
);

// ─────────────────────────────────────────────
// Configuración visual del avatar de guía (fijo)
// ─────────────────────────────────────────────
const GUIA_CONFIG = {
  label: '👑 GUÍA LOCAL',
  bg: 'linear-gradient(160deg, #1e3a8a, #1e3a5f)',
  border: '#fbbf24',
  glow: 'rgba(251,191,36,0.45)',
  borderRadius: 16,
  labelBg: '#1e3a8a',
  labelColor: '#fcd34d',
  labelBorder: '#fbbf24',
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const AvatarGuia = ({ isMobile = false, conectado = false }) => {
  const frameSize = isMobile
    ? { width: 52, height: 64 }
    : { width: 64, height: 78 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
      {/* Aura de conexión (si el guía está en línea) */}
      {conectado && (
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${GUIA_CONFIG.glow}, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}

      {/* Frame del avatar */}
      <motion.div
        animate={{ y: conectado ? [0, -6, 0] : 0 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: frameSize.width,
          height: frameSize.height,
          background: GUIA_CONFIG.bg,
          border: `2px solid ${GUIA_CONFIG.border}`,
          borderRadius: GUIA_CONFIG.borderRadius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${GUIA_CONFIG.glow}`,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        <AvatarGuiaSVG />
      </motion.div>

      {/* Etiqueta de rango (guía) */}
      <div style={{
        background: GUIA_CONFIG.labelBg,
        color: GUIA_CONFIG.labelColor,
        border: `1px solid ${GUIA_CONFIG.labelBorder}`,
        borderRadius: 20,
        padding: '2px 9px',
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        {GUIA_CONFIG.label} {conectado && <span style={{ color: '#4ade80' }}>●</span>}
      </div>
    </div>
  );
};

export default AvatarGuia;