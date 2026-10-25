// pages/MisCupones.jsx
// Cupones de descuento del turista y los comercios donde usarlos. Los cupones
// se ganan jugando (al llegar a nivel 3 y a nivel 5).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gift, Copy, Check, Star, ChevronRight, Play } from 'lucide-react';
import api from '../services/api';
import { useVolver } from '../utils/navegacion';
import { imagenLigera } from '../utils/imagenes';
import { categoriaComercio } from '../data/comercios';

const fechaCorta = (f) => new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

export default function MisCupones() {
  const volver = useVolver('/landing');
  const [copiado, setCopiado] = useState('');

  const { data: codigos = [], isLoading: cargandoCodigos } = useQuery({
    queryKey: ['mis-codigos'],
    queryFn: async () => (await api.get('/descubrimientos/mis-codigos')).data.codigos || [],
  });
  const { data: perfil } = useQuery({
    queryKey: ['perfil-nivel'],
    queryFn: async () => (await api.get('/auth/perfil')).data,
  });
  const { data: comercios = [] } = useQuery({
    queryKey: ['comercios'],
    queryFn: async () => {
      const r = await api.get('/comercios');
      return Array.isArray(r.data) ? r.data : [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const vigentes = codigos.filter((c) => !c.usado);
  const usados = codigos.filter((c) => c.usado);
  const nivel = perfil?.nivel || 1;
  const proximoNivel = nivel < 3 ? 3 : nivel < 5 ? 5 : null;

  const copiar = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      setTimeout(() => setCopiado(''), 1800);
    } catch { /* sin portapapeles */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-16">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
        <button onClick={volver} className="text-white mb-4">← Volver</button>
        <div className="flex items-center gap-3">
          <Gift className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Mis cupones</h1>
            <p className="text-amber-50 text-sm">Descuentos en los comercios aliados de Concepción</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        {/* Cupones vigentes */}
        <section>
          {cargandoCodigos ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
          ) : vigentes.length > 0 ? (
            <div className="space-y-3">
              {vigentes.map((c) => (
                <button key={c.id} onClick={() => copiar(c.codigo)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-amber-400 text-left">
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wide">Cupón disponible</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-2xl font-extrabold tracking-wider text-gray-800">{c.codigo}</span>
                    {copiado === c.codigo ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Ganado el {fechaCorta(c.fecha_creacion)}{c.lugar_nombre ? ` en ${c.lugar_nombre}` : ''} · {copiado === c.codigo ? '¡Copiado!' : 'Toca para copiar'}
                  </div>
                </button>
              ))}
              <p className="text-sm text-gray-600 px-1">
                Muestra el código en cualquiera de los comercios de abajo: ellos lo validan y te dan su beneficio. Cada cupón se usa una vez.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <div className="text-4xl">🎁</div>
              <h2 className="font-bold text-gray-800 text-lg mt-2">
                {proximoNivel ? 'Aún no tienes cupones' : 'Ya usaste tus cupones'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {proximoNivel
                  ? `Descubre lugares y responde retos en el mapa. Al llegar a nivel ${proximoNivel} ganas un cupón (vas en nivel ${nivel}).`
                  : 'Ganaste los dos cupones del juego. ¡Gracias por explorar Concepción!'}
              </p>
              {proximoNivel && (
                <Link to="/" className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-bold px-5 py-2.5 rounded-xl">
                  <Play className="w-4 h-4" fill="currentColor" /> Jugar y ganar cupones
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Cómo funciona */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">¿Cómo funcionan?</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li><b className="text-gray-800">1.</b> Juega en el mapa: descubre lugares y responde retos para ganar XP.</li>
            <li><b className="text-gray-800">2.</b> Al llegar a <b>nivel 3</b> y a <b>nivel 5</b> recibes un cupón con un código <span className="font-mono">CEM-…</span>.</li>
            <li><b className="text-gray-800">3.</b> Muéstralo en un comercio aliado y recibe su beneficio. Después puedes dejarle una reseña.</li>
          </ol>
        </section>

        {/* Dónde usarlos */}
        <section>
          <h2 className="font-bold text-gray-800 mb-2 px-1">Dónde usarlos</h2>
          {comercios.length === 0 ? (
            <p className="text-sm text-gray-500 px-1">Pronto habrá comercios aliados.</p>
          ) : (
            <div className="space-y-3">
              {comercios.map((c) => {
                const cat = categoriaComercio(c.categoria);
                return (
                  <Link key={c.id} to={`/comercio/${c.id}`} className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm items-center">
                    <div className="w-16 h-16 rounded-xl bg-amber-100 overflow-hidden shrink-0 grid place-items-center text-2xl">
                      {c.imagen_portada_url
                        ? <img src={imagenLigera(c.imagen_portada_url, 160)} alt={c.nombre} className="w-full h-full object-cover" loading="lazy" />
                        : cat.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500">{cat.emoji} {cat.label}
                        {Number(c.total_resenas) > 0 && <span className="ml-2 inline-flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{Number(c.calificacion_promedio).toFixed(1)}</span>}
                      </div>
                      <div className="font-bold text-gray-800 truncate">{c.nombre}</div>
                      {c.beneficio && <div className="text-sm text-amber-700 font-medium line-clamp-2">🎁 {c.beneficio}</div>}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {usados.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-500 text-sm mb-2 px-1">Cupones usados</h2>
            <div className="space-y-2">
              {usados.map((c) => (
                <div key={c.id} className="bg-white/70 rounded-xl p-3 text-sm text-gray-500 flex justify-between">
                  <span className="font-mono line-through">{c.codigo}</span>
                  <span>{c.comercio_nombre ? `En ${c.comercio_nombre}` : 'Usado'}{c.fecha_uso ? ` · ${fechaCorta(c.fecha_uso)}` : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
