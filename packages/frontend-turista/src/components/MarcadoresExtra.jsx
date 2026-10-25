// components/MarcadoresExtra.jsx
// Marcadores de eventos del pueblo y curiosidades, y el filtro por tipo de
// marcador del mapa. Las curiosidades no forman parte del recorrido ni dan XP:
// solo aparecen cuando el explorador pasa cerca.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { imagenLigera } from '../utils/imagenes';

// Distancia a la que se "activa" una curiosidad
export const RADIO_CURIOSIDADES_M = 150;

export const TIPOS_MARCADOR = [
  { id: 'lugares', label: 'Lugares', emoji: '📍' },
  { id: 'eventosPueblo', label: 'Eventos', emoji: '🎉' },
  { id: 'curiosidades', label: 'Curiosidades', emoji: '💡' },
  { id: 'comercios', label: 'Comercios', emoji: '🏪' },
  { id: 'retos', label: 'Retos', emoji: '❓' },
  { id: 'guardianes', label: 'Guardianes', emoji: '🛡️' },
  { id: 'guias', label: 'Guías', emoji: '🧭' },
];

const CLAVE_FILTROS = 'filtros_mapa';

// Filtros visibles, recordados entre visitas
export const useFiltrosMapa = () => {
  const [filtros, setFiltros] = useState(() => {
    const todos = Object.fromEntries(TIPOS_MARCADOR.map((t) => [t.id, true]));
    try {
      return { ...todos, ...JSON.parse(localStorage.getItem(CLAVE_FILTROS) || '{}') };
    } catch {
      return todos;
    }
  });
  const alternar = (id) => setFiltros((prev) => {
    const nuevos = { ...prev, [id]: !prev[id] };
    try { localStorage.setItem(CLAVE_FILTROS, JSON.stringify(nuevos)); } catch { /* sin almacenamiento */ }
    return nuevos;
  });
  return [filtros, alternar];
};

// ── Formato de fechas ("2026-10-23T15:00" es hora local) ─────────────
const fechaCorta = (texto) => new Date(texto).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const etiquetaFecha = (evento) => {
  const inicio = new Date(evento.fecha_inicio);
  const ahora = new Date();
  if (inicio <= ahora) return 'AHORA';
  const mismoDia = inicio.toDateString() === ahora.toDateString();
  if (mismoDia) return `HOY ${inicio.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}`;
  return inicio.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).toUpperCase();
};

// ── Eventos del pueblo ──────────────────────────────────────────────
export const EventoComunidadPin = React.memo(({ evento, isMobile }) => {
  const size = isMobile ? 44 : 50;
  const etiqueta = etiquetaFecha(evento);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
      <motion.div className={etiqueta === 'AHORA' ? 'cem-late' : undefined}
        style={{
          width: size, height: size, borderRadius: 14, overflow: 'hidden',
          background: 'linear-gradient(135deg, #db2777, #7c3aed)',
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 0 18px rgba(219,39,119,0.6), 0 4px 14px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.48,
        }}
      >
        {evento.imagen_url
          ? <img src={imagenLigera(evento.imagen_url, 120)} alt={evento.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '🎉'}
      </motion.div>
      <div style={{
        marginTop: 3, padding: '1px 7px', borderRadius: 10, whiteSpace: 'nowrap',
        background: etiqueta === 'AHORA' ? '#db2777' : 'rgba(2,6,18,0.85)',
        border: '1px solid #f472b6', color: 'white', fontSize: 9, fontWeight: 700,
      }}>
        {etiqueta}
      </div>
    </div>
  );
});

