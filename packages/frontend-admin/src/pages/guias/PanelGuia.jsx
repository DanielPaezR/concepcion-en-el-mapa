import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function PanelGuia() {
  const { user, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0 });

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await api.get(`/reservas?guia_id=${user?.id}`);
      const data = response.data || [];
      setReservas(data);
      
      const hoy = new Date().toISOString().split('T')[0];
      setStats({
        hoy: data.filter(r => r.fecha_encuentro?.startsWith(hoy)).length,
        pendientes: data.filter(r => r.estado === 'pendiente').length,
        completadas: data.filter(r => r.estado === 'completada').length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/reservas/${id}/estado`, { estado });
      cargarReservas();
    } catch (error) {
      console.error('Error:', error);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">👋 Hola, {user?.nombre}</h1>
            <p className="text-green-100 mt-1">Panel de Guía Turístico</p>
          </div>
          <button
            onClick={logout}
            className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4 p-4 -mt-6">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <CalendarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.hoy}</div>
          <div className="text-sm text-gray-500">Reservas hoy</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <ClockIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.pendientes}</div>
          <div className="text-sm text-gray-500">Pendientes</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <CheckCircleIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.completadas}</div>
          <div className="text-sm text-gray-500">Completadas</div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="px-4 pb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Mis Reservas</h2>
        
        {reservas.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No tienes reservas asignadas
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{reserva.lugar_nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {new Date(reserva.fecha_encuentro).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">👥 {reserva.numero_personas} personas</p>
                    {reserva.intereses && (
                      <p className="text-sm text-gray-500 mt-1">🎯 Intereses: {reserva.intereses}</p>
                    )}
                    {reserva.punto_encuentro && (
                      <p className="text-sm text-gray-500">📍 {reserva.punto_encuentro}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
                    {reserva.estado}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {reserva.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Confirmar
                    </button>
                  )}
                  {reserva.estado === 'confirmada' && (
                    <button
                      onClick={() => cambiarEstado(reserva.id, 'completada')}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Marcar completada
                    </button>
                  )}
                  {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                    <button
                      onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}