// components/GuiaVirtual.jsx
//
// Este componente maneja los toasts de notificación del mapa
// (descubrimientos, consejos, subida de nivel, etc.)
// Reemplaza la lógica duplicada que antes existía en GuiaVirtual
// y en el CompaneroVirtual. Úsalo así desde Mapa.jsx:
//
//   import GuiaVirtual from '../components/GuiaVirtual';
//   <GuiaVirtual mensaje={mensajeGuia} tipo={tipoGuia} />
//
// Los tipos disponibles son:
//   'bienvenida' | 'consejo' | 'descubrimiento' | 'celebrando' | 'nivel' | 'normal'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPO_CONFIG = {
  bienvenida:    { icon: '🧭', color: '#22c55e',  bg: 'rgba(5,46,22,0.97)',   border: '#16a34a' },
  consejo:       { icon: '📜', color: '#60a5fa',  bg: 'rgba(12,28,64,0.97)',  border: '#2563eb' },
  descubrimiento:{ icon: '✨', color: '#fbbf24',  bg: 'rgba(28,20,0,0.97)',   border: '#d97706' },
  celebrando:    { icon: '🎉', color: '#a78bfa',  bg: 'rgba(30,10,60,0.97)',  border: '#7c3aed' },
  nivel:         { icon: '⭐', color: '#f472b6',  bg: 'rgba(40,4,28,0.97)',   border: '#db2777' },
  normal:        { icon: '🗺️', color: '#94a3b8',  bg: 'rgba(10,14,26,0.97)', border: '#475569' },
};

const GuiaVirtual = ({ mensaje, tipo = 'normal', duracion = 5000 }) => {
  const [visible, setVisible] = useState(false);
  const [mensajeActual, setMensajeActual] = useState('');
  const config = TIPO_CONFIG[tipo] || TIPO_CONFIG.normal;

  useEffect(() => {
    if (!mensaje) return;

    setMensajeActual(mensaje);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), duracion);
    return () => clearTimeout(timer);
  }, [mensaje, duracion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={mensajeActual}
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.92 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          style={{
            position: 'fixed',
            bottom: 140,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1800,
            pointerEvents: 'none',
            width: 'max-content',
            maxWidth: 300,
          }}
        >
          <div style={{
            background: config.bg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${config.border}`,
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {/* Icono */}
            <span style={{ fontSize: 18, lineHeight: 1 }}>{config.icon}</span>

            {/* Mensaje */}
            <p style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 500,
              color: '#f1f5f9',
              lineHeight: 1.5,
            }}>
              {mensajeActual}
            </p>

            {/* Dot de color del tipo */}
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: config.color,
              flexShrink: 0,
            }} />
          </div>

          {/* Barra de progreso de expiración */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duracion / 1000, ease: 'linear' }}
            style={{
              height: 2,
              background: config.color,
              borderRadius: '0 0 14px 14px',
              opacity: 0.5,
              marginTop: -1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuiaVirtual;
