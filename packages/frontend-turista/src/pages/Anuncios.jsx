// pages/Anuncios.jsx
// Tablero de anuncios del pueblo: servicios, ventas y compras aprobados por
// el administrador. El contacto es directo por WhatsApp con quien publica.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Search, Plus, MessageCircle, ListChecks } from 'lucide-react';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import { useVolver } from '../utils/navegacion';

export const TIPOS_ANUNCIO = {
  servicio: { label: 'Servicio', emoji: '🛠️', clase: 'bg-blue-100 text-blue-700' },
  venta: { label: 'Venta', emoji: '🏷️', clase: 'bg-green-100 text-green-700' },
  compra: { label: 'Compra', emoji: '🛒', clase: 'bg-amber-100 text-amber-700' },
};

export const formatearPrecio = (precio) => (precio == null ? null : `$${Number(precio).toLocaleString('es-CO')}`);

const hace = (fecha) => {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 864e5);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

export default function Anuncios() {
  const navigate = useNavigate();
  const volver = useVolver('/landing');
  const usuario = getTuristaActual();
  const registrado = usuario && !usuario.anonimo;
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tipo, setTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [consulta, setConsulta] = useState('');

  // La búsqueda se aplica al dejar de escribir
  useEffect(() => {
    const t = setTimeout(() => setConsulta(busqueda.trim()), 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (consulta) params.set('q', consulta);
    api.get(`/anuncios?${params}`)
      .then(({ data }) => setAnuncios(data.anuncios || []))
      .catch(() => setAnuncios([]))
      .finally(() => setCargando(false));
  }, [tipo, consulta]);

  // Sin cuenta: inicia sesión y vuelve directo a publicar
  const publicar = () => navigate(registrado ? '/anuncios/nuevo' : '/login-turista?volver=/anuncios/nuevo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
        <button onClick={volver} className="text-white mb-4">← Volver</button>
        <div className="flex items-center gap-3">
          <Megaphone className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Anuncios</h1>
            <p className="text-green-100 text-sm">Servicios, ventas y compras de la gente de Concepción</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={publicar} className="flex-1 flex items-center justify-center gap-1.5 bg-white text-green-700 font-semibold py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Publicar anuncio
          </button>
          {registrado && (
            <button onClick={() => navigate('/mis-anuncios')} className="flex items-center justify-center gap-1.5 bg-white/15 border border-white/30 font-semibold px-4 py-2 rounded-lg">
              <ListChecks className="w-4 h-4" /> Mis anuncios
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar (ej. bicicleta, clases, café)"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[['', 'Todos'], ...Object.entries(TIPOS_ANUNCIO).map(([k, v]) => [k, `${v.emoji} ${v.label}s`])].map(([k, t]) => (
            <button key={k || 'todos'} onClick={() => setTipo(k)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium ${tipo === k ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
        ) : anuncios.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            {consulta || tipo ? 'No hay anuncios que coincidan.' : 'Todavía no hay anuncios. ¡Sé el primero en publicar!'}
          </div>
        ) : (
          anuncios.map((a) => {
            const t = TIPOS_ANUNCIO[a.tipo];
            const esMio = usuario?.id === a.usuario_id;
            return (
              <article key={a.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {a.imagen_url && <img src={a.imagen_url} alt={a.titulo} className="w-full h-52 object-cover" loading="lazy" />}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${t.clase}`}>{t.emoji} {t.label}</span>
                    <span className="text-gray-400">{a.autor} · {hace(a.fecha_revision || a.created_at)}</span>
                  </div>
                  <h2 className="font-bold text-gray-800 text-lg mt-2">{a.titulo}</h2>
                  {formatearPrecio(a.precio) && <p className="text-green-700 font-bold text-lg">{formatearPrecio(a.precio)}</p>}
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{a.descripcion}</p>
                  {esMio ? (
                    <p className="mt-3 text-center text-sm text-gray-400">Este es tu anuncio</p>
                  ) : a.whatsapp ? (
                    <a href={a.whatsapp} target="_blank" rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold py-2.5 rounded-lg">
                      <MessageCircle className="w-5 h-5" /> Escribir por WhatsApp
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
