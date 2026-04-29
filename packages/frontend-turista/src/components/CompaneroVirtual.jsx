// components/CompaneroVirtual.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
// SVGs del Pato de Torrentes por nivel
// ─────────────────────────────────────────────

// Cuerpo base compartido — con líneas grises características y pico rojo
const PatoBase = ({ width, height, accesorios = null, ojos = null }) => (
  <svg viewBox="0 0 80 96" width={width} height={height}>
    {/* Sombra agua */}
    <ellipse cx="40" cy="91" rx="24" ry="5" fill="#0c4a6e" opacity=".35" />
    {/* CUERPO BLANCO */}
    <ellipse cx="40" cy="64" rx="25" ry="21" fill="#f1f5f9" />
    {/* LÍNEAS GRISES CARACTERÍSTICAS — flancos izquierdo */}
    <path d="M18 58 Q28 56 38 58" stroke="#94a3b8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M18 63 Q29 61 39 63" stroke="#94a3b8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M19 68 Q30 66 40 68" stroke="#94a3b8" strokeWidth="1.0" fill="none" strokeLinecap="round" />
    {/* LÍNEAS GRISES — flanco derecho */}
    <path d="M42 58 Q52 56 62 58" stroke="#94a3b8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <path d="M41 63 Q51 61 61 63" stroke="#94a3b8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M41 68 Q51 66 60 68" stroke="#94a3b8" strokeWidth="1.0" fill="none" strokeLinecap="round" />
    {/* Pecho café oscuro */}
    <ellipse cx="40" cy="72" rx="17" ry="13" fill="#78350f" />
    {/* Banda pectoral blanca — característica del pato de torrentes */}
    <path d="M26 61 Q40 57 54 61 Q52 70 40 72 Q28 70 26 61Z" fill="#f8fafc" />
    {/* Accesorios por nivel (van encima del cuerpo pero debajo de la cabeza) */}
    {accesorios}
    {/* CABEZA NEGRA */}
    <circle cx="40" cy="33" r="17" fill="#1e293b" />
    {/* Brillo iridiscente en cabeza */}
    <ellipse cx="36" cy="28" rx="6" ry="3.5" fill="#334155" opacity=".6" />
    {/* Ojos expresivos (override por emoción) */}
    {ojos || (
      <>
        <circle cx="34" cy="32" r="4.5" fill="white" />
        <circle cx="46" cy="32" r="4.5" fill="white" />
        <circle cx="35" cy="32" r="2.8" fill="#0f172a" />
        <circle cx="47" cy="32" r="2.8" fill="#0f172a" />
        <circle cx="36" cy="31" r="1" fill="white" />
        <circle cx="48" cy="31" r="1" fill="white" />
      </>
    )}
    {/* PICO ROJO CARACTERÍSTICO */}
    <path d="M34 40 Q40 45 46 40 L44 47 Q40 51 36 47Z" fill="#dc2626" />
    <path d="M34 40 Q40 43 46 40" stroke="#991b1b" strokeWidth=".8" fill="none" />
    <ellipse cx="40" cy="43" rx="4" ry="1.5" fill="#991b1b" opacity=".35" />
    {/* COLA levantada */}
    <path d="M60 57 Q73 50 71 63 Q67 71 59 69Z" fill="#1e293b" />
    {/* Líneas grises en cola */}
    <path d="M62 61 Q67 59 70 62" stroke="#475569" strokeWidth=".8" fill="none" strokeLinecap="round" />
    {/* ALA izquierda con plumas */}
    <path d="M17 61 Q9 70 15 79 Q25 83 33 77 Q25 71 21 61Z" fill="#e2e8f0" />
    <path d="M20 65 Q14 72 17 78" stroke="#94a3b8" strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M22 67 Q16 73 20 79" stroke="#94a3b8" strokeWidth=".7" fill="none" strokeLinecap="round" />
    {/* PATAS NARANJAS */}
    <path d="M33 84 L29 94" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M47 84 L51 94" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M26 94 L34 94" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 94 L56 94" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Ojos por emoción
const ojosConfig = {
  feliz: (
    <>
      <circle cx="34" cy="32" r="4.5" fill="white" />
      <circle cx="46" cy="32" r="4.5" fill="white" />
      <circle cx="35" cy="32" r="2.8" fill="#0f172a" />
      <circle cx="47" cy="32" r="2.8" fill="#0f172a" />
      <circle cx="36" cy="31" r="1" fill="white" />
      <circle cx="48" cy="31" r="1" fill="white" />
      {/* Cejas arriba: feliz */}
      <path d="M30 26 Q34 24 38 26" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M42 26 Q46 24 50 26" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  celebrando: (
    <>
      <circle cx="34" cy="32" r="5.5" fill="white" />
      <circle cx="46" cy="32" r="5.5" fill="white" />
      <circle cx="34" cy="33" r="3.2" fill="#0f172a" />
      <circle cx="46" cy="33" r="3.2" fill="#0f172a" />
      <circle cx="35" cy="31.5" r="1.2" fill="white" />
      <circle cx="47" cy="31.5" r="1.2" fill="white" />
      {/* Cejas muy arriba: emoción */}
      <path d="M29 24 Q33 21 37 24" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M43 24 Q47 21 51 24" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  pensativo: (
    <>
      {/* Ojos semicerrados */}
      <path d="M30 33 Q34 30 38 33" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M42 33 Q46 30 50 33" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Ceja levantada asimétrica */}
      <path d="M30 27 Q34 25 38 27" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M42 28 Q46 27 50 29" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  sorprendido: (
    <>
      <circle cx="34" cy="32" r="5" fill="white" />
      <circle cx="46" cy="32" r="5" fill="white" />
      <circle cx="34" cy="32" r="3.5" fill="#0f172a" />
      <circle cx="46" cy="32" r="3.5" fill="#0f172a" />
      <circle cx="34.8" cy="31" r="1.3" fill="white" />
      <circle cx="46.8" cy="31" r="1.3" fill="white" />
      {/* Cejas arqueadas: sorpresa */}
      <path d="M30 25 Q34 22 38 25" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M42 25 Q46 22 50 25" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
};

// Accesorios por nivel
const AccesoriosNivel = ({ nivel }) => {
  if (nivel === 1) return null;
  if (nivel === 2) return (
    // Pequeño lazo de explorador en el cuello
    <g>
      <path d="M33 49 Q40 52 47 49" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="50" r="3" fill="#22c55e" />
    </g>
  );
  if (nivel === 3) return (
    // Sombrero aventurero pequeño
    <g>
      <ellipse cx="40" cy="13" rx="20" ry="5" fill="#92400e" />
      <rect x="26" y="8" width="28" height="10" rx="4" fill="#b45309" />
      <path d="M52 6 Q58 1 56 10 Q53 13 51 10Z" fill="#22c55e" />
    </g>
  );
  if (nivel === 4) return (
    // Capa dorada + pequeña corona
    <g>
      <path d="M28 12 L31 4 L34 12 L38 2 L42 12 L46 4 L50 12 L28 12Z" fill="#f59e0b" />
      <circle cx="38" cy="4" r="2" fill="#ef4444" />
      <path d="M15 62 Q7 76 15 88" stroke="#f59e0b" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".7" />
    </g>
  );
  if (nivel === 5) return (
    // Corona épica + capa roja + runas
    <g>
      <path d="M22 12 L25 2 L29 12 L33 0 L37 12 L41 2 L45 12 L49 2 L53 12 L22 12Z" fill="#f59e0b" />
      <circle cx="29" cy="3" r="2.5" fill="#ef4444" />
      <circle cx="37" cy="1" r="3" fill="#dc2626" />
      <circle cx="45" cy="3" r="2.5" fill="#ef4444" />
      <path d="M14 62 Q6 78 14 90" stroke="#dc2626" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".75" />
      <path d="M66 62 Q74 78 66 90" stroke="#dc2626" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".75" />
      {/* Runas en ala */}
      <path d="M21 72 L23 77" stroke="#ef4444" strokeWidth=".7" opacity=".5" />
    </g>
  );
  return null;
};

// ─────────────────────────────────────────────
// Config de marco por nivel
// ─────────────────────────────────────────────
const NIVEL_FRAME = {
  1: { bg: '#0c2340', border: '#3b82f6', glow: 'rgba(59,130,246,0.2)', label: 'COMPAÑERO', labelColor: '#93c5fd' },
  2: { bg: '#052e16', border: '#22c55e', glow: 'rgba(34,197,94,0.2)', label: 'EXPLORADOR', labelColor: '#4ade80' },
  3: { bg: '#1e1b4b', border: '#818cf8', glow: 'rgba(129,140,248,0.25)', label: 'GUARDABOSQUES', labelColor: '#a5b4fc' },
  4: { bg: '#1c0a00', border: '#f59e0b', glow: 'rgba(245,158,11,0.3)', label: 'CAMPEÓN', labelColor: '#fcd34d' },
  5: { bg: '#0f0505', border: '#dc2626', glow: 'rgba(220,38,38,0.5)', label: 'LEGENDARIO', labelColor: '#fca5a5' },
};

// Colores de burbuja por tipo de mensaje
const BURBUJA_CONFIG = {
  bienvenida: { border: '#22c55e', accent: '#16a34a' },
  consejo:    { border: '#60a5fa', accent: '#2563eb' },
  descubrimiento: { border: '#fbbf24', accent: '#d97706' },
  celebrando: { border: '#a78bfa', accent: '#7c3aed' },
  nivel:      { border: '#f472b6', accent: '#db2777' },
  normal:     { border: '#6b7280', accent: '#4b5563' },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
const CompaneroVirtual = ({ mensaje, nivel = 1, emocion = 'feliz', tipo = 'normal' }) => {
  const [mostrarBurbuja, setMostrarBurbuja] = useState(false);
  const [mensajeActual, setMensajeActual] = useState('');
  const [textoVisible, setTextoVisible] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const nivelClamped = Math.min(Math.max(Math.floor(nivel), 1), 5);
  const frame = NIVEL_FRAME[nivelClamped];
  const burbuja = BURBUJA_CONFIG[tipo] || BURBUJA_CONFIG.normal;
  const ojos = ojosConfig[emocion] || ojosConfig.feliz;

  // Tamaño del pato según nivel (crece suavemente)
  const patoSize = 70 + nivelClamped * 4;

  // Aparece un mensaje nuevo
  useEffect(() => {
    if (mensaje && mensaje !== mensajeActual) {
      setMensajeActual(mensaje);
      setTextoVisible('');
      setCharIndex(0);
      setMostrarBurbuja(true);

      const timer = setTimeout(() => setMostrarBurbuja(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Efecto de escritura
  useEffect(() => {
    if (charIndex < mensajeActual.length) {
      const t = setTimeout(() => {
        setTextoVisible(prev => prev + mensajeActual[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 22);
      return () => clearTimeout(t);
    }
  }, [charIndex, mensajeActual]);

  const handleClickPato = (e) => {
    e.stopPropagation();
    setMostrarBurbuja(prev => !prev);
  };

  return (
    <>
      {/* Overlay cierra burbuja */}
      {mostrarBurbuja && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1500 }}
          onClick={() => setMostrarBurbuja(false)}
        />
      )}

      <div style={{
        position: 'fixed',
        bottom: 112,
        right: 16,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        pointerEvents: 'none',
      }}>

        {/* ── Burbuja de diálogo ── */}
        <AnimatePresence>
          {mostrarBurbuja && mensajeActual && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: 16, y: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, x: 16 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280 }}
              style={{
                pointerEvents: 'auto',
                maxWidth: 220,
                minWidth: 160,
                background: 'rgba(2,6,18,0.97)',
                backdropFilter: 'blur(10px)',
                border: `1.5px solid ${burbuja.border}`,
                borderRadius: '16px 16px 4px 16px',
                padding: '10px 14px',
                position: 'relative',
                boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${burbuja.border}22`,
              }}
            >
              {/* Indicador de tipo */}
              <div style={{
                position: 'absolute',
                top: -8,
                right: 12,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: burbuja.accent,
                border: '2px solid rgba(2,6,18,0.97)',
              }} />
              {/* Texto con efecto cursor */}
              <p style={{
                fontSize: 12,
                color: '#e2e8f0',
                lineHeight: 1.55,
                margin: 0,
              }}>
                {textoVisible}
                {charIndex < mensajeActual.length && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    style={{ display: 'inline-block', width: 2, height: 12, background: burbuja.border, marginLeft: 2, verticalAlign: 'middle', borderRadius: 1 }}
                  />
                )}
              </p>
              {/* Barra de expiración */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 8, ease: 'linear' }}
                style={{
                  height: 2,
                  background: burbuja.border,
                  borderRadius: 2,
                  marginTop: 8,
                  opacity: 0.5,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── El Pato ── */}
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ pointerEvents: 'auto', cursor: 'pointer', position: 'relative' }}
          onClick={handleClickPato}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          {/* Aura nivel 4-5 */}
          {nivelClamped >= 4 && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                background: `radial-gradient(ellipse, ${frame.glow}, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Marco del pato */}
          <div style={{
            background: frame.bg,
            border: `2px solid ${frame.border}`,
            borderRadius: 20,
            boxShadow: `0 0 16px ${frame.glow}`,
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PatoBase
              width={patoSize}
              height={patoSize * 1.15}
              accesorios={<AccesoriosNivel nivel={nivelClamped} />}
              ojos={ojos}
            />
          </div>

          {/* Etiqueta de nivel */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(2,6,18,0.9)',
            backdropFilter: 'blur(6px)',
            border: `1px solid ${frame.border}`,
            borderRadius: 20,
            padding: '2px 8px',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: frame.labelColor,
            whiteSpace: 'nowrap',
          }}>
            {frame.label} <span style={{ color: '#fbbf24' }}>NV.{nivelClamped}</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CompaneroVirtual;
