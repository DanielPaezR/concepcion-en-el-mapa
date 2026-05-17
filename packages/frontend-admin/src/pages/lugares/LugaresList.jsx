// pages/lugares/LugaresList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function LugaresList() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

  const tipos = ['todos', 'historico', 'natural', 'cultural', 'gastronomico'];
  
  const lugaresFiltrados = lugares.filter(lugar => {
    const matchesNombre = lugar.nombre.toLowerCase().includes(filtro.toLowerCase());
    const matchesTipo = filtroTipo === 'todos' || lugar.tipo === filtroTipo;
    return matchesNombre && matchesTipo;
  });

  const getTipoColor = (tipo) => {
    const colores = {
      historico: 'bg-red-100 text-red-800',
      natural: 'bg-green-100 text-green-800',
      cultural: 'bg-blue-100 text-blue-800',
      gastronomico: 'bg-orange-100 text-orange-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoIcono = (tipo) => {
    const iconos = {
      historico: '🏛️',
      natural: '🌲',
      cultural: '🎭',
      gastronomico: '🍽️'
    };
    return iconos[tipo] || '📍';
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
          <h1 className="text-2xl font-semibold text-gray-900">Lugares Turísticos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los puntos de interés del municipio</p>
        </div>
        <Link
          to="/admin/lugares/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Lugar
        </Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {/* Filtro de tipo para móvil */}
        <div className="block lg:hidden">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-gray-200"
          >
            <span className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              Filtrar por tipo
            </span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
          </button>
          {mostrarFiltros && (
            <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 flex gap-2 flex-wrap">
              {tipos.map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filtroTipo === tipo
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tipo === 'todos' ? 'Todos' : tipo}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de tipo para desktop */}
        <div className="hidden lg:flex gap-2">
          {tipos.map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filtroTipo === tipo
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tipo === 'todos' ? 'Todos' : tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Vista móvil - Cards */}
      <div className="block lg:hidden space-y-3">
        {lugaresFiltrados.map((lugar) => (
          <div key={lugar.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{lugar.nombre}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getTipoColor(lugar.tipo)}`}>
                    <span>{getTipoIcono(lugar.tipo)}</span>
                    {lugar.tipo}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Link
                  to={`/admin/lugares/editar/${lugar.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleEliminar(lugar.id, lugar.nombre)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {lugar.direccion && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span>📍</span>
                <span className="text-sm">{lugar.direccion}</span>
              </div>
            )}
            {lugar.descripcion && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600 line-clamp-2">{lugar.descripcion}</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {lugaresFiltrados.map((lugar) => (
              <tr key={lugar.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lugar.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTipoColor(lugar.tipo)}`}>
                    {lugar.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lugar.direccion || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/lugares/editar/${lugar.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-3"
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

      {lugaresFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {filtro || filtroTipo !== 'todos'
              ? 'No hay lugares con estos filtros'
              : 'No hay lugares registrados'}
          </p>
        </div>
      )}
    </div>
  );
}