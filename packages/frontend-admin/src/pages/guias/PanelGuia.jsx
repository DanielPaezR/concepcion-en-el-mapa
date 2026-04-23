import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { 
  CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  PowerIcon, ArrowPathIcon, UserGroupIcon, StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config/runtime';

export default function PanelGuia() {
  const { user, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disponible, setDisponible] = useState(user?.disponible ?? true);
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0, canceladas: 0, calificacion: 0 });
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [socket, setSocket] = useState(null);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);

  const cargarReservas = useCallback(async () => {
    try {
      const response = await api.get('/reservas');
      const data = response.data || [];
      setReservas(data);
      
      const hoy = new Date().toISOString().split('T')[0];
      setStats({
        hoy: data.filter(r => r.fecha_encuentro?.startsWith(hoy) && r.estado !== 'cancelada').length,
        pendientes: data.filter(r => r.estado === 'pendiente').length,
        completadas: data.filter(r => r.estado === 'completada').length,
        canceladas: data.filter(r => r.estado === 'cancelada').length,
        calificacion: user?.calificacion_promedio || 0
      });
      
      // Filtrar reservas (excluir canceladas por defecto)
      const activas = data.filter(r => r.estado !== 'cancelada');
      setReservasFiltradas(activas);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.calificacion_promedio]);

  // Aplicar filtro cuando cambie
  useEffect(() => {
    if (filtroEstado === 'todas') {
      setReservasFiltradas(reservas.filter(r => r.estado !== 'cancelada'));
    } else {
      setReservasFiltradas(reservas.filter(r => r.estado === filtroEstado));
    }
  }, [filtroEstado, reservas]);

  useEffect(() => {
    if (user?.id) {
        cargarReservas();
        
        const socketIo = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
            timeout: 20000
        });
        setSocket(socketIo);
        
        socketIo.emit('guia-conectar', { guiaId: user.id, disponible });
        
        socketIo.on('nueva-solicitud', (data) => {
            console.log('📢 Nueva solicitud:', data);
            setSolicitudPendiente(data);
            toast.success(`📢 Nueva solicitud para ${data.lugar}`);
        });
        
        socketIo.on('reserva-confirmada', (data) => {
            toast.success('✅ Reserva confirmada');
            cargarReservas();
            setSolicitudPendiente(null);
        });
        
        socketIo.on('reserva-ya-asignada', (data) => {
            toast.error('❌ Esta reserva ya fue asignada a otro guía');
            setSolicitudPendiente(null);
        });
        
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
      {/* Header */}
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
              <span className="text-sm font-medium">{disponible ? 'Disponible' : 'No disponible'}</span>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                {disponible ? 'Recibirás nuevas reservas' : 'No recibirás reservas'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDisponibilidad}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              disponible ? 'bg-emerald-400' : 'bg-gray-400'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              disponible ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-5 gap-2 px-5 -mt-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center">
          <div className="bg-amber-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-gray-800">{stats.hoy}</div>
          <div className="text-xs text-gray-400">Hoy</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center">
          <div className="bg-sky-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1">
            <ClockIcon className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-lg font-bold text-gray-800">{stats.pendientes}</div>
          <div className="text-xs text-gray-400">Pendientes</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center">
          <div className="bg-emerald-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-gray-800">{stats.completadas}</div>
          <div className="text-xs text-gray-400">Completadas</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center">
          <div className="bg-rose-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1">
            <XCircleIcon className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-bold text-gray-800">{stats.canceladas}</div>
          <div className="text-xs text-gray-400">Canceladas</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center">
          <div className="bg-yellow-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1">
            <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
          </div>
          <div className="text-lg font-bold text-gray-800">{stats.calificacion?.toFixed(1) || 'Nuevo'}</div>
          <div className="text-xs text-gray-400">Calif.</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center px-5 mt-4">
        <div className="flex gap-2">
          {['todas', 'pendiente', 'confirmada', 'completada', 'cancelada'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filtroEstado === estado
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/70 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {estado === 'todas' ? 'Activas' : 
               estado === 'pendiente' ? 'Pendientes' :
               estado === 'confirmada' ? 'Confirmadas' :
               estado === 'completada' ? 'Completadas' : 'Canceladas'}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-gray-500 text-sm bg-white/70 px-3 py-1.5 rounded-full shadow-sm"
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Lista de reservas */}
      <div className="px-5 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">📋 Mis recorridos</h2>
          <span className="text-xs text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">
            {reservasFiltradas.length}
          </span>
        </div>
        
        {reservasFiltradas.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-10 text-center shadow-sm">
            <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay reservas</p>
            <p className="text-xs text-gray-400 mt-1">
              {filtroEstado === 'cancelada' ? 'No hay reservas canceladas' : 'Las reservas aparecerán aquí cuando te asignen'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservasFiltradas.map((reserva) => (
              <div key={reserva.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{reserva.lugar_nombre}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {new Date(reserva.fecha_encuentro).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <UserGroupIcon className="w-3.5 h-3.5" />
                      {reserva.numero_personas} personas
                    </p>
                    {reserva.intereses && (
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          🎯 {reserva.intereses}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoColor(reserva.estado)}`}>
                    {getEstadoIcono(reserva.estado)}
                    {reserva.estado}
                  </div>
                </div>
                
                {/* Botones solo para reservas NO canceladas y que pertenecen al guía */}
                {reserva.estado !== 'cancelada' && reserva.guia_id === user?.id && (
                  <div className="flex gap-2 mt-4">
                    {/* Solo mostrar botón CONFIRMAR si está pendiente Y es su reserva */}
                    {reserva.estado === 'pendiente' && reserva.guia_id === user?.id && (
                      <button
                        onClick={() => cambiarEstado(reserva.id, 'confirmada')}
                        className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 active:scale-95 transition shadow-sm"
                      >
                        Confirmar
                      </button>
                    )}
                    
                    {/* Mostrar botones COMPLETAR y CANCELAR solo si está confirmada Y es su reserva */}
                    {reserva.estado === 'confirmada' && reserva.guia_id === user?.id && (
                      <>
                        <button
                          onClick={() => cambiarEstado(reserva.id, 'completada')}
                          className="flex-1 bg-sky-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-sky-600 active:scale-95 transition shadow-sm"
                        >
                          Completar
                        </button>
                        <button
                          onClick={() => cambiarEstado(reserva.id, 'cancelada')}
                          className="flex-1 bg-rose-400 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-500 active:scale-95 transition shadow-sm"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}