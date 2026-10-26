// pages/LandingPage.jsx
// Inicio del pueblo: es lo que abre el QR de los letreros. Tiene dos caminos:
// jugar (el mapa) o explorar sin jugar (comercios con descuentos, anuncios y
// eventos del pueblo), porque no todos los que la abren vienen a jugar.
// Pensada primero para el teléfono. No carga Mapbox GL: la vista previa del
// juego es una imagen estática del mapa real (Static Images API).

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Play, MapPin, Footprints, Trophy, ChevronDown, ChevronRight, Store, Megaphone,
  CalendarDays, Gift, MessageCircle, Star, Plus,
} from 'lucide-react';
import { PatoBase, ojosConfig } from '../components/CompaneroVirtual';
import api from '../services/api';
import { imagenLigera } from '../utils/imagenes';
import { categoriaComercio } from '../data/comercios';
import { BotonVoy } from '../components/MarcadoresExtra';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
// Parque principal de Concepción, inclinado como se ve en el juego
const MAPA_PREVIA = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/-75.2591,6.3951,16.4,12,55/340x620@2x?attribution=false&logo=false&access_token=${MAPBOX_TOKEN}`
  : null;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');

.lp{
  --oro:#F6C453; --oro2:#FFB800; --fondo:#070B11; --texto:#E8EEF8; --suave:#9AA8BF;
  --verde:#22C55E; --tarjeta:rgba(255,255,255,.05); --borde:rgba(255,255,255,.08);
  min-height:100vh; color:var(--texto); font-family:'Inter',system-ui,sans-serif;
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(34,197,94,.16), transparent 60%),
    radial-gradient(80% 50% at 100% 100%, rgba(246,196,83,.12), transparent 60%),
    var(--fondo);
  overflow-x:hidden;
}
.lp *{ box-sizing:border-box; margin:0; padding:0; }
.lp a{ text-decoration:none; }
.lp svg{ display:inline-block; } /* Tailwind deja los svg en bloque */
.lp-wrap{ max-width:1080px; margin:0 auto; padding:0 20px; }

/* Barra superior */
.lp-top{ display:flex; align-items:center; justify-content:space-between; padding:16px 20px; max-width:1080px; margin:0 auto; }
.lp-marca{ display:flex; align-items:center; gap:10px; color:white; }
.lp-marca-icono{ width:36px; height:36px; border-radius:12px; display:grid; place-items:center;
  background:linear-gradient(135deg,var(--oro),var(--oro2)); color:#111; box-shadow:0 0 22px rgba(246,196,83,.35); }
.lp-marca b{ font-family:'Cinzel',serif; font-size:15px; letter-spacing:.04em; display:block; line-height:1; }
.lp-marca small{ font-size:11px; color:var(--suave); }
.lp-top-jugar{ font-size:13px; font-weight:700; color:var(--oro); padding:8px 14px; border-radius:999px;
  border:1px solid rgba(246,196,83,.35); background:rgba(246,196,83,.08); }

/* Portada */
.lp-hero{ display:grid; gap:28px; align-items:center; padding:12px 0 40px; }
.lp-ubicacion{ display:inline-flex; align-items:center; gap:8px; padding:7px 12px; border-radius:999px;
  background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.3); color:#86EFAC; font-size:12px; font-weight:600; }
.lp-ubicacion i{ width:8px; height:8px; border-radius:50%; background:var(--verde); box-shadow:0 0 0 0 rgba(34,197,94,.7);
  animation:lp-ping 1.8s infinite; }
@keyframes lp-ping{ 0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)} 100%{box-shadow:0 0 0 10px rgba(34,197,94,0)} }
.lp-titulo{ font-family:'Cinzel',serif; font-weight:900; font-size:clamp(36px,10vw,64px); line-height:1.02;
  letter-spacing:-.02em; margin-top:16px; color:white; }
.lp-titulo em{ font-style:normal; background:linear-gradient(135deg,var(--oro),#FFE39A);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.lp-sub{ margin-top:14px; font-size:17px; line-height:1.6; color:var(--suave); max-width:520px; }
.lp-sub b{ color:var(--texto); font-weight:600; }

/* Botón principal */
.lp-jugar{ position:relative; display:flex; align-items:center; justify-content:center; gap:12px; width:100%;
  max-width:420px; margin-top:24px; padding:19px 24px; border-radius:20px; border:0; cursor:pointer;
  background:linear-gradient(135deg,var(--oro),var(--oro2)); color:#1a1300;
  font-family:'Inter',sans-serif; font-size:19px; font-weight:800; letter-spacing:.06em; text-transform:uppercase;
  box-shadow:0 6px 0 #B7791F, 0 18px 40px rgba(246,196,83,.35); transition:transform .12s, box-shadow .12s; }
.lp-jugar:active{ transform:translateY(4px); box-shadow:0 2px 0 #B7791F, 0 10px 24px rgba(246,196,83,.3); }
.lp-jugar::after{ content:''; position:absolute; inset:-6px; border-radius:24px; border:2px solid rgba(246,196,83,.5);
  animation:lp-aura 2s ease-out infinite; pointer-events:none; }
@keyframes lp-aura{ 0%{opacity:.9; transform:scale(.98)} 100%{opacity:0; transform:scale(1.08)} }
.lp-jugar-icono{ width:34px; height:34px; border-radius:50%; background:#1a1300; color:var(--oro); display:grid; place-items:center; }
.lp-garantias{ display:flex; flex-wrap:wrap; gap:6px 16px; margin-top:14px; font-size:13px; color:var(--suave); }
.lp-garantias span{ display:inline-flex; align-items:center; gap:6px; }
.lp-garantias span::before{ content:'✓'; color:var(--verde); font-weight:800; }

/* Teléfono con la vista previa del juego */
.lp-telefono{ position:relative; width:min(300px,78vw); aspect-ratio:340/620; margin:0 auto; border-radius:38px; padding:10px;
  background:linear-gradient(160deg,#1f2937,#0b1018); box-shadow:0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08), 0 0 60px rgba(34,197,94,.15); }
.lp-pantalla{ position:relative; width:100%; height:100%; border-radius:30px; overflow:hidden;
  background:linear-gradient(180deg,#a8dd7c,#7cc86a); }
.lp-pantalla > img{ width:100%; height:100%; object-fit:cover; display:block; }
.lp-hud{ position:absolute; top:12px; left:12px; right:12px; display:flex; gap:6px; align-items:flex-start; }
.lp-hud-nivel{ padding:6px 9px; border-radius:10px; background:rgba(6,20,12,.85); border:1px solid rgba(34,197,94,.6);
  color:#4ADE80; font-size:11px; font-weight:800; line-height:1.1; }
.lp-hud-nivel small{ display:block; color:rgba(134,239,172,.6); font-size:8px; font-weight:600; margin-top:2px; }
.lp-hud-xp{ height:3px; border-radius:2px; background:rgba(255,255,255,.12); margin-top:4px; overflow:hidden; }
.lp-hud-xp i{ display:block; height:100%; width:35%; background:#4ADE80; }
.lp-hud-chip{ padding:6px 9px; border-radius:10px; background:rgba(15,23,42,.8); color:#E2E8F0; font-size:10px; font-weight:700; }
.lp-pin{ position:absolute; transform:translate(-50%,-100%); display:grid; place-items:center; width:38px; height:38px;
  border-radius:50% 50% 50% 4px; rotate:-45deg; box-shadow:0 6px 14px rgba(0,0,0,.35); border:2px solid white; }
.lp-pin span{ rotate:45deg; font-size:17px; }
.lp-pin-salta{ animation:lp-salta 1.6s ease-in-out infinite; }
@keyframes lp-salta{ 0%,100%{ translate:0 0 } 50%{ translate:0 -7px } }
.lp-burbuja{ position:absolute; right:12px; bottom:96px; max-width:68%; padding:9px 11px; border-radius:14px 14px 4px 14px;
  background:rgba(2,6,23,.92); border:1px solid rgba(34,197,94,.5); color:#E2E8F0; font-size:11px; line-height:1.35; }
.lp-pato{ position:absolute; right:10px; bottom:12px; width:70px; height:78px; border-radius:16px; display:grid; place-items:center;
  background:linear-gradient(180deg,#0f2747,#0a1a33); border:2px solid #3B82F6; }
.lp-reto{ position:absolute; left:12px; bottom:14px; padding:8px 10px; border-radius:12px; background:rgba(124,58,237,.92);
  color:white; font-size:10px; font-weight:700; box-shadow:0 8px 18px rgba(0,0,0,.3); }
.lp-reto small{ display:block; font-weight:500; opacity:.85; }
.lp-flecha{ display:flex; justify-content:center; margin-top:8px; color:var(--suave); animation:lp-salta 2s infinite; }

/* Secciones */
.lp-seccion{ padding:48px 0; }
.lp-etiqueta{ color:var(--oro); font-size:12px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; }
.lp-h2{ font-family:'Cinzel',serif; font-size:clamp(26px,7vw,40px); line-height:1.12; margin-top:8px; color:white; }
.lp-pasos{ display:grid; gap:12px; margin-top:24px; }
.lp-paso{ display:flex; gap:14px; align-items:flex-start; padding:16px; border-radius:20px; background:var(--tarjeta); border:1px solid var(--borde); }
.lp-paso-num{ flex:none; width:44px; height:44px; border-radius:14px; display:grid; place-items:center; font-size:22px;
  background:rgba(246,196,83,.12); border:1px solid rgba(246,196,83,.25); }
.lp-paso h3{ font-size:16px; color:white; }
.lp-paso p{ font-size:14px; line-height:1.55; color:var(--suave); margin-top:3px; }
.lp-niveles{ display:flex; gap:10px; overflow-x:auto; margin:24px -20px 0; padding:4px 20px 8px; scroll-snap-type:x mandatory; scrollbar-width:none; }
.lp-niveles::-webkit-scrollbar{ display:none; }
.lp-nivel{ flex:none; width:132px; scroll-snap-align:start; text-align:center; padding:16px 10px; border-radius:18px;
  background:var(--tarjeta); border:1px solid var(--borde); }
.lp-nivel b{ font-size:30px; display:block; }
.lp-nivel h3{ font-size:14px; color:white; margin-top:6px; }
.lp-nivel small{ display:inline-block; margin-top:8px; padding:3px 9px; border-radius:999px; background:rgba(246,196,83,.12); color:var(--oro); font-size:11px; font-weight:700; }
.lp-final{ text-align:center; padding:36px 20px; border-radius:28px; margin:8px 0 24px;
  background:radial-gradient(100% 80% at 50% 0%, rgba(246,196,83,.18), transparent 70%), #0D131D; border:1px solid var(--borde); }
.lp-final .lp-jugar{ margin:22px auto 0; }
.lp-pie{ text-align:center; padding:24px 20px 120px; color:var(--suave); font-size:12px; }

/* Botón fijo abajo (teléfono), aparece al bajar */
.lp-fijo{ position:fixed; left:0; right:0; bottom:0; z-index:50; padding:12px 16px calc(12px + env(safe-area-inset-bottom));
  background:linear-gradient(180deg,transparent,rgba(7,11,17,.95) 35%); }
.lp-fijo .lp-jugar{ margin:0 auto; padding:16px 20px; font-size:17px; }
.lp-fijo .lp-jugar::after{ display:none; }

/* Explorar sin jugar */
.lp-explorar-titulo{ margin-top:26px; font-size:13px; color:var(--suave); font-weight:600; }
.lp-accesos{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; max-width:520px; }
.lp-acceso{ display:flex; align-items:center; gap:10px; padding:12px; border-radius:16px; color:white;
  background:var(--tarjeta); border:1px solid var(--borde); font-size:14px; font-weight:700; line-height:1.15; }
.lp-acceso small{ display:block; font-size:11px; font-weight:500; color:var(--suave); margin-top:2px; }
.lp-acceso-icono{ flex:none; width:36px; height:36px; border-radius:11px; display:grid; place-items:center; }
.lp-cabecera{ display:flex; align-items:flex-end; justify-content:space-between; gap:12px; }
.lp-ver{ flex:none; display:inline-flex; align-items:center; gap:2px; color:var(--oro); font-size:13px; font-weight:700; }
.lp-desc{ margin-top:8px; font-size:15px; line-height:1.55; color:var(--suave); }
.lp-carrusel{ display:flex; gap:12px; overflow-x:auto; margin:18px -20px 0; padding:4px 20px 10px;
  scroll-snap-type:x mandatory; scroll-padding:0 20px; scrollbar-width:none; }
.lp-carrusel::-webkit-scrollbar{ display:none; }
.lp-tarjeta{ flex:none; width:248px; scroll-snap-align:start; border-radius:20px; overflow:hidden;
  background:#0E1520; border:1px solid var(--borde); color:var(--texto); display:flex; flex-direction:column; }
.lp-tarjeta-foto{ flex:none; height:128px; overflow:hidden; background:linear-gradient(135deg,#1f2937,#111827); display:grid; place-items:center; font-size:38px; position:relative; }
.lp-tarjeta-foto img{ width:100%; height:100%; object-fit:cover; display:block; }
.lp-tarjeta-cuerpo{ padding:12px 14px 14px; display:flex; flex-direction:column; gap:4px; flex:1; }
.lp-chip{ align-self:flex-start; font-size:11px; font-weight:700; padding:3px 8px; border-radius:999px; background:rgba(255,255,255,.08); color:#CBD5E1; }
.lp-tarjeta h3{ font-size:16px; color:white; line-height:1.25; }
.lp-beneficio{ margin-top:4px; padding:8px 10px; border-radius:12px; background:rgba(246,196,83,.1); border:1px dashed rgba(246,196,83,.45);
  color:#FFE39A; font-size:13px; font-weight:600; line-height:1.35; }
.lp-precio{ color:#4ADE80; font-weight:800; font-size:15px; }
.lp-meta{ font-size:12px; color:var(--suave); }
.lp-whatsapp{ margin-top:auto; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px; border-radius:12px;
  background:#25D366; color:#062e16; font-weight:800; font-size:13px; }
.lp-cupon-banner{ display:flex; align-items:center; gap:12px; margin-top:16px; padding:14px; border-radius:18px; color:white;
  background:linear-gradient(135deg,rgba(246,196,83,.18),rgba(246,196,83,.05)); border:1px solid rgba(246,196,83,.35); }
.lp-cupon-banner b{ display:block; font-size:15px; }
.lp-cupon-banner span{ font-size:13px; color:var(--suave); }
.lp-boton-sec{ display:inline-flex; align-items:center; gap:6px; margin-top:14px; padding:11px 16px; border-radius:14px;
  border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.04); color:white; font-weight:700; font-size:14px; }
.lp-eventos{ display:grid; gap:10px; margin-top:18px; }
.lp-evento{ display:flex; gap:12px; padding:12px; border-radius:18px; background:var(--tarjeta); border:1px solid var(--borde); }
.lp-evento-fecha{ flex:none; width:56px; border-radius:14px; padding:8px 4px; text-align:center;
  background:linear-gradient(135deg,#db2777,#7c3aed); color:white; font-weight:800; font-size:12px; line-height:1.2; }
.lp-evento-fecha b{ display:block; font-size:20px; }
.lp-evento h3{ font-size:15px; color:white; }
.lp-evento p{ font-size:13px; color:var(--suave); margin-top:2px; line-height:1.45;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.lp-meta-pueblo{ display:block; padding:16px; border-radius:20px; color:white;
  background:linear-gradient(135deg,rgba(34,197,94,.14),rgba(34,197,94,.04)); border:1px solid rgba(34,197,94,.3); }
.lp-meta-numero{ font-size:30px; font-weight:900; color:#86EFAC; margin-top:6px; line-height:1; }
.lp-meta-numero span{ font-size:14px; font-weight:600; color:var(--suave); margin-left:4px; }
.lp-meta-barra{ height:8px; border-radius:6px; background:rgba(255,255,255,.08); overflow:hidden; margin:12px 0 8px; }
.lp-meta-barra i{ display:block; height:100%; border-radius:6px; background:linear-gradient(90deg,#22C55E,#86EFAC); }
.lp-vacio{ margin-top:16px; padding:18px; border-radius:18px; text-align:center; color:var(--suave); font-size:14px;
  background:var(--tarjeta); border:1px dashed var(--borde); }

@media (min-width:860px){
  .lp-hero{ grid-template-columns:1.1fr .9fr; padding:40px 0 64px; }
  .lp-accesos{ grid-template-columns:repeat(4,1fr); max-width:none; }
  .lp-eventos{ grid-template-columns:1fr 1fr; }
  .lp-pasos{ grid-template-columns:repeat(3,1fr); }
  .lp-niveles{ justify-content:center; overflow:visible; }
  .lp-fijo{ display:none; }
  .lp-pie{ padding-bottom:32px; }
}
@media (prefers-reduced-motion:reduce){
  .lp *{ animation:none !important; }
}
`;

