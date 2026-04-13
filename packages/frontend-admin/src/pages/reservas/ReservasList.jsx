// pages/reservas/ReservasList.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ReservasList() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await api.get('/reservas');
      setReservas(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/reservas/${id}/estado`, { estado });
      toast.success(`Reserva ${estado}`);
      cargarReservas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      completada: 'bg-blue-100 text-blue-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-semibold text-gray-900">Reservas de Guías</h1>
        <p className="mt-2 text-sm text-gray-700">Gestiona las solicitudes de guías turísticos</p>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Lugar</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Turista</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Personas</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        #{reserva.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reserva.lugar_nombre}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reserva.turista_nombre || 'Anónimo'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(reserva.fecha_encuentro).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reserva.numero_personas}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getEstadoColor(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {reserva.estado === 'pendiente' && (
                          <button
                            onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Confirmar
                          </button>
                        )}
                        {reserva.estado === 'confirmada' && (
                          <button
                            onClick={() => cambiarEstado(reserva.id, 'completada')}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Completar
                          </button>
                        )}
                        {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                          <button
                            onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {reservas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay reservas registradas</p>
        </div>
      )}
    </div>
  );
}