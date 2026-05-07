// pages/Reservas.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await api.get('/reservas');
      setReservas(response.data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarReservas = () => {
    return reservas.filter(reserva => {
      // Filtro por estado
      if (filtroEstado !== 'todas' && reserva.estado !== filtroEstado) {
        return false;
      }
      
      // Búsqueda por texto
      if (busqueda) {
        const texto = busqueda.toLowerCase();
        return (
          reserva.turista_nombre?.toLowerCase().includes(texto) ||
          reserva.lugar_nombre?.toLowerCase().includes(texto) ||
          reserva.guia_nombre?.toLowerCase().includes(texto)
        );
      }
      
      return true;
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-green-100 text-green-800',
      'completada': 'bg-blue-100 text-blue-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'confirmada': return <CheckCircle className="w-4 h-4" />;
      case 'completada': return <UserCheck className="w-4 h-4" />;
      case 'cancelada': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleCambiarEstado = async (reservaId, nuevoEstado) => {
    try {
      await api.patch(`/reservas/${reservaId}/estado`, { estado: nuevoEstado });
      await cargarReservas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const reservasFiltradas = filtrarReservas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h1>
        <div className="text-sm text-gray-600">
          Total: {reservasFiltradas.length} reservas
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por turista, lugar o guía..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="todas">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {reservasFiltradas.map((reserva) => (
          <div key={reserva.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Información principal */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(reserva.estado)}`}>
                    {getEstadoIcono(reserva.estado)}
                    {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    #{reserva.id}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {reserva.lugar_nombre}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Turista: {reserva.turista_nombre}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      Encuentro: {new Date(reserva.fecha_encuentro).toLocaleString()}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4" />
                      Personas: {reserva.numero_personas}
                    </p>
                  </div>
                  <div>
                    {reserva.guia_nombre ? (
                      <p className="text-gray-600 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Guía asignado: {reserva.guia_nombre}
                      </p>
                    ) : (
                      <p className="text-yellow-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pendiente de asignación
                      </p>
                    )}
                    {reserva.intereses && (
                      <p className="text-gray-600 mt-1">
                        Intereses: {reserva.intereses}
                      </p>
                    )}
                    {reserva.punto_encuentro && (
                      <p className="text-gray-600 mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {reserva.punto_encuentro}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 min-w-[200px]">
                {user?.rol === 'guia' && reserva.estado === 'pendiente' && (
                  <button
                    onClick={() => handleCambiarEstado(reserva.id, 'confirmada')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium
                             hover:bg-green-700 transition-colors"
                  >
                    Aceptar Reserva
                  </button>
                )}
                
                {reserva.estado === 'confirmada' && (
                  <button
                    onClick={() => handleCambiarEstado(reserva.id, 'completada')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium
                             hover:bg-blue-700 transition-colors"
                  >
                    Marcar Completada
                  </button>
                )}

                {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                  <button
                    onClick={() => handleCambiarEstado(reserva.id, 'cancelada')}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium
                             hover:bg-red-700 transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {reservasFiltradas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay reservas que coincidan con los filtros</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Reservas;