const PASOS = [
  { icono: '📍', titulo: 'Camina por el pueblo', texto: 'El mapa te muestra dónde estás y qué hay cerca: el parque, la iglesia, las casas de balcones.' },
  { icono: '🔍', titulo: 'Descubre sus secretos', texto: 'Al acercarte a un lugar se desbloquean su historia y curiosidades que pocos conocen.' },
  { icono: '🏆', titulo: 'Responde retos y sube de nivel', texto: 'Cada lugar y cada reto te da XP e insignias. Tu pato compañero crece contigo.' },
];

const TIPO_ANUNCIO = {
  servicio: '🛠️ Servicio',
  venta: '🏷️ Venta',
  compra: '🛒 Compra',
};

const precioTexto = (precio) => (precio == null ? null : `$${Number(precio).toLocaleString('es-CO')}`);

// "SÁB 26" / "HOY" para la fecha de un evento del pueblo
const fechaEvento = (evento) => {
  const inicio = new Date(evento.fecha_inicio);
  const ahora = new Date();
  if (inicio <= ahora) return { arriba: 'AHORA', abajo: '●' };
  if (inicio.toDateString() === ahora.toDateString()) {
    // Hora corta de 24 h ("21:30") para que quepa en la cajita
    const hora = `${inicio.getHours()}:${String(inicio.getMinutes()).padStart(2, '0')}`;
    return { arriba: 'HOY', abajo: hora, corta: true };
  }
  return {
    arriba: inicio.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '').toUpperCase(),
    abajo: inicio.getDate(),
  };
};

