// components/GuardianesMapa.jsx
// Piezas del mapa para los guardianes anclados: el pin, el popup y el panel
// de lista que se abre desde el menú lateral.
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Distancia a la que otros exploradores ven un guardián (igual que el backend)
export const RADIO_GUARDIANES_M = 300;

const COLOR_NIVEL = { 1: '#60a5fa', 2: '#22c55e', 3: '#818cf8', 4: '#f59e0b', 5: '#dc2626' };

const nombreGuardian = (g) => g.nombre_publico || g.usuario_nombre || 'Guardián';

const formatearDistancia = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);

// Pin del guardián. "propio" es el doble estático que el dueño ve donde lo
// dejó: sin animación, translúcido y con borde punteado.
export const GuardianPin = React.memo(({ guardian, propio = false, isMobile }) => {
  const size = isMobile ? 46 : 54;
  const color = COLOR_NIVEL[Math.min(Math.max(parseInt(guardian.nivel) || 1, 1), 5)];
  const inicial = nombreGuardian(guardian).charAt(0).toUpperCase();

  const contenido = (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        border: `3px ${propio ? 'dashed' : 'solid'} ${color}`,
        background: '#0f172a',
        opacity: propio ? 0.8 : 1,
        filter: propio ? 'grayscale(0.35)' : 'none',
        boxShadow: propio ? '0 4px 14px rgba(0,0,0,0.5)' : `0 0 18px ${color}99, 0 4px 14px rgba(0,0,0,0.5)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: size * 0.4,
      }}>
        {guardian.foto_perfil_url
          ? <img src={guardian.foto_perfil_url} alt={nombreGuardian(guardian)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : inicial}
      </div>
      <span style={{ position: 'absolute', top: -6, right: -6, fontSize: isMobile ? 16 : 18 }}>🛡️</span>
      <div style={{
        marginTop: 3, padding: '1px 7px', borderRadius: 10,
        background: 'rgba(2,6,18,0.85)', border: `1px solid ${color}`,
        color: 'white', fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap',
      }}>
        {propio ? 'TU GUARDIÁN' : `NV.${guardian.nivel || 1}`}
      </div>
    </div>
  );

  if (propio) return contenido;
  return (
    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
      {contenido}
    </motion.div>
  );
});

export const GuardianPopupContent = ({ guardian, propio, distancia, onVerPerfil, onSaludar, onRetirar }) => (
  <div style={{ padding: '12px 14px', minWidth: 190, maxWidth: 'min(240px, 78vw)', boxSizing: 'border-box' }}>
    <div style={{ fontSize: 10, color: '#a5b4fc', fontWeight: 700, letterSpacing: '.06em', marginBottom: 2 }}>
      {propio ? '🛡️ TU GUARDIÁN ANCLADO' : `🛡️ GUARDIÁN · NIVEL ${guardian.nivel || 1}`}
    </div>
    <div style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc', marginBottom: 6 }}>{nombreGuardian(guardian)}</div>
    {guardian.mensaje && (
      <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(129,140,248,0.4)', borderRadius: 8, padding: '6px 8px', fontSize: 12.5, color: '#c7d2fe', marginBottom: 8, fontStyle: 'italic' }}>
        “{guardian.mensaje}”
      </div>
    )}
    <div style={{ fontSize: 11.5, color: 'rgba(226,232,240,0.75)', marginBottom: 8, lineHeight: 1.5 }}>
      {distancia != null && <div>📍 A {formatearDistancia(distancia)} de ti</div>}
      {propio && <div>👣 {guardian.visitas || 0} visita{Number(guardian.visitas) === 1 ? '' : 's'}</div>}
      {guardian.fecha_fin && <div>⏳ Activo hasta el {new Date(guardian.fecha_fin).toLocaleDateString('es-CO')}</div>}
      {propio && <div>👁️ Otros lo ven a menos de {RADIO_GUARDIANES_M} m</div>}
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      {!propio && onSaludar && (
        <button onClick={onSaludar} style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '8px 6px', fontWeight: 700, fontSize: 12 }}>
          👋 Saludar
        </button>
      )}
      <button onClick={onVerPerfil} style={{ flex: 1, background: propio ? '#4f46e5' : '#e0e7ff', color: propio ? 'white' : '#3730a3', border: 'none', borderRadius: 8, padding: '8px 6px', fontWeight: 700, fontSize: 12 }}>
        Ver perfil
      </button>
      {propio && onRetirar && (
        <button onClick={onRetirar} style={{ flex: 1, background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, padding: '8px 6px', fontWeight: 700, fontSize: 12 }}>
          Retirar
        </button>
      )}
    </div>
  </div>
);

// Panel con tu guardián y los guardianes cercanos (se abre desde el menú)
export const GuardianesPanel = ({ show, miGuardian, cercanos, userPosition, calcularDistancia, nivel, onSeleccionar, onAnclar, onClose }) => {
  const distanciaA = (g) => (userPosition
    ? calcularDistancia(userPosition.lat, userPosition.lng, parseFloat(g.latitud), parseFloat(g.longitud))
    : null);

  const Fila = ({ g, propio }) => {
    const d = propio ? distanciaA(g) : (g.distancia_m != null ? Number(g.distancia_m) : distanciaA(g));
    return (
      <button
        onClick={() => onSeleccionar(g, propio)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 12, color: 'white', textAlign: 'left', cursor: 'pointer', marginBottom: 8 }}
      >
        <span style={{ fontSize: 22 }}>🛡️</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontWeight: 700, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {propio ? 'Tu guardián' : nombreGuardian(g)}
          </span>
          <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(226,232,240,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {g.mensaje ? `“${g.mensaje}”` : `Nivel ${g.nivel || 1}`}
          </span>
        </span>
        {d != null && <span style={{ fontSize: 11.5, color: '#a5b4fc', whiteSpace: 'nowrap' }}>{formatearDistancia(d)}</span>}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22 }}
            className="hud-font"
            style={{ background: 'rgba(4,10,30,0.99)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 24, maxWidth: 380, width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: 22, boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#c7d2fe', fontWeight: 700, fontSize: 16, margin: 0 }}>🛡️ Guardianes</h3>
              <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, width: 30, height: 30, color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '.12em', marginBottom: 8 }}>TU GUARDIÁN</div>
            {miGuardian ? (
              <Fila g={miGuardian} propio />
            ) : (
              <div style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12.5, marginBottom: 12, lineHeight: 1.5 }}>
                {nivel >= 5 ? (
                  <>
                    Aún no has anclado tu guardián.{' '}
                    <button onClick={onAnclar} style={{ background: 'none', border: 'none', color: '#a5b4fc', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 12.5 }}>
                      Anclarlo aquí
                    </button>
                  </>
                ) : (
                  `Llega a nivel 5 para anclar tu guardián (nivel actual: ${nivel}).`
                )}
              </div>
            )}

            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '.12em', margin: '8px 0' }}>
              CERCANOS (MENOS DE {RADIO_GUARDIANES_M} M)
            </div>
            {!userPosition ? (
              <div style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12.5 }}>Activa tu ubicación para ver los guardianes cercanos.</div>
            ) : cercanos.length === 0 ? (
              <div style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12.5 }}>No hay guardianes de otros exploradores cerca de ti.</div>
            ) : (
              cercanos.map((g) => <Fila key={g.id} g={g} />)
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
