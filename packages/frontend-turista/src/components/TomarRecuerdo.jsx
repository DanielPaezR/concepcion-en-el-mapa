// components/TomarRecuerdo.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Download, RotateCcw, Check, Loader2, SwitchCamera } from 'lucide-react';
import api from '../services/api';

const NIVEL_INFO = {
  1: { emoji: '🥚', label: 'COMPAÑERO' },
  2: { emoji: '🦆', label: 'EXPLORADOR' },
  3: { emoji: '🦆', label: 'AVENTURERO' },
  4: { emoji: '🦆', label: 'GUARDABOSQUES' },
  5: { emoji: '🦆', label: 'CAMPEÓN' },
};

// Dibuja el marco decorado directamente sobre el canvas que ya tiene la
// foto — así el archivo final es una sola imagen, sin capas separadas.
function dibujarMarco(ctx, w, h, { lugarNombre, nivelActual }) {
  const fechaTexto = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  const nivelInfo = NIVEL_INFO[nivelActual] || NIVEL_INFO[1];
  const oro = '#e8c775';
  const crema = '#fdf6e3';

  // Franjas de contraste arriba/abajo para que el texto se lea sobre
  // cualquier foto de fondo.
  const gradTop = ctx.createLinearGradient(0, 0, 0, h * 0.19);
  gradTop.addColorStop(0, 'rgba(26,46,26,0.55)');
  gradTop.addColorStop(1, 'rgba(26,46,26,0)');
  ctx.fillStyle = gradTop;
  ctx.fillRect(0, 0, w, h * 0.19);

  const gradBottom = ctx.createLinearGradient(0, h * 0.73, 0, h);
  gradBottom.addColorStop(0, 'rgba(26,46,26,0)');
  gradBottom.addColorStop(1, 'rgba(26,46,26,0.9)');
  ctx.fillStyle = gradBottom;
  ctx.fillRect(0, h * 0.73, w, h * 0.27);

  // Borde fino doble
  const margen = w * 0.026;
  ctx.strokeStyle = oro;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = Math.max(2, w * 0.0028);
  ctx.strokeRect(margen, margen, w - margen * 2, h - margen * 2);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1, w * 0.0014);
  ctx.strokeRect(margen * 1.4, margen * 1.4, w - margen * 2.8, h - margen * 2.8);
  ctx.globalAlpha = 1;

  // Esquinas ornamentales
  const cornerSize = w * 0.06;
  const drawCorner = (x, y, rotDeg) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotDeg * Math.PI) / 180);
    ctx.strokeStyle = oro;
    ctx.lineWidth = Math.max(2, w * 0.0035);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, cornerSize * 0.8);
    ctx.quadraticCurveTo(0, 0, cornerSize * 0.8, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cornerSize * 0.12, cornerSize * 0.12, w * 0.006, 0, Math.PI * 2);
    ctx.fillStyle = oro;
    ctx.fill();
    ctx.restore();
  };
  drawCorner(margen, margen, 0);
  drawCorner(w - margen, margen, 90);
  drawCorner(w - margen, h - margen, 180);
  drawCorner(margen, h - margen, 270);

  // Wordmark arriba
  ctx.textAlign = 'center';
  ctx.fillStyle = crema;
  ctx.font = `700 ${w * 0.024}px sans-serif`;
  ctx.fillText('CONCEPCIÓN EN EL MAPA', w / 2, h * 0.075);
  ctx.fillStyle = oro;
  ctx.font = `600 ${w * 0.018}px sans-serif`;
  ctx.fillText('RECUERDO DESBLOQUEADO', w / 2, h * 0.105);

  // Sello de nivel, esquina superior derecha
  const selloX = w - margen - w * 0.08;
  const selloY = margen + w * 0.08;
  const selloR = w * 0.045;
  ctx.beginPath();
  ctx.arc(selloX, selloY, selloR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(26,46,26,0.85)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.strokeStyle = oro;
  ctx.stroke();
  ctx.font = `${selloR * 1.1}px sans-serif`;
  ctx.fillText(nivelInfo.emoji, selloX, selloY + selloR * 0.35);

  // Nombre del lugar + fecha, abajo
  ctx.fillStyle = crema;
  ctx.font = `700 ${w * 0.052}px Georgia, serif`;
  ctx.fillText(lugarNombre, w / 2, h * 0.855);

  ctx.strokeStyle = oro;
  ctx.lineWidth = Math.max(1, w * 0.0018);
  ctx.beginPath();
  ctx.moveTo(w * 0.4, h * 0.875);
  ctx.lineTo(w * 0.6, h * 0.875);
  ctx.stroke();

  ctx.fillStyle = oro;
  ctx.font = `${w * 0.024}px sans-serif`;
  ctx.fillText(fechaTexto, w / 2, h * 0.915);

  ctx.fillStyle = crema;
  ctx.globalAlpha = 0.8;
  ctx.font = `600 ${w * 0.018}px sans-serif`;
  ctx.fillText(`NIVEL ${nivelActual} · ${nivelInfo.label}`, w / 2, h * 0.945);
  ctx.globalAlpha = 1;
}

