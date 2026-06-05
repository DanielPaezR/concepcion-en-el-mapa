import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// SVG del personaje mejorado
// ─────────────────────────────────────────────
const AvatarGuiaSVG = () => (
  <svg viewBox="0 0 64 80" width="90" height="90" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }}>
    {/* Corona épica */}
    <g transform="translate(32,2)">
      <polygon points="-10,8 -7,0 -3,5 0,-2 3,5 7,0 10,8" fill="#fbbf24" stroke="#f59e0b" strokeWidth=".5" />
      <circle cx="-7" cy="1" r="1.5" fill="#ef4444" />
      <circle cx="0" cy="-1" r="1.8" fill="#34d399" />
      <circle cx="7" cy="1" r="1.5" fill="#60a5fa" />
    </g>
    {/* Sombrero */}
    <ellipse cx="32" cy="17" rx="21" ry="6.5" fill="#1e293b" />
    <rect x="17" y="12" width="30" height="11" rx="5" fill="#334155" />
    <rect x="17" y="19" width="30" height="3" rx="1" fill="#fbbf24" />
    <circle cx="44" cy="20" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth=".5" />
    <text x="44" y="22.5" textAnchor="middle" fontSize="4" fill="#1e293b" fontWeight="bold">★</text>
    {/* Cabeza */}
    <ellipse cx="32" cy="33" rx="11.5" ry="12.5" fill="#fde68a" />
    <path d="M22 24 Q32 20 42 24" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Cejas */}
    <path d="M25 28 Q28 26.5 31 27.5" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M33 27.5 Q36 26.5 39 28" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Ojos */}
    <circle cx="27.5" cy="32" r="3.2" fill="#1e293b" />
    <circle cx="36.5" cy="32" r="3.2" fill="#1e293b" />
    <circle cx="28.5" cy="30.8" r="1.2" fill="white" />
    <circle cx="37.5" cy="30.8" r="1.2" fill="white" />
    <circle cx="27.5" cy="32" r="1.8" fill="#1e3a8a" opacity=".6" />
    <circle cx="36.5" cy="32" r="1.8" fill="#1e3a8a" opacity=".6" />
    {/* Nariz */}
    <ellipse cx="32" cy="36" rx="1.2" ry=".8" fill="#f6b73c" opacity=".5" />
    {/* Sonrisa */}
    <path d="M28.5 39 Q32 43 35.5 39" stroke="#b45309" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {/* Barba */}
    <path d="M27 43.5 Q32 47 37 43.5" stroke="#92400e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    <path d="M28 45 Q32 47.5 36 45" stroke="#92400e" strokeWidth="1" fill="none" strokeLinecap="round" />
    {/* Chaleco */}
    <rect x="19" y="46" width="26" height="23" rx="5" fill="#14532d" />
    <rect x="23" y="46" width="18" height="23" rx="3" fill="#166534" />
    <line x1="32" y1="50" x2="32" y2="65" stroke="#4ade80" strokeWidth="1.2" />
    <rect x="20" y="52" width="7" height="5" rx="1.5" fill="#15803d" stroke="#4ade80" strokeWidth=".6" />
    <rect x="37" y="52" width="7" height="5" rx="1.5" fill="#15803d" stroke="#4ade80" strokeWidth=".6" />
    {/* Placa */}
    <rect x="27" y="55" width="10" height="7" rx="1.5" fill="#fef3c7" stroke="#fbbf24" strokeWidth=".8" />
    <text x="32" y="60" textAnchor="middle" fontSize="3.5" fill="#92400e" fontWeight="bold">GÍA</text>
    {/* Mochila */}
    <rect x="44" y="46" width="10" height="16" rx="3" fill="#064e3b" stroke="#34d399" strokeWidth=".8" />
    <rect x="45" y="49" width="8" height="4" rx="1" fill="#065f46" />
    <rect x="45" y="55" width="8" height="4" rx="1" fill="#065f46" />
    <line x1="44" y1="48" x2="42" y2="62" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" />
    {/* Mapa */}
    <rect x="4" y="54" width="12" height="16" rx="1.5" fill="#fffbeb" transform="rotate(-15 10 62)" stroke="#d97706" strokeWidth=".7" />
    <line x1="7" y1="58" x2="14" y2="57" stroke="#d97706" strokeWidth=".8" />
    <line x1="6" y1="62" x2="13" y2="61" stroke="#d97706" strokeWidth=".8" />
    <line x1="7" y1="66" x2="13" y2="65" stroke="#d97706" strokeWidth=".8" />
    <circle cx="10.5" cy="59.5" r="1.5" fill="#ef4444" />
    {/* Radio */}
    <rect x="47" y="62" width="6" height="9" rx="2" fill="#0f172a" />
    <line x1="50" y1="64" x2="50" y2="68" stroke="#4ade80" strokeWidth="1.5" />
    <rect x="48" y="65" width="4" height="1.5" rx=".5" fill="#22c55e" />
    {/* Brazos */}
    <line x1="19" y1="50" x2="8" y2="58" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
    <ellipse cx="8" cy="58" rx="4" ry="4" fill="#fde68a" />
    {/* Botas */}
    <rect x="21" y="67" width="9" height="14" rx="4" fill="#334155" />
    <rect x="34" y="67" width="9" height="14" rx="4" fill="#334155" />
    <ellipse cx="25.5" cy="80" rx="7" ry="3.5" fill="#1e293b" />
    <ellipse cx="38.5" cy="80" rx="7" ry="3.5" fill="#1e293b" />
    <line x1="20" y1="80" x2="31" y2="80" stroke="#fbbf24" strokeWidth="1.2" />
    <line x1="33" y1="80" x2="44" y2="80" stroke="#fbbf24" strokeWidth="1.2" />
  </svg>
);

