// pages/reservas/ReservasList.jsx
import { useState, useEffect } from 'react';
import { CalendarIcon, UserGroupIcon, MapPinIcon, ClockIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ReservasList() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmada: 'bg-green-100 text-green-800 border-green-200',
      completada: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'pendiente': return '⏳';
      case 'confirmada': return '✅';
      case 'completada': return '🎉';
      case 'cancelada': return '❌';
      default: return '📋';
    }
  };

  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroEstado === 'todas') return true;
    return reserva.estado === filtroEstado;
  });

  const estadisticas = {
    total: reservas.length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    completadas: reservas.filter(r => r.estado === 'completada').length,
    canceladas: reservas.filter(r => r.estado === 'cancelada').length
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reservas de Guías</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona las solicitudes de guías turísticos</p>
      </div>

      {/* Tarjetas de estadísticas (móvil) */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-800">{estadisticas.total}</div>
          <div className="text-xs text-gray-500">Total reservas</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 shadow-sm text-center">
          <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
          <div className="text-xs text-yellow-600">Pendientes</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{estadisticas.confirmadas}</div>
          <div className="text-xs text-green-600">Confirmadas</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{estadisticas.completadas}</div>
          <div className="text-xs text-blue-600">Completadas</div>
        </div>
      </div>

      {/* Tarjetas de estadísticas (desktop) */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-800">{estadisticas.total}</div>
          <div className="text-sm text-gray-500">Total reservas</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
          <div className="text-sm text-yellow-600">Pendientes</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{estadisticas.confirmadas}</div>
          <div className="text-sm text-green-600">Confirmadas</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{estadisticas.completadas}</div>
          <div className="text-sm text-blue-600">Completadas</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-red-600">{estadisticas.canceladas}</div>
          <div className="text-sm text-red-600">Canceladas</div>
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
            Filtrar por estado
          </span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
        </button>
        {mostrarFiltros && (
          <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200 flex gap-2 flex-wrap">
            {[
              { value: 'todas', label: 'Todas' },
              { value: 'pendiente', label: '⏳ Pendientes' },
              { value: 'confirmada', label: '✅ Confirmadas' },
              { value: 'completada', label: '🎉 Completadas' },
              { value: 'cancelada', label: '❌ Canceladas' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFiltroEstado(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filtroEstado === option.value
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
          { value: 'todas', label: 'Todas' },
          { value: 'pendiente', label: '⏳ Pendientes' },
          { value: 'confirmada', label: '✅ Confirmadas' },
          { value: 'completada', label: '🎉 Completadas' },
          { value: 'cancelada', label: '❌ Canceladas' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setFiltroEstado(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filtroEstado === option.value
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
        {reservasFiltradas.map((reserva) => (
          <div key={reserva.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-gray-900">{reserva.lugar_nombre}</div>
                <div className="text-xs text-gray-400 mt-0.5">ID: #{reserva.id}</div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${getEstadoColor(reserva.estado)}`}>
                <span>{getEstadoIcono(reserva.estado)}</span>
                {reserva.estado}
              </span>
            </div>
            
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{reserva.turista_nombre || 'Anónimo'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{new Date(reserva.fecha_encuentro).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{reserva.numero_personas} personas</span>
              </div>
              {reserva.intereses && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    🎯 {reserva.intereses}
                  </span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              {reserva.estado === 'pendiente' && (
                <button
                  onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                >
                  ✅ Confirmar
                </button>
              )}
              {reserva.estado === 'confirmada' && (
                <>
                  <button
                    onClick={() => cambiarEstado(reserva.id, 'completada')}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                  >
                    🎉 Completar
                  </button>
                  <button
                    onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                    className="flex-1 bg-red-400 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-500 transition"
                  >
                    ❌ Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turista</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reservasFiltradas.map((reserva) => (
              <tr key={reserva.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{reserva.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reserva.lugar_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.turista_nombre || 'Anónimo'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(reserva.fecha_encuentro).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reserva.numero_personas}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getEstadoColor(reserva.estado)}`}>
                    {reserva.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {reserva.estado === 'pendiente' && (
                    <button onClick={() => cambiarEstado(reserva.id, 'confirmada')} className="text-green-600 hover:text-green-900 mr-3">Confirmar</button>
                  )}
                  {reserva.estado === 'confirmada' && (
                    <>
                      <button onClick={() => cambiarEstado(reserva.id, 'completada')} className="text-blue-600 hover:text-blue-900 mr-3">Completar</button>
                      <button onClick={() => cambiarEstado(reserva.id, 'cancelada')} className="text-red-600 hover:text-red-900">Cancelar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reservasFiltradas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {filtroEstado !== 'todas' 
              ? 'No hay reservas con este filtro' 
              : 'No hay reservas registradas'}
          </p>
        </div>
      )}
    </div>
  );
}