export default function TomarRecuerdo({ lugar, nivelActual, onClose, onSubido }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [modo, setModo] = useState('camara'); // camara | revisar | subiendo | listo
  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [errorCamara, setErrorCamara] = useState(false);
  const [error, setError] = useState('');

  const [facingMode, setFacingMode] = useState('environment');

  const iniciarCamara = useCallback((modo) => {
    // Siempre corta cualquier stream anterior y limpia la referencia antes
    // de pedir uno nuevo — el bug de "queda en negro" pasaba porque
    // streamRef.current seguía apuntando al stream viejo (ya detenido) en
    // vez de quedar en null, así que el código de "Repetir" pensaba que ya
    // había cámara activa y nunca pedía una nueva.
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setErrorCamara(false);

    return navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: modo }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setErrorCamara(true));
  }, []);

  useEffect(() => {
    let activo = true;
    iniciarCamara(facingMode);
    return () => {
      activo = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []); // solo al montar — cambios de facingMode los maneja voltearCamara directamente

  const componerDesdeFuente = useCallback((dibujarFuente, anchoFuente, altoFuente) => {
    const canvas = canvasRef.current;
    canvas.width = anchoFuente;
    canvas.height = altoFuente;
    const ctx = canvas.getContext('2d');
    dibujarFuente(ctx);
    dibujarMarco(ctx, anchoFuente, altoFuente, { lugarNombre: lugar.nombre, nivelActual });

    canvas.toBlob((blob) => {
      setFotoBlob(blob);
      setFotoUrl(URL.createObjectURL(blob));
      setModo('revisar');
    }, 'image/jpeg', 0.92);
  }, [lugar, nivelActual]);

  const capturarDeCamera = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    componerDesdeFuente((ctx) => ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight), video.videoWidth, video.videoHeight);
  };

  const voltearCamara = () => {
    const nuevoModo = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nuevoModo);
    iniciarCamara(nuevoModo);
  };

  const capturarDeArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const img = new Image();
    img.onload = () => {
      componerDesdeFuente((ctx) => ctx.drawImage(img, 0, 0, img.width, img.height), img.width, img.height);
    };
    img.src = URL.createObjectURL(archivo);
  };

  const reintentar = () => {
    setFotoBlob(null);
    setFotoUrl(null);
    setError('');
    setModo('camara');
    iniciarCamara(facingMode);
  };

  const descargar = () => {
    const a = document.createElement('a');
    a.href = fotoUrl;
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    a.download = `concepcion-en-el-mapa-${lugar.nombre.replace(/\s+/g, '-').toLowerCase()}-${fechaArchivo}.jpg`;
    a.click();
  };

  const guardarRecuerdo = async () => {
    setModo('subiendo');
    setError('');
    try {
      const formData = new FormData();
      formData.append('imagen', new File([fotoBlob], 'recuerdo.jpg', { type: 'image/jpeg' }));
      formData.append('lugar_id', lugar.id);
      await api.post('/recuerdos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setModo('listo');
      onSubido?.();
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar el recuerdo, pero ya lo tienes descargado si lo bajaste.');
      setModo('revisar');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: '#0a0e0a', zIndex: 3000, display: 'flex', flexDirection: 'column' }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <X size={22} />
      </button>

      {modo === 'camara' && (
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          {!errorCamara ? (
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: 24, textAlign: 'center', gap: 16 }}>
              <Camera size={40} color="#e8c775" />
              <p>No pudimos acceder a la cámara. Puedes elegir o tomar una foto desde tu galería.</p>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: '#e8c775', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700 }}>
                Elegir foto
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={capturarDeArchivo} style={{ display: 'none' }} />
            </div>
          )}

          {/* Guía visual del marco mientras encuadras — la versión final y
              definitiva se dibuja en el canvas al capturar. */}
          <div style={{ position: 'absolute', inset: '4%', border: '1.5px solid rgba(232,199,117,0.8)', borderRadius: 4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, textAlign: 'center', color: '#fdf6e3', fontWeight: 700, fontSize: 22, textShadow: '0 2px 8px rgba(0,0,0,0.6)', pointerEvents: 'none' }}>
            {lugar.nombre}
          </div>

          {!errorCamara && (
            <>
              <button
                onClick={capturarDeCamera}
                style={{
                  position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  width: 72, height: 72, borderRadius: '50%', background: '#fdf6e3',
                  border: '4px solid #e8c775', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Camera size={28} color="#1a2e1a" />
              </button>
              <button
                onClick={voltearCamara}
                title="Voltear cámara"
                style={{
                  position: 'absolute', bottom: 36, right: 24,
                  width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
                  border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <SwitchCamera size={22} color="white" />
              </button>
            </>
          )}
        </div>
      )}

      {(modo === 'revisar' || modo === 'subiendo' || modo === 'listo') && fotoUrl && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <img src={fotoUrl} alt="Recuerdo" style={{ flex: 1, width: '100%', objectFit: 'contain', background: '#000' }} />

          {error && (
            <div style={{ background: 'rgba(220,50,50,0.15)', color: '#ffb4b4', padding: 12, textAlign: 'center', fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, padding: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {modo === 'revisar' && (
              <>
                <button onClick={reintentar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 18px' }}>
                  <RotateCcw size={18} /> Repetir
                </button>
                <button onClick={descargar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 18px' }}>
                  <Download size={18} /> Descargar
                </button>
                <button onClick={guardarRecuerdo} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e8c775', color: '#1a2e1a', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700 }}>
                  <Check size={18} /> Guardar recuerdo
                </button>
              </>
            )}
            {modo === 'subiendo' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
                <Loader2 size={18} className="animate-spin" /> Guardando...
              </div>
            )}
            {modo === 'listo' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#a8e6a8', fontWeight: 700 }}>✅ ¡Recuerdo guardado! Ya está en tu perfil.</div>
                <button onClick={descargar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 18px' }}>
                  <Download size={18} /> Descargar de todas formas
                </button>
                <button onClick={onClose} style={{ background: '#e8c775', color: '#1a2e1a', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700 }}>
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </motion.div>
  );
}
