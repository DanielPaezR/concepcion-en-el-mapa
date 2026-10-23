// pages/MisAnuncios.jsx
// Anuncios del usuario: pendientes, publicados (se pueden marcar como
// completados para quitarlos del tablero), rechazados y completados.
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ListChecks, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import { TIPOS_ANUNCIO, formatearPrecio } from './Anuncios';

const ESTADOS = {
  pendiente: { label: '⏳ En revisión', clase: 'bg-amber-100 text-amber-700' },
  aprobado: { label: '✅ Publicado', clase: 'bg-green-100 text-green-700' },
  rechazado: { label: '❌ No aprobado', clase: 'bg-red-100 text-red-700' },
  completado: { label: '🏁 Completado', clase: 'bg-gray-100 text-gray-600' },
};

export default function MisAnuncios() {
  const navigate = useNavigate();
  const usuario = getTuristaActual();
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => api.get('/anuncios/mios')
    .then(({ data }) => setAnuncios(data.anuncios || []))
    .catch(() => toast.error('No se pudieron cargar tus anuncios'))
    .finally(() => setCargando(false));

  useEffect(() => { if (usuario && !usuario.anonimo) cargar(); }, []);

  if (!usuario || usuario.anonimo) return <Navigate to="/login-turista" replace />;

  const completar = async (a) => {
    if (!window.confirm(`¿Marcar "${a.titulo}" como completado? Dejará de aparecer en el tablero.`)) return;
    try {
      await api.patch(`/anuncios/${a.id}/completar`);
      toast.success('¡Listo! Tu anuncio salió del tablero');
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo completar');
    }
  };

  const eliminar = async (a) => {
    if (!window.confirm(`¿Eliminar "${a.titulo}"?`)) return;
    try {
      await api.delete(`/anuncios/${a.id}`);
      toast.success('Anuncio eliminado');
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
        <button onClick={() => navigate('/anuncios')} className="text-white mb-4">← Tablero de anuncios</button>
        <div className="flex items-center gap-3">
          <ListChecks className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Mis anuncios</h1>
            <p className="text-green-100 text-sm">Sigue el estado de tus solicitudes</p>
          </div>
        </div>
        <button onClick={() => navigate('/anuncios/nuevo')} className="mt-4 w-full flex items-center justify-center gap-1.5 bg-white text-green-700 font-semibold py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Nuevo anuncio
        </button>
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {cargando ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
        ) : anuncios.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            <ListChecks className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            Aún no has publicado anuncios.
          </div>
        ) : anuncios.map((a) => {
          const e = ESTADOS[a.estado];
          const t = TIPOS_ANUNCIO[a.tipo];
          return (
            <article key={a.id} className={`bg-white rounded-xl shadow-sm overflow-hidden flex ${a.estado === 'completado' ? 'opacity-70' : ''}`}>
              {a.imagen_url
                ? <img src={a.imagen_url} alt="" className="w-24 sm:w-32 object-cover shrink-0" />
                : <div className="w-24 sm:w-32 shrink-0 bg-green-50 flex items-center justify-center text-3xl">{t.emoji}</div>}
              <div className="p-3 flex-1 min-w-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.clase}`}>{e.label}</span>
                <h2 className="font-semibold text-gray-800 mt-1 truncate">{a.titulo}</h2>
                <p className="text-xs text-gray-500">{t.label}{formatearPrecio(a.precio) ? ` · ${formatearPrecio(a.precio)}` : ''}</p>
                {a.estado === 'pendiente' && <p className="text-xs text-gray-500 mt-1">Lo estamos revisando. Te avisaremos cuando se publique.</p>}
                {a.estado === 'rechazado' && a.motivo_rechazo && <p className="text-xs text-red-600 mt-1">Motivo: {a.motivo_rechazo}</p>}
                <div className="flex gap-2 mt-2">
                  {a.estado === 'aprobado' && (
                    <button onClick={() => completar(a)} className="flex items-center gap-1 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Marcar como completado
                    </button>
                  )}
                  <button onClick={() => eliminar(a)} className="flex items-center gap-1 text-xs text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50" aria-label="Eliminar">
                    <Trash2 className="w-4 h-4" />{a.estado !== 'aprobado' && ' Eliminar'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
