// components/CuponGanado.jsx
// Aviso de cupón ganado al llegar a nivel 3 o 5. Antes el servidor generaba
// el código pero la app nunca se lo mostraba al turista.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gift, Copy, Check } from 'lucide-react';
import { celebrar } from '../utils/celebrar';

export default function CuponGanado({ codigos, onClose }) {
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState('');
  // Ganar un cupón es de los mejores momentos del juego
  useEffect(() => { if (codigos?.length) celebrar('grande'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!codigos?.length) return null;

  const copiar = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(''), 1800);
    } catch { /* sin portapapeles: el código igual queda en Mis cupones */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 3500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}
        style={{ width: '100%', maxWidth: 360, borderRadius: 24, padding: 24, textAlign: 'center', color: 'white',
          background: 'radial-gradient(120% 80% at 50% 0%, rgba(246,196,83,0.28), transparent 60%), #0b1220',
          border: '1px solid rgba(246,196,83,0.45)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
      >
        <div style={{ width: 64, height: 64, margin: '0 auto', borderRadius: 20, display: 'grid', placeItems: 'center',
          background: 'linear-gradient(135deg,#F6C453,#FFB800)', color: '#1a1300', boxShadow: '0 0 30px rgba(246,196,83,0.45)' }}>
          <Gift size={32} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 14 }}>¡Ganaste un cupón!</h2>
        <p style={{ color: 'rgba(226,232,240,0.75)', fontSize: 14, lineHeight: 1.5, marginTop: 6 }}>
          Muéstralo en cualquier comercio aliado de Concepción para recibir su beneficio.
        </p>

        {codigos.map(({ codigo }) => (
          <button key={codigo} onClick={() => copiar(codigo)}
            style={{ marginTop: 16, width: '100%', padding: '14px 12px', borderRadius: 16, cursor: 'pointer',
              border: '2px dashed rgba(246,196,83,0.7)', background: 'rgba(246,196,83,0.08)', color: '#FFE39A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, letterSpacing: '.08em' }}>{codigo}</span>
            {copiado === codigo ? <Check size={18} /> : <Copy size={18} style={{ opacity: 0.7 }} />}
          </button>
        ))}
        <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 12, marginTop: 8 }}>
          {copiado ? '¡Copiado!' : 'Toca el código para copiarlo. Siempre lo tendrás en "Mis cupones".'}
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={() => { onClose(); navigate('/mis-cupones'); }}
            style={{ flex: 1, padding: '12px 0', borderRadius: 14, border: 0, cursor: 'pointer', fontWeight: 800,
              background: 'linear-gradient(135deg,#F6C453,#FFB800)', color: '#1a1300' }}>
            Ver dónde usarlo
          </button>
          <button onClick={onClose}
            style={{ flex: 1, padding: '12px 0', borderRadius: 14, cursor: 'pointer', fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(226,232,240,0.8)' }}>
            Seguir jugando
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
