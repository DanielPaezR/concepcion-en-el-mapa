// pages/guias/GuiasList.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function GuiasList() {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarGuias();
  }, []);

  const cargarGuias = async () => {
    try {
      const response = await api.get('/usuarios?rol=guia');
      setGuias(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar guías');
    } finally {
      setLoading(false);
    }
  };

  const cambiarDisponibilidad = async (id, disponible) => {
    try {
      await api.patch(`/usuarios/${id}/disponibilidad`, { disponible: !disponible });
      toast.success(`Guía ${!disponible ? 'activado' : 'desactivado'}`);
      cargarGuias();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar disponibilidad');
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Guías Turísticos</h1>
        <p className="mt-2 text-sm text-gray-700">Gestiona los guías y su disponibilidad</p>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Teléfono</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Calificación</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Disponible</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {guias.map((guia) => (
                    <tr key={guia.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {guia.nombre}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {guia.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {guia.telefono || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {guia.calificacion_promedio ? (
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            {parseFloat(guia.calificacion_promedio).toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin calificar</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${guia.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {guia.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => cambiarDisponibilidad(guia.id, guia.disponible)}
                          className={`${guia.disponible ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {guia.disponible ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {guias.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay guías registrados</p>
        </div>
      )}
    </div>
  );
}