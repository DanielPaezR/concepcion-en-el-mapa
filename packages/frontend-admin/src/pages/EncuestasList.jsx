import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EncuestasList() {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Encuestas de Satisfacción</h1>
          <p className="mt-2 text-sm text-gray-700">Opiniones de los turistas sobre su experiencia</p>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Guía</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Calificación Guía</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Calificación Experiencia</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Origen</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {encuestas.map((encuesta) => (
                    <tr key={encuesta.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{encuesta.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{encuesta.guia_nombre || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {encuesta.calificacion_guia}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {encuesta.calificacion_experiencia}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{encuesta.origen_turista || '-'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(encuesta.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {encuestas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay encuestas registradas</p>
        </div>
      )}
    </div>
  );
}