// Datos del pueblo que no necesitan el mapa. Las mismas claves de caché que
// usa el mapa, así lo que se baja aquí ya queda listo si después juegan.
function useDatosDelPueblo() {
  const comercios = useQuery({
    queryKey: ['comercios'],
    queryFn: async () => {
      const r = await api.get('/comercios');
      return Array.isArray(r.data) ? r.data : [];
    },
    staleTime: 10 * 60 * 1000,
  });
  const anuncios = useQuery({
    queryKey: ['anuncios-recientes'],
    queryFn: async () => (await api.get('/anuncios')).data.anuncios || [],
    staleTime: 5 * 60 * 1000,
  });
  const eventos = useQuery({
    queryKey: ['eventos-comunidad'],
    queryFn: async () => (await api.get('/eventos-comunidad')).data.eventos || [],
    staleTime: 5 * 60 * 1000,
  });
  const meta = useQuery({
    queryKey: ['meta-semanal'],
    queryFn: async () => (await api.get('/eventos/meta-semanal')).data,
    staleTime: 2 * 60 * 1000,
  });
  return {
    comercios: comercios.data || [],
    anuncios: anuncios.data || [],
    eventos: eventos.data || [],
    meta: meta.data,
    cargandoComercios: comercios.isLoading,
    cargandoAnuncios: anuncios.isLoading,
  };
}