export const EventoComunidadPopupContent = ({ evento }) => (
  <div style={{ padding: '12px 14px', minWidth: 200, maxWidth: 'min(250px, 78vw)', boxSizing: 'border-box' }}>
    {evento.imagen_url && (
      <img src={imagenLigera(evento.imagen_url, 480)} alt={evento.titulo} loading="lazy" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
    )}
    <div style={{ fontSize: 10, color: '#f9a8d4', fontWeight: 700, letterSpacing: '.06em', marginBottom: 2 }}>🎉 EVENTO DEL PUEBLO</div>
    <div style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc', marginBottom: 6 }}>{evento.titulo}</div>
    <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.8)', lineHeight: 1.55, marginBottom: evento.descripcion ? 8 : 0 }}>
      <div>📅 {fechaCorta(evento.fecha_inicio)}{evento.fecha_fin ? ` – ${fechaCorta(evento.fecha_fin)}` : ''}</div>
      {evento.lugar_texto && <div>📍 {evento.lugar_texto}</div>}
      <div>👤 Organiza: {evento.comercio_nombre || evento.creador_nombre}</div>
    </div>
    {evento.descripcion && (
      <div style={{ fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-line', maxHeight: 120, overflowY: 'auto' }}>
        {evento.descripcion}
      </div>
    )}
  </div>
);

// ── Curiosidades ────────────────────────────────────────────────────
export const CuriosidadPin = React.memo(({ curiosidad, vista, isMobile }) => {
  const size = isMobile ? 40 : 46;
  return (
    <motion.div className={vista ? undefined : 'cem-balanceo'}
      style={{
        width: size, height: size, borderRadius: '50%', cursor: 'pointer',
        background: 'radial-gradient(circle at 35% 35%, #fef3c7, #f59e0b 60%, #b45309)',
        border: `2px solid ${vista ? 'rgba(255,255,255,0.5)' : 'white'}`,
        boxShadow: vista ? '0 4px 12px rgba(0,0,0,0.45)' : '0 0 22px rgba(245,158,11,0.85), 0 4px 12px rgba(0,0,0,0.45)',
        opacity: vista ? 0.8 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5,
      }}
      title={curiosidad.titulo}
    >
      💡
    </motion.div>
  );
});

export const CuriosidadModal = ({ curiosidad, onClose }) => (
  <AnimatePresence>
    {curiosidad && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 22 }}
          style={{ background: 'rgba(4,10,30,0.99)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 22, maxWidth: 400, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 0 80px rgba(0,0,0,0.9)', position: 'relative' }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, width: 32, height: 32, color: 'white', fontSize: 18, cursor: 'pointer' }}>×</button>
          {curiosidad.imagen_url && (
            <img src={imagenLigera(curiosidad.imagen_url, 640)} alt={curiosidad.titulo} loading="lazy" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: '22px 22px 0 0', display: 'block' }} />
          )}
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 10, color: '#fcd34d', fontWeight: 700, letterSpacing: '.12em', marginBottom: 4 }}>💡 ¿SABÍAS QUE...?</div>
            <h3 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 18, margin: '0 0 10px' }}>{curiosidad.titulo}</h3>
            <p style={{ color: 'rgba(226,232,240,0.85)', fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>{curiosidad.descripcion}</p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Filtro por tipo de marcador ─────────────────────────────────────
export const FiltroMarcadores = ({ filtros, onAlternar, isMobile, estilos, estiloActual, onCambiarEstilo }) => {
  const [abierto, setAbierto] = useState(false);
  const ocultos = TIPOS_MARCADOR.filter((t) => !filtros[t.id]).length;
  const size = isMobile ? 42 : 46;
  const contenedorRef = useRef(null);

  // Se cierra al tocar fuera del panel. Se escucha en el documento (en fase
  // de captura, porque el mapa detiene sus eventos) en vez de poner una capa
  // encima, que bloquearía el arrastre y el zoom del mapa.
  useEffect(() => {
    if (!abierto) return;
    const cerrarSiEsFuera = (e) => {
      if (!contenedorRef.current?.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('pointerdown', cerrarSiEsFuera, true);
    return () => document.removeEventListener('pointerdown', cerrarSiEsFuera, true);
  }, [abierto]);

  return (
    <div ref={contenedorRef} style={{ position: 'absolute', bottom: isMobile ? 152 : 164, left: isMobile ? 12 : 16, zIndex: 1000 }}>
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute', bottom: size + 8, left: 0, width: 200,
              background: 'rgba(4,10,30,0.97)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 16,
              padding: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            }}
          >
            {estilos && (
              <>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '.14em', margin: '2px 4px 8px' }}>ESTILO DEL MAPA</div>
                <div style={{ color: 'rgba(226,232,240,0.45)', fontSize: 10, margin: '-4px 4px 8px' }}>Los 3D usan más batería y datos</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Object.keys(estilos).length, 2)}, 1fr)`, gap: 6, marginBottom: 12 }}>
                  {Object.entries(estilos).map(([clave, e]) => (
                    <button key={clave} onClick={() => onCambiarEstilo(clave)}
                      style={{
                        padding: '7px 6px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        border: `1px solid ${estiloActual === clave ? '#60a5fa' : 'rgba(255,255,255,0.12)'}`,
                        background: estiloActual === clave ? 'rgba(96,165,250,0.22)' : 'rgba(255,255,255,0.04)',
                        color: estiloActual === clave ? '#f8fafc' : 'rgba(226,232,240,0.6)',
                      }}>
                      {e.emoji} {e.nombre}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '.14em', margin: '2px 4px 8px' }}>MOSTRAR EN EL MAPA</div>
            {TIPOS_MARCADOR.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => onAlternar(tipo.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', marginBottom: 2,
                  background: filtros[tipo.id] ? 'rgba(96,165,250,0.12)' : 'transparent',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  color: filtros[tipo.id] ? '#f8fafc' : 'rgba(226,232,240,0.4)', fontSize: 13, textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 15, filter: filtros[tipo.id] ? 'none' : 'grayscale(1)' }}>{tipo.emoji}</span>
                <span style={{ flex: 1 }}>{tipo.label}</span>
                <span style={{
                  width: 30, height: 17, borderRadius: 9, position: 'relative',
                  background: filtros[tipo.id] ? '#3b82f6' : 'rgba(255,255,255,0.15)', transition: 'background .2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 2, left: filtros[tipo.id] ? 15 : 2, width: 13, height: 13,
                    borderRadius: '50%', background: 'white', transition: 'left .2s',
                  }} />
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setAbierto((v) => !v)}
        whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.92 }}
        title="Filtrar marcadores"
        className="hud-btn hud-btn-blue"
        style={{ width: size, height: size, borderRadius: '50%', position: 'relative' }}
      >
        <SlidersHorizontal size={isMobile ? 18 : 20} color="#60a5fa" />
        {ocultos > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, borderRadius: 9, padding: '0 4px',
            background: '#f59e0b', color: '#0f172a', fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{ocultos}</span>
        )}
      </motion.button>
    </div>
  );
};
