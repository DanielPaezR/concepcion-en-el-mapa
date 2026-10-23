// components/RetosVigentes.jsx
// Retos que los turistas ven hoy en el mapa. Se generan solos cada día a las
// 6:00 a. m. a partir del banco; el botón permite generarlos al instante
// (por ejemplo, después de agregar preguntas nuevas).
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function RetosVigentes({ recargar = 0 }) {
  const [retos, setRetos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get('/admin/eventos/activos');
      setRetos(data);
    } catch (error) {
      toast.error('No se pudieron cargar los retos vigentes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [recargar]);

  const generar = async () => {
    if (!window.confirm('Se reemplazarán los retos diarios vigentes por 3 nuevos al azar. ¿Continuar?')) return;
    setGenerando(true);
    try {
      const { data } = await api.post('/admin/eventos/generar');
      if (data.diarios === 0 && data.temporales === 0) {
        toast.error('No se generó ningún reto: agrega preguntas y ubicaciones activas al banco');
      } else {
        toast.success(`Retos generados: ${data.diarios} diarios${data.temporales ? ` y ${data.temporales} especiales` : ''}`);
      }
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudieron generar los retos');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-800">🎯 Retos vigentes en el mapa</h2>
          <p className="text-sm text-gray-500">Se generan solos cada día a las 6:00 a. m. (3 al azar del banco). Las preguntas se responden desde cualquier parte del pueblo; los puntos de encuentro exigen llegar al lugar.</p>
        </div>
        <button onClick={generar} disabled={generando}
          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
          {generando ? 'Generando...' : 'Generar retos ahora'}
        </button>
      </div>
      {cargando ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : retos.length === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">No hay retos vigentes: los turistas no ven ninguno en el mapa.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {retos.map((r) => (
            <li key={r.id} className="py-2 flex items-center gap-3 text-sm">
              <span className="text-lg">{r.es_temporal ? '🎪' : r.tipo === 'reunion' ? '📍' : '❓'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{r.pregunta}</p>
                <p className="text-xs text-gray-500">{r.ubicacion_nombre} · +{r.xp_recompensa} XP · vence {new Date(r.fecha_expiracion).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">{r.completados} completado{r.completados === 1 ? '' : 's'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
