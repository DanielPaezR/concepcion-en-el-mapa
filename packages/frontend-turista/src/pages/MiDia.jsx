// pages/MiDia.jsx
// "Mi día en Concepción": resumen de lo que hizo el explorador hoy, para
// cerrar la visita con un buen recuerdo (la gente recuerda una experiencia
// sobre todo por su mejor momento y por cómo terminó) y poder compartirlo.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Share2, Play, Gift } from 'lucide-react';
import api from '../services/api';
import { useVolver } from '../utils/navegacion';
import { compartir } from '../utils/compartir';
import { celebrar } from '../utils/celebrar';
import { PatoBase, ojosConfig } from '../components/CompaneroVirtual';

const NOMBRE_NIVEL = { 1: 'Principiante', 2: 'Explorador', 3: 'Aventurero', 4: 'Guardián', 5: 'Leyenda' };

const curiosidadesVistas = () => {
  try { return JSON.parse(localStorage.getItem('curiosidades_vistas') || '[]').length; } catch { return 0; }
};

const Dato = ({ valor, texto, color, retraso }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: retraso }}
    style={{ padding: '14px 10px', borderRadius: 18, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div style={{ fontSize: 28, fontWeight: 900, color }}>{valor}</div>
    <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.65)', marginTop: 2 }}>{texto}</div>
  </motion.div>
);

export default function MiDia() {
  const volver = useVolver('/');
  const { data: hoy, isLoading, isError } = useQuery({
    queryKey: ['resumen-hoy'],
    queryFn: async () => (await api.get('/descubrimientos/resumen-hoy')).data,
  });
  const curiosidades = curiosidadesVistas();
  const algoHoy = hoy && (hoy.lugares.length > 0 || hoy.retos > 0);

  // Si hizo algo hoy, se celebra al abrir el resumen
  useEffect(() => { if (algoHoy) celebrar('normal'); }, [algoHoy]);

  const compartirDia = () => compartir({
    titulo: 'Mi día en Concepción',
    texto: `🦆 Hoy en Concepción, Antioquia: descubrí ${hoy.lugares.length} ${hoy.lugares.length === 1 ? 'lugar' : 'lugares'}, `
      + `resolví ${hoy.retos} ${hoy.retos === 1 ? 'reto' : 'retos'} y gané ${hoy.xp} XP. `
      + `Voy en nivel ${hoy.nivel} (${NOMBRE_NIVEL[hoy.nivel] || 'Explorador'}). ¿Te le mides?`,
  });

  return (
    <div style={{ minHeight: '100vh', color: '#E8EEF8', fontFamily: 'Inter, system-ui, sans-serif', padding: '20px 18px 40px',
      background: 'radial-gradient(120% 60% at 50% 0%, rgba(246,196,83,0.16), transparent 60%), #070B11' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <button onClick={volver} style={{ background: 'none', border: 0, color: 'rgba(226,232,240,0.7)', fontSize: 15, cursor: 'pointer', padding: 0 }}>← Volver</button>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }}
            style={{ display: 'inline-block' }}>
            <PatoBase width={78} height={92} ojos={algoHoy ? ojosConfig.celebrando : ojosConfig.feliz} />
          </motion.div>
          <div style={{ fontSize: 12, color: '#F6C453', fontWeight: 700, letterSpacing: '.14em', marginTop: 6 }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: 28, fontWeight: 900, margin: '6px 0 0', color: 'white' }}>Mi día en Concepción</h1>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', marginTop: 30, color: 'rgba(226,232,240,0.6)' }}>Contando tus aventuras…</p>
        ) : isError ? (
          <p style={{ textAlign: 'center', marginTop: 30, color: '#fca5a5' }}>No pudimos cargar tu día. Revisa tu conexión.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
              <Dato valor={hoy.lugares.length} texto={hoy.lugares.length === 1 ? 'lugar descubierto' : 'lugares descubiertos'} color="#4ADE80" retraso={0.1} />
              <Dato valor={hoy.retos} texto={hoy.retos === 1 ? 'reto resuelto' : 'retos resueltos'} color="#FBBF24" retraso={0.2} />
              <Dato valor={`+${hoy.xp}`} texto="XP de hoy" color="#38BDF8" retraso={0.3} />
              <Dato valor={curiosidades} texto={curiosidades === 1 ? 'curiosidad vista' : 'curiosidades vistas'} color="#F472B6" retraso={0.4} />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ marginTop: 14, padding: '12px 14px', borderRadius: 16, background: 'rgba(246,196,83,0.1)', border: '1px solid rgba(246,196,83,0.3)', textAlign: 'center' }}>
              <span style={{ color: 'rgba(226,232,240,0.75)', fontSize: 13 }}>Vas en </span>
              <b style={{ color: '#FFE39A' }}>nivel {hoy.nivel} · {NOMBRE_NIVEL[hoy.nivel] || 'Explorador'}</b>
              {hoy.cupones > 0 && <div style={{ fontSize: 13, color: '#FFE39A', marginTop: 4 }}>🎁 ¡Y hoy ganaste {hoy.cupones === 1 ? 'un cupón' : `${hoy.cupones} cupones`}!</div>}
            </motion.div>

            {hoy.lugares.length > 0 && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(226,232,240,0.75)', lineHeight: 1.7 }}>
                <b style={{ color: 'white' }}>Hoy pasaste por:</b> {hoy.lugares.join(' · ')}
              </div>
            )}

            {algoHoy ? (
              <button onClick={compartirDia}
                style={{ marginTop: 22, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 0', borderRadius: 16, border: 0, cursor: 'pointer', fontWeight: 800, fontSize: 16,
                  background: 'linear-gradient(135deg,#F6C453,#FFB800)', color: '#1a1300', boxShadow: '0 6px 0 #B7791F' }}>
                <Share2 size={18} /> Compartir mi día
              </button>
            ) : (
              <p style={{ marginTop: 22, textAlign: 'center', color: 'rgba(226,232,240,0.7)', fontSize: 14 }}>
                Hoy todavía no has explorado. ¡El pueblo te está esperando!
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <Link to="/" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                <Play size={15} fill="currentColor" /> Seguir jugando
              </Link>
              <Link to="/mis-cupones" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                <Gift size={15} /> Mis cupones
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