const NIVELES = [
  { icono: '🌱', titulo: 'Principiante', etiqueta: 'Nivel 1' },
  { icono: '⭐', titulo: 'Explorador', etiqueta: 'Nivel 5' },
  { icono: '⚡', titulo: 'Aventurero', etiqueta: 'Nivel 10' },
  { icono: '🛡️', titulo: 'Guardián', etiqueta: 'Nivel 20' },
  { icono: '👑', titulo: 'Leyenda', etiqueta: 'Máximo' },
];

// Botón grande "Jugar ahora". Conserva los parámetros del QR (si los trae).
function BotonJugar({ destino, texto = 'Jugar ahora' }) {
  return (
    <Link to={destino} className="lp-jugar">
      <span className="lp-jugar-icono"><Play size={16} fill="currentColor" /></span>
      {texto}
    </Link>
  );
}

// Vista previa del juego dentro de un teléfono
function PreviaJuego() {
  const [mapaOk, setMapaOk] = useState(Boolean(MAPA_PREVIA));
  return (
    <div className="lp-telefono" aria-hidden="true">
      <div className="lp-pantalla">
        {mapaOk && <img src={MAPA_PREVIA} alt="" loading="eager" onError={() => setMapaOk(false)} />}

        <div className="lp-hud">
          <div className="lp-hud-nivel">★ NV.1<small>35/100 XP</small><div className="lp-hud-xp"><i /></div></div>
          <div className="lp-hud-chip">📍 2/8 lugares</div>
        </div>

        <div className="lp-pin lp-pin-salta" style={{ left: '46%', top: '42%', background: '#F59E0B' }}><span>⛪</span></div>
        <div className="lp-pin" style={{ left: '70%', top: '30%', background: '#7C3AED' }}><span>❓</span></div>
        <div className="lp-pin" style={{ left: '26%', top: '60%', background: '#0EA5E9' }}><span>💡</span></div>
        <div className="lp-pin" style={{ left: '74%', top: '56%', background: '#22C55E' }}><span>🎉</span></div>

        <motion.div className="lp-burbuja"
          initial={{ opacity: 0, y: 8, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: .9, duration: .4 }}>
          ¡Hola, explorador! Vamos al parque, allá hay un secreto 🦆
        </motion.div>
        <div className="lp-reto">❓ Reto del día<small>+50 XP</small></div>
        <div className="lp-pato"><PatoBase width={52} height={62} ojos={ojosConfig.feliz} /></div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { search } = useLocation();
  const destino = `/${search}`;
  const heroRef = useRef(null);
  const finalRef = useRef(null);
  const [mostrarFijo, setMostrarFijo] = useState(false);
  const { comercios, anuncios, eventos, meta, cargandoComercios, cargandoAnuncios } = useDatosDelPueblo();

  // El botón fijo de abajo aparece cuando no se ve ni el botón de la portada
  // ni el del final
  useEffect(() => {
    const vistos = new Map();
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => vistos.set(e.target, e.isIntersecting));
      setMostrarFijo(![...vistos.values()].some(Boolean));
    }, { threshold: 0 });
    [heroRef.current, finalRef.current].forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const anterior = document.title;
    document.title = 'Concepción en el Mapa';
    return () => { document.title = anterior; };
  }, []);

  return (
    <div className="lp">
      <style>{CSS}</style>

      <header className="lp-top">
        <div className="lp-marca">
          <div className="lp-marca-icono"><MapPin size={18} /></div>
          <div><b>Concepción</b><small>en el mapa</small></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/mis-cupones" className="lp-top-jugar" aria-label="Mis cupones" style={{ padding: '8px 10px' }}><Gift size={16} /></Link>
          <Link to={destino} className="lp-top-jugar">Jugar</Link>
        </div>
      </header>

      <main className="lp-wrap">
        <section className="lp-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
            <span className="lp-ubicacion"><i />Estás en Concepción, Antioquia</span>
            <h1 className="lp-titulo">Este pueblo es <em>un juego.</em> Y empieza aquí.</h1>
            <p className="lp-sub">
              Camina sus calles empedradas, <b>descubre sus secretos</b>, responde retos y <b>gana cupones de descuento</b> en los comercios del pueblo.
            </p>
            <div ref={heroRef}><BotonJugar destino={destino} /></div>
            <div className="lp-garantias">
              <span>Gratis</span><span>Sin descargar nada</span><span>Sin registrarte</span>
            </div>

            {/* Para quien no viene a jugar */}
            <div className="lp-explorar-titulo">¿Solo de paso? Explora sin jugar:</div>
            <div className="lp-accesos">
              <a href="#comercios" className="lp-acceso">
                <span className="lp-acceso-icono" style={{ background: 'rgba(246,196,83,.15)', color: '#F6C453' }}><Store size={18} /></span>
                <span>Comercios<small>con descuentos</small></span>
              </a>
              <Link to="/anuncios" className="lp-acceso">
                <span className="lp-acceso-icono" style={{ background: 'rgba(34,197,94,.15)', color: '#4ADE80' }}><Megaphone size={18} /></span>
                <span>Anuncios<small>compra y vende</small></span>
              </Link>
              <a href="#eventos" className="lp-acceso">
                <span className="lp-acceso-icono" style={{ background: 'rgba(219,39,119,.15)', color: '#F472B6' }}><CalendarDays size={18} /></span>
                <span>Eventos<small>del pueblo</small></span>
              </a>
              <Link to="/mis-cupones" className="lp-acceso">
                <span className="lp-acceso-icono" style={{ background: 'rgba(14,165,233,.15)', color: '#38BDF8' }}><Gift size={18} /></span>
                <span>Mis cupones<small>y dónde usarlos</small></span>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .15 }}>
            <PreviaJuego />
            <a href="#comercios" className="lp-flecha" aria-label="Ver más"><ChevronDown size={22} /></a>
          </motion.div>
        </section>

        {/* ── Comercios aliados y sus descuentos ── */}
        <section id="comercios" className="lp-seccion">
          <div className="lp-cabecera">
            <div>
              <div className="lp-etiqueta"><Store size={13} style={{ verticalAlign: '-2px' }} /> Comercios aliados</div>
              <h2 className="lp-h2">Come, compra y ahorra</h2>
            </div>
          </div>
          <p className="lp-desc">Negocios de Concepción con beneficios para quienes recorren el pueblo.</p>
          {cargandoComercios ? (
            <div className="lp-vacio">Cargando comercios…</div>
          ) : comercios.length === 0 ? (
            <div className="lp-vacio">Muy pronto verás aquí los comercios aliados.</div>
          ) : (
            <div className="lp-carrusel">
              {comercios.map((c) => {
                const cat = categoriaComercio(c.categoria);
                return (
                  <Link key={c.id} to={`/comercio/${c.id}`} className="lp-tarjeta">
                    <div className="lp-tarjeta-foto">
                      {c.imagen_portada_url
                        ? <img src={imagenLigera(c.imagen_portada_url, 500)} alt={c.nombre} loading="lazy" />
                        : cat.emoji}
                    </div>
                    <div className="lp-tarjeta-cuerpo">
                      <span className="lp-chip">{cat.emoji} {cat.label}
                        {Number(c.total_resenas) > 0 && <> · <Star size={11} fill="#F6C453" color="#F6C453" style={{ verticalAlign: '-1px' }} /> {Number(c.calificacion_promedio).toFixed(1)}</>}
                      </span>
                      <h3>{c.nombre}</h3>
                      {c.beneficio && <div className="lp-beneficio">🎁 {c.beneficio}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <Link to="/mis-cupones" className="lp-cupon-banner">
            <span className="lp-acceso-icono" style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#F6C453,#FFB800)', color: '#1a1300' }}><Gift size={22} /></span>
            <span style={{ flex: 1 }}><b>Gana cupones jugando</b><span>Al llegar a nivel 3 y 5 recibes un código para usar en estos comercios.</span></span>
            <ChevronRight size={20} color="#F6C453" />
          </Link>
        </section>

        {/* ── Anuncios del pueblo ── */}
        <section id="anuncios" className="lp-seccion">
          <div className="lp-cabecera">
            <div>
              <div className="lp-etiqueta"><Megaphone size={13} style={{ verticalAlign: '-2px' }} /> Anuncios del pueblo</div>
              <h2 className="lp-h2">Se vende, se compra, se ofrece</h2>
            </div>
            <Link to="/anuncios" className="lp-ver">Ver todos <ChevronRight size={16} /></Link>
          </div>
          <p className="lp-desc">Servicios y ventas de la gente de Concepción. Escríbeles directo por WhatsApp.</p>
          {cargandoAnuncios ? (
            <div className="lp-vacio">Cargando anuncios…</div>
          ) : anuncios.length === 0 ? (
            <div className="lp-vacio">Todavía no hay anuncios. ¡Publica el primero!</div>
          ) : (
            <div className="lp-carrusel">
              {anuncios.slice(0, 8).map((a) => (
                <article key={a.id} className="lp-tarjeta">
                  <Link to="/anuncios" className="lp-tarjeta-foto">
                    {a.imagen_url
                      ? <img src={imagenLigera(a.imagen_url, 500)} alt={a.titulo} loading="lazy" />
                      : '📣'}
                  </Link>
                  <div className="lp-tarjeta-cuerpo">
                    <span className="lp-chip">{TIPO_ANUNCIO[a.tipo] || 'Anuncio'}</span>
                    <h3>{a.titulo}</h3>
                    {precioTexto(a.precio) && <div className="lp-precio">{precioTexto(a.precio)}</div>}
                    <div className="lp-meta">Publicado por {a.autor}</div>
                    {a.whatsapp && (
                      <a href={a.whatsapp} target="_blank" rel="noopener noreferrer" className="lp-whatsapp">
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          <Link to="/anuncios/nuevo" className="lp-boton-sec"><Plus size={16} /> Publicar un anuncio</Link>
        </section>

        {/* ── Eventos del pueblo ── */}
        <section id="eventos" className="lp-seccion">
          <div className="lp-etiqueta"><CalendarDays size={13} style={{ verticalAlign: '-2px' }} /> Eventos del pueblo</div>
          <h2 className="lp-h2">¿Qué pasa en Concepción?</h2>
          {eventos.length === 0 ? (
            <div className="lp-vacio">No hay eventos programados por ahora. ¡Vuelve pronto!</div>
          ) : (
            <div className="lp-eventos">
              {eventos.slice(0, 6).map((e) => {
                const f = fechaEvento(e);
                return (
                  <div key={e.id} className="lp-evento">
                    <div className="lp-evento-fecha">{f.arriba}<b style={f.corta ? { fontSize: 15, marginTop: 3 } : undefined}>{f.abajo}</b></div>
                    <div style={{ minWidth: 0 }}>
                      <h3>{e.titulo}</h3>
                      {(e.lugar_texto || e.comercio_nombre) && <div className="lp-meta">📍 {e.lugar_texto || e.comercio_nombre}</div>}
                      {e.descripcion && <p>{e.descripcion}</p>}
                      <BotonVoy evento={e} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Meta del pueblo: un objetivo de todos, no una competencia ── */}
        {meta && (
          <section className="lp-seccion" style={{ paddingBottom: 0 }}>
            <Link to={destino} className="lp-meta-pueblo">
              <div className="lp-cabecera">
                <div>
                  <div className="lp-etiqueta">🏘️ Meta del pueblo esta semana</div>
                  <div className="lp-meta-numero">{meta.completados}<span>/{meta.meta} retos</span></div>
                </div>
                <span className="lp-ver">Sumar el mío <ChevronRight size={16} /></span>
              </div>
              <div className="lp-meta-barra"><i style={{ width: `${Math.min(100, Math.round((meta.completados / meta.meta) * 100))}%` }} /></div>
              <div className="lp-meta">
                {meta.completados >= meta.meta
                  ? '¡Lo logramos entre todos! 🎉 Sigue sumando.'
                  : `${meta.participantes} ${meta.participantes === 1 ? 'explorador ya aportó' : 'exploradores ya aportaron'}. Entre todos completamos los retos del pueblo.`}
              </div>
            </Link>
          </section>
        )}

        <section id="como" className="lp-seccion">
          <div className="lp-etiqueta"><Footprints size={13} style={{ verticalAlign: '-2px' }} /> Cómo se juega</div>
          <h2 className="lp-h2">Tres pasos, cero complicaciones</h2>
          <div className="lp-pasos">
            {PASOS.map((p, i) => (
              <motion.div key={p.titulo} className="lp-paso"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: .4, delay: i * .08 }}>
                <div className="lp-paso-num">{p.icono}</div>
                <div><h3>{i + 1}. {p.titulo}</h3><p>{p.texto}</p></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="lp-seccion">
          <div className="lp-etiqueta"><Trophy size={13} style={{ verticalAlign: '-2px' }} /> Progresión</div>
          <h2 className="lp-h2">¿Hasta dónde llegarás?</h2>
          <div className="lp-niveles">
            {NIVELES.map((n) => (
              <div key={n.titulo} className="lp-nivel"><b>{n.icono}</b><h3>{n.titulo}</h3><small>{n.etiqueta}</small></div>
            ))}
          </div>
        </section>

        <section className="lp-final" ref={finalRef}>
          <PatoBase width={70} height={84} ojos={ojosConfig.celebrando} />
          <h2 className="lp-h2" style={{ marginTop: 10 }}>Tu aventura empieza en 5 segundos</h2>
          <p className="lp-sub" style={{ margin: '10px auto 0' }}>Toca el botón, permite tu ubicación y sigue al pato.</p>
          <BotonJugar destino={destino} texto="Empezar a jugar" />
        </section>
      </main>

      <footer className="lp-pie">Concepción en el Mapa · Antioquia, Colombia</footer>

      <AnimatePresence>
        {mostrarFijo && (
          <motion.div className="lp-fijo"
            initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', damping: 22, stiffness: 260 }}>
            <BotonJugar destino={destino} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