// ─────────────────────────────────────────────
// Componente de partículas
// ─────────────────────────────────────────────
const Particles = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const colors = ['#fbbf24', '#fde68a', '#4ade80', '#60a5fa', '#f87171', '#a78bfa'];

    const spawn = () => {
      const p = document.createElement('div');
      const angle = Math.random() * 360;
      const r = 58 + Math.random() * 14;
      const rad = (angle * Math.PI) / 180;
      const x = 80 + Math.cos(rad) * r - 4;
      const y = 80 + Math.sin(rad) * r - 4;
      const c = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:${c};animation:avatarParticle ${1.2 + Math.random()}s ease-out forwards;pointer-events:none;`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    };

    const interval = setInterval(spawn, 280);
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 120);
    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '50%', overflow: 'visible' }} />;
};

// ─────────────────────────────────────────────
// CSS de animaciones (inyectado una sola vez)
// ─────────────────────────────────────────────
const AVATAR_STYLES = `
  @keyframes avatarFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes avatarPulseRing { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.18);opacity:.9} }
  @keyframes avatarPulseRing2 { 0%,100%{transform:scale(1);opacity:.2} 50%{transform:scale(1.28);opacity:.6} }
  @keyframes avatarXpFill { from{width:0} to{width:var(--xp-w)} }
  @keyframes avatarBadgePop { 0%{transform:scale(0) rotate(-20deg);opacity:0} 70%{transform:scale(1.15) rotate(4deg);opacity:1} 100%{transform:scale(1) rotate(0)} }
  @keyframes avatarStarSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes avatarStarSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes avatarParticle { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-60px) scale(0);opacity:0} }
  @keyframes avatarShimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes avatarStatIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
