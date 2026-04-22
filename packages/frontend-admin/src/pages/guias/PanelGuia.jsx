import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { 
  CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  PowerIcon, ArrowPathIcon, UserGroupIcon, StarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    reconnection: true
});

export default function PanelGuia() {
  const { user, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disponible, setDisponible] = useState(user?.disponible ?? true);
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0, calificacion: 0 });
  const [socket, setSocket] = useState(null);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);

  const cargarReservas = useCallback(async () => {
    try {
      const response = await api.get('/reservas'); // Sin filtro, el backend filtra por rol
      const data = response.data || [];
      setReservas(data);
      
      const hoy = new Date().toISOString().split('T')[0];
      setStats({
        hoy: data.filter(r => r.fecha_encuentro?.startsWith(hoy)).length,
        pendientes: data.filter(r => r.estado === 'pendiente').length,
        completadas: data.filter(r => r.estado === 'completada').length,
        calificacion: user?.calificacion_promedio || 0
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.calificacion_promedio]);

  useEffect(() => {
    if (user?.id) {
        cargarReservas();
        
        // Conectar Socket.IO
        const socketIo = io('http://localhost:5000');
        setSocket(socketIo);
        
        // Conectar como guía
        socketIo.emit('guia-conectar', { guiaId: user.id, disponible });
        
        // Escuchar nuevas solicitudes
        socketIo.on('nueva-solicitud', (data) => {
            console.log('📢 Nueva solicitud:', data);
            setSolicitudPendiente(data);
            toast.success(`📢 Nueva solicitud para ${data.lugar}`);
        });
        
        // Escuchar reserva confirmada
        socketIo.on('reserva-confirmada', (data) => {
            toast.success('✅ Reserva confirmada');
            cargarReservas();
            setSolicitudPendiente(null);
        });
        
        // Escuchar reserva ya asignada a otro
        socketIo.on('reserva-ya-asignada', (data) => {
            toast.error('❌ Esta reserva ya fue asignada a otro guía');
            setSolicitudPendiente(null);
        });
        
        // Limpiar al desmontar
        return () => {
            socketIo.disconnect();
        };
    }
}, [user?.id, disponible]);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/reservas/${id}/estado`, { estado });
      toast.success(`Reserva ${estado === 'confirmada' ? 'confirmada' : estado === 'completada' ? 'completada' : 'cancelada'}`);
      cargarReservas();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const toggleDisponibilidad = async () => {
    try {
      const nuevoEstado = !disponible;
      await api.patch(`/usuarios/${user?.id}/disponibilidad`, { disponible: nuevoEstado });
      setDisponible(nuevoEstado);
      toast.success(nuevoEstado ? '✅ Estás disponible para nuevas reservas' : '⛔ No recibirás más reservas por ahora');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar disponibilidad');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarReservas();
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-amber-50 text-amber-600 border-amber-200',
      confirmada: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      completada: 'bg-sky-50 text-sky-600 border-sky-200',
      cancelada: 'bg-rose-50 text-rose-600 border-rose-200'
    };
    return colores[estado] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'pendiente': return <ClockIcon className="w-3.5 h-3.5" />;
      case 'confirmada': return <CheckCircleIcon className="w-3.5 h-3.5" />;
      case 'completada': return <CalendarIcon className="w-3.5 h-3.5" />;
      case 'cancelada': return <XCircleIcon className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50 pb-24">
      {/* Header con gradiente pastel */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-10 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hola, {user?.nombre?.split(' ')[0] || 'Guía'} 👋</h1>
            <p className="text-emerald-100 text-sm mt-0.5 opacity-90">Aquí están tus recorridos</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition"
          >
            Salir
          </button>
        </div>

        {/* Switch de disponibilidad */}
        <div className="flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-2xl p-3 mt-6">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${disponible ? 'bg-emerald-400/30' : 'bg-gray-400/30'}`}>
              <PowerIcon className={`w-5 h-5 ${disponible ? 'text-emerald-200' : 'text-gray-300'}`} />
            </div>
            <div>
              <span className="text-sm font-medium">
                {disponible ? 'Disponible' : 'No disponible'}
              </span>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                {disponible ? 'Recibirás nuevas reservas' : 'No recibirás reservas'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDisponibilidad}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              disponible ? 'bg-emerald-400' : 'bg-gray-400'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                disponible ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas - estilo pastel */}
      <div className="grid grid-cols-4 gap-3 px-5 -mt-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-white/50 text-center">
          <div className="bg-amber-100 w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CalendarIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-gray-800">{stats.hoy}</div>
          <div className="text-xs text-gray-400">Hoy</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-white/50 text-center">
          <div className="bg-sky-100 w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ClockIcon className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-gray-800">{stats.pendientes}</div>
          <div className="text-xs text-gray-400">Pendientes</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-white/50 text-center">
          <div className="bg-emerald-100 w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-gray-800">{stats.completadas}</div>
          <div className="text-xs text-gray-400">Completadas</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-white/50 text-center">
          <div className="bg-yellow-100 w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2">
            <StarIcon className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-xl font-bold text-gray-800">{stats.calificacion?.toFixed(1) || 'Nuevo'}</div>
          <div className="text-xs text-gray-400">Calificación</div>
        </div>
      </div>

      {/* Botón de refrescar */}
      <div className="flex justify-end px-5 mt-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-gray-500 text-sm bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Lista de reservas */}
      <div className="px-5 mt-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">📋 Mis recorridos</h2>
          <span className="text-xs text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">{reservas.length}</span>
        </div>
        
        {reservas.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-10 text-center shadow-sm border border-white/40">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No tienes reservas</p>
            <p className="text-xs text-gray-400 mt-1">Las reservas aparecerán aquí cuando te asignen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{reserva.lugar_nombre}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(reserva.fecha_encuentro).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <UserGroupIcon className="w-3.5 h-3.5" />
                      {reserva.numero_personas} {reserva.numero_personas === 1 ? 'persona' : 'personas'}
                    </p>
                    {reserva.intereses && (
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          🎯 {reserva.intereses}
                        </span>
                      </div>
                    )}
                    {reserva.punto_encuentro && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        📍 {reserva.punto_encuentro}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoColor(reserva.estado)}`}>
                    {getEstadoIcono(reserva.estado)}
                    {reserva.estado}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {reserva.estado === 'pendiente' && reserva.guia_id === user?.id && (
                    <button
                      onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                      className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 active:scale-95 transition shadow-sm"
                    >
                      Confirmar
                    </button>
                  )}
                  {reserva.estado === 'confirmada' && reserva.guia_id === user?.id && (
                    <button
                      onClick={() => cambiarEstado(reserva.id, 'completada')}
                      className="flex-1 bg-sky-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-sky-600 active:scale-95 transition shadow-sm"
                    >
                      Completar
                    </button>
                  )}
                  {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && reserva.guia_id === user?.id && (
                    <button
                      onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                      className="flex-1 bg-rose-400 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-500 active:scale-95 transition shadow-sm"
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