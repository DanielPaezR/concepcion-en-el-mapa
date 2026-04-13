// pages/lugares/LugaresList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function LugaresList() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarLugares();
  }, []);

  const cargarLugares = async () => {
    try {
      const response = await api.get('/lugares');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setLugares(response.data.data);
      } else if (Array.isArray(response.data)) {
        setLugares(response.data);
      } else {
        setLugares([]);
      }
    } catch (error) {
      console.error('Error al cargar lugares:', error);
      toast.error('Error al cargar los lugares');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) {
      try {
        await api.delete(`/lugares/${id}`);
        toast.success('Lugar eliminado');
        cargarLugares();
      } catch (error) {
        console.error('Error al eliminar:', error);
        toast.error('Error al eliminar');
      }
    }
  };

  const lugaresFiltrados = lugares.filter(lugar =>
    lugar.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    lugar.tipo.toLowerCase().includes(filtro.toLowerCase())
  );

  const getTipoColor = (tipo) => {
    const colores = {
      historico: 'bg-red-100 text-red-800',
      natural: 'bg-green-100 text-green-800',
      cultural: 'bg-blue-100 text-blue-800',
      gastronomico: 'bg-orange-100 text-orange-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-semibold text-gray-900">Lugares Turísticos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona los puntos de interés del municipio
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/lugares/nuevo"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nuevo Lugar
          </Link>
        </div>
      </div>

      {/* Filtro */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Buscar por nombre o tipo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        />
      </div>

      {/* Tabla */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dirección</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lugaresFiltrados.map((lugar) => (
                    <tr key={lugar.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {lugar.nombre}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getTipoColor(lugar.tipo)}`}>
                          {lugar.tipo}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lugar.direccion || '-'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          to={`/lugares/editar/${lugar.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </Link>
                        <button
                          onClick={() => handleEliminar(lugar.id, lugar.nombre)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
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

      {lugaresFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay lugares registrados</p>
        </div>
      )}
    </div>
  );
}