`;

let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = AVATAR_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
};

// ─────────────────────────────────────────────
// Configuración del guía (personalizable)
// ─────────────────────────────────────────────
const GUIA_CONFIG = {
  nombre: 'Carlos Montoya',
  rango: 'GUARDAPARQUES ÉLITE',
  nivel: 47,
  xpActual: 8340,
  xpTotal: 10000,
  stats: [
    { label: 'EXPLORACIÓN', valor: 94, color: '#fbbf24' },
    { label: 'NATURALEZA',  valor: 88, color: '#4ade80' },
    { label: 'CARISMA',     valor: 76, color: '#60a5fa' },
    { label: 'RESISTENCIA', valor: 82, color: '#f87171' },
  ],
  logros: [
    { emoji: '🏔️', label: 'Cumbre Épica',  bg: '#1e3a8a', border: '#fbbf24', color: '#fde68a' },
    { emoji: '🌿', label: 'Botánico',      bg: '#14532d', border: '#4ade80', color: '#86efac' },
    { emoji: '⭐', label: 'Legendario',    bg: '#4c1d95', border: '#a78bfa', color: '#c4b5fd' },
  ],
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const AvatarGuia = ({ conectado = false, isMobile = false }) => {
  useEffect(() => { injectStyles(); }, []);

  const xpPct = (GUIA_CONFIG.xpActual / GUIA_CONFIG.xpTotal) * 100;
  const xpRestante = GUIA_CONFIG.xpTotal - GUIA_CONFIG.xpActual;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem 2rem', gap: 0 }}>

      {/* Badge de nivel */}
      <div style={{
        background: '#1e3a8a', border: '1.5px solid #fbbf24', borderRadius: 20,
        padding: '3px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
        color: '#fde68a', marginBottom: 14,
        animation: 'avatarBadgePop .6s cubic-bezier(.34,1.56,.64,1) both',
        boxShadow: '0 0 16px rgba(251,191,36,.35)',
      }}>
        ✦ NIVEL {GUIA_CONFIG.nivel} · GUÍA LOCAL ✦
      </div>

      {/* Contenedor del avatar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 160 }}>

        {/* Auras */}
        <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', border: '1.5px solid rgba(251,191,36,.35)', animation: 'avatarPulseRing2 3s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(251,191,36,.55)', animation: 'avatarPulseRing 2.5s ease-in-out infinite', pointerEvents: 'none' }} />

        {/* Partículas */}
        {conectado && <Particles />}

        {/* Anillo exterior giratorio */}
        <svg style={{ position: 'absolute', inset: -22, animation: 'avatarStarSpin 12s linear infinite' }} width="204" height="204" viewBox="0 0 204 204">
          <circle cx="102" cy="102" r="96" fill="none" stroke="rgba(251,191,36,.13)" strokeWidth="1" strokeDasharray="3 8" />
          <circle cx="102" cy="18"  r="4" fill="#fbbf24" opacity=".7" />
          <circle cx="186" cy="102" r="3" fill="#fbbf24" opacity=".5" />
          <circle cx="102" cy="186" r="4" fill="#fbbf24" opacity=".7" />
          <circle cx="18"  cy="102" r="3" fill="#fbbf24" opacity=".5" />
        </svg>

        {/* Anillo interior giratorio inverso */}
        <svg style={{ position: 'absolute', inset: -10, animation: 'avatarStarSpinRev 8s linear infinite' }} width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="84" fill="none" stroke="rgba(251,191,36,.2)" strokeWidth="1.5" strokeDasharray="2 14" />
          <polygon points="90,10 93,20 103,20 95,26 98,36 90,30 82,36 85,26 77,20 87,20" fill="#fbbf24" opacity=".6" style={{ animation: 'avatarShimmer 2s ease-in-out infinite' }} />
          <polygon points="90,164 93,174 103,174 95,180 98,190 90,184 82,190 85,180 77,174 87,174" fill="#fbbf24" opacity=".6" style={{ animation: 'avatarShimmer 2s ease-in-out .5s infinite' }} />
        </svg>

        {/* Frame circular del avatar */}
        <div style={{
          width: 128, height: 128,
          background: 'linear-gradient(145deg,#1e3a8a 0%,#1e3a5f 50%,#0f2352 100%)',
          border: '2.5px solid #fbbf24', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'avatarFloat 2.8s ease-in-out infinite',
          boxShadow: '0 0 0 4px rgba(251,191,36,.15), 0 8px 32px rgba(0,0,0,.5)',
          position: 'relative', zIndex: 2,
        }}>
          <AvatarGuiaSVG />
        </div>

        {/* Indicador de estado */}
        <div style={{
          position: 'absolute', bottom: 4, right: 4, zIndex: 3,
          background: conectado ? '#14532d' : '#1e293b',
          border: `1.5px solid ${conectado ? '#4ade80' : '#64748b'}`,
          borderRadius: 12, padding: '2px 8px', fontSize: 10,
          color: conectado ? '#4ade80' : '#94a3b8', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: conectado ? '#4ade80' : '#64748b',
            display: 'inline-block',
            boxShadow: conectado ? '0 0 6px #4ade80' : 'none',
          }} />
          {conectado ? 'EN LÍNEA' : 'AUSENTE'}
        </div>
      </div>

      {/* Nombre y rango */}
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 500, color: 'white', letterSpacing: '.04em' }}>
          {GUIA_CONFIG.nombre}
        </div>
        <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 500, marginTop: 2, letterSpacing: '.12em' }}>
          {GUIA_CONFIG.rango}
        </div>
      </div>

      {/* Barra de XP */}
      <div style={{ width: 220, marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 5 }}>
          <span>Experiencia</span>
          <span style={{ color: '#fbbf24', fontWeight: 500 }}>
            {GUIA_CONFIG.xpActual.toLocaleString()} / {GUIA_CONFIG.xpTotal.toLocaleString()} XP
          </span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,.08)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(251,191,36,.3)' }}>
          <div style={{
            '--xp-w': `${xpPct}%`,
            height: '100%',
            width: `${xpPct}%`,
            background: 'linear-gradient(90deg,#1d4ed8,#fbbf24 80%,#fde68a)',
            borderRadius: 6,
            animation: 'avatarXpFill 1.2s cubic-bezier(.4,0,.2,1) .4s both',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(255,255,255,.15) 8px,rgba(255,255,255,.15) 9px)',
              borderRadius: 6,
            }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
          {xpRestante.toLocaleString()} XP para el nivel {GUIA_CONFIG.nivel + 1}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        {GUIA_CONFIG.stats.map((stat, i) => (
          <div key={stat.label} style={{
            background: 'rgba(30,58,138,.25)',
            border: '1px solid rgba(251,191,36,.25)',
            borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 62,
            animation: `avatarStatIn .4s ease ${0.2 + i * 0.15}s both`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: stat.color }}>{stat.valor}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', marginTop: 1, letterSpacing: '.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Logros */}
      <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {GUIA_CONFIG.logros.map((logro) => (
          <div key={logro.label} style={{
            background: logro.bg, border: `1px solid ${logro.border}`,
            borderRadius: 8, padding: '4px 10px', fontSize: 10, color: logro.color,
            display: 'flex', alignItems: 'center', gap: 5, cursor: 'default',
          }}>
            <span style={{ fontSize: 13 }}>{logro.emoji}</span> {logro.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarGuia;