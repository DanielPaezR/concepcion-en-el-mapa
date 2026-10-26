// components/Celebracion.jsx
// Dibuja el confeti de celebrar() y hace vibrar el teléfono. El confeti es
// CSS puro (lo anima el compositor, no JavaScript) para no frenar el mapa, y
// no se muestra si la persona pidió "reducir movimiento".
import { useEffect, useState } from 'react';
import { sonidoActivo } from '../utils/celebrar';

// Dorado para las recompensas, con toques de los colores del juego
const COLORES = ['#F6C453', '#FFE39A', '#FFB800', '#22C55E', '#38BDF8', '#F472B6'];

const VIBRACION = { normal: [35], grande: [40, 60, 40, 60, 90] };

// Notas cortas generadas con Web Audio (sin descargar archivos de sonido)
const NOTAS = { normal: [659, 880], grande: [523, 659, 784, 1047] };
function sonar(tipo) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    NOTAS[tipo].forEach((frecuencia, i) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      const inicio = ctx.currentTime + i * 0.09;
      osc.type = 'triangle';
      osc.frequency.value = frecuencia;
      vol.gain.setValueAtTime(0.0001, inicio);
      vol.gain.exponentialRampToValueAtTime(0.18, inicio + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.22);
      osc.connect(vol).connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.25);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* el sonido es un extra: si falla, no pasa nada */ }
}

function crearPiezas(tipo) {
  const cantidad = tipo === 'grande' ? 46 : 24;
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = (Math.PI * 2 * i) / cantidad + Math.random() * 0.4;
    const distancia = (tipo === 'grande' ? 170 : 120) + Math.random() * 90;
    return {
      id: i,
      dx: Math.cos(angulo) * distancia,
      // Sube y cae un poco más de lo que sube
      dy: Math.sin(angulo) * distancia * 0.7 + 120,
      giro: Math.round(Math.random() * 720 - 360),
      retraso: Math.random() * 0.08,
      color: COLORES[i % COLORES.length],
      ancho: 6 + Math.random() * 5,
      redondo: Math.random() > 0.6,
    };
  });
}

export default function Celebracion() {
  const [rafaga, setRafaga] = useState(null);

  useEffect(() => {
    let temporizador;
    const alCelebrar = (e) => {
      const tipo = e.detail?.tipo === 'grande' ? 'grande' : 'normal';
      setRafaga({ clave: Date.now(), piezas: crearPiezas(tipo) });
      try { navigator.vibrate?.(VIBRACION[tipo]); } catch { /* sin vibración */ }
      if (sonidoActivo()) sonar(tipo);
      clearTimeout(temporizador);
      temporizador = setTimeout(() => setRafaga(null), 1500);
    };
    window.addEventListener('cem-celebrar', alCelebrar);
    return () => { window.removeEventListener('cem-celebrar', alCelebrar); clearTimeout(temporizador); };
  }, []);

  if (!rafaga) return null;
  return (
    <div key={rafaga.clave} className="cem-confeti-capa" aria-hidden="true">
      {rafaga.piezas.map((p) => (
        <span key={p.id} className="cem-confeti"
          style={{
            '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--giro': `${p.giro}deg`,
            animationDelay: `${p.retraso}s`, background: p.color,
            width: p.ancho, height: p.redondo ? p.ancho : p.ancho * 0.45,
            borderRadius: p.redondo ? '50%' : 2,
          }} />
      ))}
    </div>
  );
}
