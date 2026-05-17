// pages/encuestas/EncuestasList.jsx
import { useState, useEffect } from 'react';
import { StarIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EncuestasList() {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCalificacion, setFiltroCalificacion] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    cargarEncuestas();
  }, []);

  const cargarEncuestas = async () => {
    try {
      const response = await api.get('/encuestas');
      setEncuestas(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar encuestas');
    } finally {
      setLoading(false);
    }
  };

  const getCalificacionColor = (calificacion) => {
    if (calificacion >= 4) return 'text-green-600';
    if (calificacion >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const encuestasFiltradas = encuestas.filter(encuesta => {
    if (filtroCalificacion === 'todos') return true;
    if (filtroCalificacion === 'alta') return encuesta.calificacion_experiencia >= 4;
    if (filtroCalificacion === 'media') return encuesta.calificacion_experiencia === 3;
    if (filtroCalificacion === 'baja') return encuesta.calificacion_experiencia <= 2;
    return true;
  });

  const calcularPromedio = () => {
    if (encuestas.length === 0) return 0;
    const suma = encuestas.reduce((acc, e) => acc + (e.calificacion_experiencia || 0), 0);
    return (suma / encuestas.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Encuestas de Satisfacción</h1>
          <p className="mt-1 text-sm text-gray-500">Opiniones de los turistas sobre su experiencia</p>
        </div>
        <div className="bg-green-50 rounded-xl px-4 py-2 text-center">
          <div className="text-2xl font-bold text-green-600">{calcularPromedio()}</div>
          <div className="text-xs text-gray-500">Promedio general</div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1,2,3,4,5].map(star => (
              <StarIcon key={star} className={`w-3 h-3 ${star <= calcularPromedio() ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Filtros para móvil */}
      <div className="block lg:hidden">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-gray-200"
        >
          <span className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            Filtrar por calificación
          </span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
        </button>
        {mostrarFiltros && (
          <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 flex gap-2">
            {[
              { value: 'todos', label: 'Todos' },
              { value: 'alta', label: '⭐ Alta (4-5)' },
              { value: 'media', label: '⭐ Media (3)' },
              { value: 'baja', label: '⭐ Baja (1-2)' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFiltroCalificacion(option.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filtroCalificacion === option.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtros para desktop */}
      <div className="hidden lg:flex gap-2">
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'alta', label: '⭐ Alta (4-5 estrellas)' },
          { value: 'media', label: '⭐ Media (3 estrellas)' },
          { value: 'baja', label: '⭐ Baja (1-2 estrellas)' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setFiltroCalificacion(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filtroCalificacion === option.value
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Vista móvil - Cards */}
      <div className="block lg:hidden space-y-3">
        {encuestasFiltradas.map((encuesta) => (
          <div key={encuesta.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-gray-900">{encuesta.guia_nombre || 'Guía no especificado'}</div>
                <div className="text-xs text-gray-400">{new Date(encuesta.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getCalificacionColor(encuesta.calificacion_experiencia)}`}>
                  {encuesta.calificacion_experiencia}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(star => (
                    <StarIcon key={star} className={`w-3 h-3 ${star <= encuesta.calificacion_experiencia ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-400">Calificación guía</div>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-sm font-medium">{encuesta.calificacion_guia}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Origen</div>
                <div className="text-sm font-medium text-gray-700">{encuesta.origen_turista || 'No especificado'}</div>
              </div>
            </div>
            {encuesta.comentarios && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-1">Comentario</div>
                <p className="text-sm text-gray-600 italic">"{encuesta.comentarios}"</p>
              </div>
            )}
            {encuesta.sugerencias && (
              <div className="mt-2">
                <div className="text-xs text-gray-400 mb-1">Sugerencias</div>
                <p className="text-sm text-gray-600">💡 {encuesta.sugerencias}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guía</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calif. Guía</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calif. Experiencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentarios</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {encuestasFiltradas.map((encuesta) => (
              <tr key={encuesta.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {encuesta.guia_nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    {encuesta.calificacion_guia}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className={getCalificacionColor(encuesta.calificacion_experiencia)}>
                      {encuesta.calificacion_experiencia}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {encuesta.origen_turista || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {encuesta.comentarios || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(encuesta.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {encuestasFiltradas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {filtroCalificacion !== 'todos' 
              ? 'No hay encuestas con este filtro' 
              : 'No hay encuestas registradas'}
          </p>
        </div>
      )}

      {/* Estadísticas resumidas */}
      {encuestas.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">📊 Resumen</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{encuestas.length}</div>
              <div className="text-xs text-gray-500">Total encuestas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(encuestas.reduce((acc, e) => acc + (e.calificacion_experiencia || 0), 0) / encuestas.length).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Promedio experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(encuestas.reduce((acc, e) => acc + (e.calificacion_guia || 0), 0) / encuestas.length).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Promedio guía</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {encuestas.filter(e => e.calificacion_experiencia >= 4).length}
              </div>
              <div className="text-xs text-gray-500">Calificaciones altas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}