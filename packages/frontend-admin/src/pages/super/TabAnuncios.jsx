// Moderación de solicitudes de anuncios: aprobar o rechazar con motivo
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ESTADOS = [
  { v: 'pendiente', t: 'Pendientes' }, { v: 'aprobado', t: 'Publicados' },
  { v: 'rechazado', t: 'Rechazados' }, { v: 'completado', t: 'Completados' },
];
const TIPO = { servicio: '🛠️ Servicio', venta: '🏷️ Venta', compra: '🛒 Compra' };
const precio = (p) => (p == null ? null : `$${Number(p).toLocaleString('es-CO')}`);

export default function TabAnuncios({ onCambio }) {
  const [estado, setEstado] = useState('pendiente');
  const [anuncios, setAnuncios] = useState([]);
  const [conteo, setConteo] = useState({});
  const [cargando, setCargando] = useState(true);
  const [rechazando, setRechazando] = useState(null); // id
  const [motivo, setMotivo] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await api.get(`/anuncios/moderacion?estado=${estado}`);
      setAnuncios(data.anuncios);
      setConteo(data.conteo || {});
    } catch {
      toast.error('No se pudieron cargar los anuncios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [estado]);

  const aprobar = async (a) => {
    try {
      await api.patch(`/anuncios/${a.id}/aprobar`);
      toast.success('Anuncio publicado');
      cargar(); onCambio?.();
    } catch (e) {
      toast.error(e.response?.data?.error || 'No se pudo aprobar');
    }
  };

  const rechazar = async (a) => {
    try {
      await api.patch(`/anuncios/${a.id}/rechazar`, { motivo });
      toast.success('Anuncio rechazado');
      setRechazando(null); setMotivo('');
      cargar(); onCambio?.();
    } catch (e) {
      toast.error(e.response?.data?.error || 'No se pudo rechazar');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ESTADOS.map((e) => (
          <button key={e.v} onClick={() => setEstado(e.v)}
            className={`px-3 py-1.5 text-sm rounded-lg ${estado === e.v ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {e.t} <span className="opacity-70">({conteo[e.v] || 0})</span>
          </button>
        ))}
      </div>

      {cargando ? <p className="text-gray-400">Cargando...</p> : anuncios.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 py-10">
          {estado === 'pendiente' ? '🎉 No hay solicitudes pendientes.' : 'No hay anuncios en este estado.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {anuncios.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {a.imagen_url && <img src={a.imagen_url} alt="" className="w-full h-44 object-cover" />}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">{TIPO[a.tipo]}</span>
                  <span>{new Date(a.created_at).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-2">{a.titulo}</h3>
                {precio(a.precio) && <p className="text-green-700 font-bold">{precio(a.precio)}</p>}
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{a.descripcion}</p>
                <div className="text-xs text-gray-500 mt-3 border-t border-gray-50 pt-2">
                  <p>👤 {a.autor} · {a.autor_email}</p>
                  <p>📱 {a.autor_telefono || 'sin teléfono'} {a.whatsapp && <a href={a.whatsapp} target="_blank" rel="noreferrer" className="text-green-600 hover:underline ml-1">abrir WhatsApp</a>}</p>
                  {a.motivo_rechazo && <p className="text-red-600 mt-1">Motivo del rechazo: {a.motivo_rechazo}</p>}
                </div>

                {rechazando === a.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} maxLength={500}
                      placeholder="Motivo (lo verá la persona). Ej: falta una foto clara."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <button onClick={() => { setRechazando(null); setMotivo(''); }} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Cancelar</button>
                      <button onClick={() => rechazar(a)} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold">Rechazar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    {['pendiente', 'rechazado'].includes(a.estado) && (
                      <button onClick={() => aprobar(a)} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-semibold">Aprobar</button>
                    )}
                    {['pendiente', 'aprobado'].includes(a.estado) && (
                      <button onClick={() => setRechazando(a.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg py-2 text-sm font-semibold">
                        {a.estado === 'aprobado' ? 'Retirar' : 'Rechazar'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
