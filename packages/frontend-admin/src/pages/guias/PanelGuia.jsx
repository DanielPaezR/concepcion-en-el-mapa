// pages/guia/PanelGuia.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { 
  CalendarIcon, CheckCircleIcon, ClockIcon, XCircleIcon,
  PowerIcon, ArrowPathIcon, UserGroupIcon, StarIcon,
  FunnelIcon, WifiIcon, PlusIcon, TrashIcon,
  PencilIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config/runtime';
import { subscribeUser, unsubscribeUser } from '../../services/pushNotifications';

export default function PanelGuia() {
  const { user, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disponible, setDisponible] = useState(false);
  const [stats, setStats] = useState({ hoy: 0, pendientes: 0, completadas: 0, canceladas: 0, calificacion: 0 });
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [socket, setSocket] = useState(null);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [intentandoConexion, setIntentandoConexion] = useState(false);
  const socketRef = useRef(null);
  const heartbeatInterval = useRef(null);
  
  // Estado para la pestaña activa: 'reservas' o 'eventos'
  const [activeTab, setActiveTab] = useState('reservas');
  const [puedeGestionarEventos, setPuedeGestionarEventos] = useState(false);
  
  // Estado para eventos
  const [eventos, setEventos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [mostrarFormEvento, setMostrarFormEvento] = useState(false);
  const [tipoEvento, setTipoEvento] = useState('pregunta');
  const [editandoEvento, setEditandoEvento] = useState(null);
  const [formEvento, setFormEvento] = useState({
    pregunta: '',
    respuesta: '',
    dificultad: 1,
    puntos: 50,
    ubicacion_id: '',
    pistas: [{ lugar: '', texto: '' }],
    duracion: 30,
    es_temporal: false,
    fecha_inicio: '',
    fecha_fin: '',
    evento_temporal_tipo: 'navidad',
    requiere_visitas: 1,
    lugares_requeridos: []
  });
  const [cargandoEventos, setCargandoEventos] = useState(false);

  // ========== Funciones auxiliares de estilos ==========
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

  const getTipoColor = (tipo) => {
    if (tipo === 'pregunta') return 'bg-blue-100 text-blue-700';
    if (tipo === 'pistas') return 'bg-purple-100 text-purple-700';
    if (tipo === 'reto') return 'bg-orange-100 text-orange-700';
    if (tipo === 'reunion') return 'bg-green-100 text-green-700';
    if (tipo === 'temporal') return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
  };

  // ========== Reservas ==========
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

  // Cargar perfil (disponibilidad y permisos)
  const cargarPerfil = useCallback(async () => {
    try {
      const response = await api.get(`/usuarios/${user?.id}`);
      setDisponible(response.data.disponible || false);
      setPuedeGestionarEventos(response.data.puede_gestionar_eventos || false);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  }, [user?.id]);

  // ========== Eventos ==========
  const cargarEventos = useCallback(async () => {
    if (!puedeGestionarEventos) return;
    setCargandoEventos(true);
    try {
      const [eventosRes, ubicacionesRes] = await Promise.all([
        api.get('/admin/eventos/preguntas'),
        api.get('/admin/eventos/ubicaciones')
      ]);
      setEventos(eventosRes.data);
      setUbicaciones(ubicacionesRes.data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      toast.error('Error al cargar eventos');
    } finally {
      setCargandoEventos(false);
    }
  }, [puedeGestionarEventos]);

  // ========== WebSocket (SOLO notificaciones, no afecta disponibilidad) ==========
  const conectarWebSocket = useCallback(() => {
    if (!user?.id) return;
    if (socketRef.current?.connected) return;
    setIntentandoConexion(true);
    const socketIo = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      timeout: 10000
    });
    socketRef.current = socketIo;

    socketIo.on('connect', () => {
      setConectado(true);
      setIntentandoConexion(false);
      socketIo.emit('guia-conectar-simple', { guiaId: user.id });
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = setInterval(() => {
        if (socketIo.connected) socketIo.emit('heartbeat', { guiaId: user.id });
      }, 30000);
    });
    socketIo.on('connect_error', () => { setConectado(false); setIntentandoConexion(false); });
    socketIo.on('disconnect', () => { setConectado(false); if (heartbeatInterval.current) clearInterval(heartbeatInterval.current); });
    socketIo.on('nueva-solicitud', (data) => {
      setSolicitudPendiente(data);
      toast.success(`📢 Nueva solicitud para ${data.lugar}`, { duration: 10000, icon: '👋' });
      cargarReservas(); // recargar para que aparezca en la lista
    });
    socketIo.on('reserva-confirmada', () => { toast.success('✅ Reserva confirmada', { icon: '🎉' }); cargarReservas(); setSolicitudPendiente(null); });
    socketIo.on('reserva-ya-asignada', () => { toast.error('❌ Esta reserva ya fue asignada a otro guía'); setSolicitudPendiente(null); });
    socketIo.on('heartbeat-ack', () => console.log('💓 Heartbeat recibido'));
  }, [user?.id, cargarReservas]);

  const desconectarWebSocket = useCallback(() => {
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    if (socketRef.current) {
      if (socketRef.current.connected) socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConectado(false);
  }, []);

  // ========== Notificaciones push (suscribir al usuario) ==========
  useEffect(() => {
    if (user?.id && 'Notification' in window && Notification.permission === 'granted') {
      subscribeUser().catch(err => console.error('Error al suscribir push:', err));
    }
  }, [user]);

  // ========== Polling de reservas (para no depender solo del WebSocket) ==========
  useEffect(() => {
    if (!disponible) return;
    const interval = setInterval(() => {
      cargarReservas();
    }, 15000); // cada 15 segundos
    return () => clearInterval(interval);
  }, [disponible, cargarReservas]);

  // Envío periódico de ubicación (solo si el socket está conectado)
  useEffect(() => {
    if (!socketRef.current?.connected || !disponible) return;
    let intervalId;
    const enviarUbicacion = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            socketRef.current.emit('actualizar-ubicacion', {
              guiaId: user?.id,
              latitud: position.coords.latitude,
              longitud: position.coords.longitude,
            });
          },
          (error) => console.error('Error de geolocalización:', error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
        );
      }
    };
    enviarUbicacion();
    intervalId = setInterval(enviarUbicacion, 10000);
    return () => clearInterval(intervalId);
  }, [socketRef.current?.connected, disponible, user?.id]);

  // ========== Efectos principales ==========
  useEffect(() => {
    if (user?.id) cargarPerfil();
  }, [user?.id, cargarPerfil]);

  // Conectar WebSocket siempre (independientemente de disponibilidad)
  useEffect(() => {
    conectarWebSocket();
    return () => desconectarWebSocket();
  }, [conectarWebSocket, desconectarWebSocket]);

  useEffect(() => {
    window.addEventListener('beforeunload', () => { if (socketRef.current?.connected) socketRef.current.disconnect(); });
    return () => window.removeEventListener('beforeunload', () => {});
  }, []);

  useEffect(() => { if (user?.id) cargarReservas(); }, [user?.id, cargarReservas]);

  useEffect(() => { if (activeTab === 'eventos' && puedeGestionarEventos) cargarEventos(); }, [activeTab, puedeGestionarEventos, cargarEventos]);

  useEffect(() => {
    if (filtroEstado === 'todas') setReservasFiltradas(reservas.filter(r => r.estado !== 'cancelada'));
    else setReservasFiltradas(reservas.filter(r => r.estado === filtroEstado));
  }, [filtroEstado, reservas]);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/reservas/${id}/estado`, { estado });
      toast.success(`Reserva ${estado}`);
      cargarReservas();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const toggleDisponibilidad = async () => {
    const nuevoEstado = !disponible;
    const loadingToast = toast.loading(nuevoEstado ? 'Activando disponibilidad...' : 'Desactivando disponibilidad...');
    try {
      await api.patch(`/usuarios/${user?.id}/disponibilidad`, { disponible: nuevoEstado });
      setDisponible(nuevoEstado);
      toast.dismiss(loadingToast);
      toast.success(nuevoEstado ? '✅ Estás disponible para recibir reservas' : '⛔ Ya no recibirás más reservas', {
        duration: 3000,
        icon: nuevoEstado ? '🟢' : '🔴'
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error al cambiar disponibilidad');
    }
  };

  const handleRefresh = () => { setRefreshing(true); cargarReservas(); };
  const handleLogout = () => { desconectarWebSocket(); logout(); window.location.href = '/login'; };

  // ========== CRUD Eventos ==========
  const resetFormEvento = () => {
    setFormEvento({
      pregunta: '',
      respuesta: '',
      dificultad: 1,
      puntos: 50,
      ubicacion_id: '',
      pistas: [{ lugar: '', texto: '' }],
      duracion: 30,
      es_temporal: false,
      fecha_inicio: '',
      fecha_fin: '',
      evento_temporal_tipo: 'navidad',
      requiere_visitas: 1,
      lugares_requeridos: []
    });
    setEditandoEvento(null);
    setTipoEvento('pregunta');
    setMostrarFormEvento(false);
  };

  const handleGuardarEvento = async () => {
    try {
      let data;
      if (tipoEvento === 'pregunta') {
        data = { tipo: 'pregunta', pregunta: formEvento.pregunta, respuesta: formEvento.respuesta, dificultad: formEvento.dificultad, puntos: formEvento.puntos, ubicacion_id: formEvento.ubicacion_id || null };
      } else if (tipoEvento === 'pistas') {
        data = { tipo: 'pistas', pregunta: formEvento.pregunta, respuesta: formEvento.respuesta, pistas: formEvento.pistas.filter(p => p.texto.trim()), puntos: formEvento.puntos };
      } else if (tipoEvento === 'reto') {
        data = { tipo: 'reto', pregunta: formEvento.pregunta, respuesta: formEvento.respuesta, duracion: formEvento.duracion, puntos: formEvento.puntos, ubicacion_id: formEvento.ubicacion_id || null };
      } else if (tipoEvento === 'reunion') {
        data = { tipo: 'reunion', pregunta: formEvento.pregunta, puntos: formEvento.puntos, ubicacion_id: formEvento.ubicacion_id || null, respuesta: 'asistencia' };
      } else if (tipoEvento === 'temporal') {
        data = { tipo: 'temporal', pregunta: formEvento.pregunta, respuesta: formEvento.respuesta, puntos: formEvento.puntos, es_temporal: true, fecha_inicio: formEvento.fecha_inicio, fecha_fin: formEvento.fecha_fin, evento_temporal_tipo: formEvento.evento_temporal_tipo, requiere_visitas: formEvento.requiere_visitas, lugares_requeridos: formEvento.lugares_requeridos, ubicacion_id: formEvento.ubicacion_id || null };
      }
      if (editandoEvento) {
        await api.put(`/admin/eventos/preguntas/${editandoEvento.id}`, data);
        toast.success('Evento actualizado');
      } else {
        await api.post('/admin/eventos/preguntas', data);
        toast.success('Evento creado');
      }
      resetFormEvento();
      cargarEventos();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar evento');
    }
  };

  const eliminarEvento = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await api.delete(`/admin/eventos/preguntas/${id}`);
      toast.success('Evento eliminado');
      cargarEventos();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const agregarPista = () => setFormEvento(prev => ({ ...prev, pistas: [...prev.pistas, { lugar: '', texto: '' }] }));
  const eliminarPista = (index) => setFormEvento(prev => ({ ...prev, pistas: prev.pistas.filter((_, i) => i !== index) }));
  const actualizarPista = (index, campo, valor) => setFormEvento(prev => ({ ...prev, pistas: prev.pistas.map((p, i) => i === index ? { ...p, [campo]: valor } : p) }));
  const toggleLugarRequerido = (lugarId) => setFormEvento(prev => ({ ...prev, lugares_requeridos: prev.lugares_requeridos.includes(lugarId) ? prev.lugares_requeridos.filter(id => id !== lugarId) : [...prev.lugares_requeridos, lugarId] }));

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-10 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hola, {user?.nombre?.split(' ')[0] || 'Guía'} 👋</h1>
            <p className="text-emerald-100 text-sm mt-0.5 opacity-90">{activeTab === 'reservas' ? 'Aquí están tus recorridos' : 'Gestión de eventos diarios'}</p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition">Salir</button>
        </div>

        {/* Switch de disponibilidad */}
        <div className="flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-2xl p-3 mt-6">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${disponible ? 'bg-emerald-400/30' : 'bg-gray-400/30'}`}>
              <PowerIcon className={`w-5 h-5 ${disponible ? 'text-emerald-200' : 'text-gray-300'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{disponible ? 'Disponible' : 'No disponible'}</span>
                {conectado && disponible && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-400/30 px-1.5 py-0.5 rounded-full">
                    <WifiIcon className="w-3 h-3" /> En línea
                  </span>
                )}
                {intentandoConexion && disponible && (
                  <span className="flex items-center gap-1 text-xs bg-yellow-400/30 px-1.5 py-0.5 rounded-full">
                    <ArrowPathIcon className="w-3 h-3 animate-spin" /> Conectando...
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                {disponible 
                  ? (conectado ? 'Recibiendo reservas en tiempo real' : 'Conectando al servidor...') 
                  : 'Activa tu disponibilidad para recibir reservas'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDisponibilidad}
            disabled={intentandoConexion}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              disponible ? 'bg-emerald-400' : 'bg-gray-400'
            } ${intentandoConexion ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              disponible ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {puedeGestionarEventos && (
          <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Gestión de eventos activada</p>
                <p className="text-sm text-emerald-800/80">Toca la pestaña “Gestión de eventos” para crear y editar retos diarios.</p>
              </div>
              <button onClick={() => setActiveTab('eventos')} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-700 transition">
                Ir a eventos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - con margen superior para evitar solapamiento con las estadísticas */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-50 to-stone-50 pt-2 pb-0">
        <div className="flex gap-2 px-5 border-b border-gray-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('reservas')}
            className={`min-w-[140px] px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'reservas' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white/50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Mis recorridos
          </button>
          {puedeGestionarEventos && (
            <button
              onClick={() => setActiveTab('eventos')}
              className={`min-w-[140px] px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'eventos' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white/50' : 'text-gray-500 hover:text-gray-700'
            }`}
            >
              🎮 Gestión de eventos
            </button>
          )}
        </div>
      </div>

      {activeTab === 'reservas' && (
        <>
          {/* Estadísticas - con margen superior reducido y flex wrap */}
          <div className="px-5 mt-3">
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center"><div className="bg-amber-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1"><CalendarIcon className="w-3.5 h-3.5 text-amber-600" /></div><div className="text-lg font-bold text-gray-800">{stats.hoy}</div><div className="text-xs text-gray-400">Hoy</div></div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center"><div className="bg-sky-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1"><ClockIcon className="w-3.5 h-3.5 text-sky-600" /></div><div className="text-lg font-bold text-gray-800">{stats.pendientes}</div><div className="text-xs text-gray-400">Pendientes</div></div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center"><div className="bg-emerald-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1"><CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" /></div><div className="text-lg font-bold text-gray-800">{stats.completadas}</div><div className="text-xs text-gray-400">Completadas</div></div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center"><div className="bg-rose-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1"><XCircleIcon className="w-3.5 h-3.5 text-rose-600" /></div><div className="text-lg font-bold text-gray-800">{stats.canceladas}</div><div className="text-xs text-gray-400">Canceladas</div></div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm text-center"><div className="bg-yellow-100 w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1"><StarIcon className="w-3.5 h-3.5 text-yellow-500" /></div><div className="text-lg font-bold text-gray-800">{stats.calificacion?.toFixed(1) || 'Nuevo'}</div><div className="text-xs text-gray-400">Calif.</div></div>
            </div>
          </div>

          {/* Filtros y lista de reservas */}
          <div className="flex justify-between items-center px-5 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {['todas', 'pendiente', 'confirmada', 'completada', 'cancelada'].map(estado => (
                <button key={estado} onClick={() => setFiltroEstado(estado)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${filtroEstado === estado ? 'bg-emerald-600 text-white' : 'bg-white/70 text-gray-600 hover:bg-gray-100'}`}>
                  {estado === 'todas' ? 'Activas' : estado === 'pendiente' ? 'Pendientes' : estado === 'confirmada' ? 'Confirmadas' : estado === 'completada' ? 'Completadas' : 'Canceladas'}
                </button>
              ))}
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1.5 text-gray-500 text-sm bg-white/70 px-3 py-1.5 rounded-full shadow-sm"><ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
          </div>

          <div className="px-5 mt-4">
            <div className="flex justify-between items-center mb-3"><h2 className="text-lg font-semibold text-gray-800">📋 Mis recorridos</h2><span className="text-xs text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">{reservasFiltradas.length}</span></div>
            {reservasFiltradas.length === 0 ? (
              <div className="bg-white/60 rounded-2xl p-10 text-center shadow-sm"><UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No hay reservas</p><p className="text-xs text-gray-400 mt-1">{filtroEstado === 'cancelada' ? 'No hay reservas canceladas' : 'Las reservas aparecerán aquí cuando te asignen'}</p></div>
            ) : (
              <div className="space-y-3">
                {reservasFiltradas.map(reserva => (
                  <div key={reserva.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{reserva.lugar_nombre}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><CalendarIcon className="w-3.5 h-3.5" />{new Date(reserva.fecha_encuentro).toLocaleString()}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><UserGroupIcon className="w-3.5 h-3.5" />{reserva.numero_personas} personas</p>
                        {reserva.intereses && <div className="mt-2"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🎯 {reserva.intereses}</span></div>}
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoColor(reserva.estado)}`}>
                        {getEstadoIcono(reserva.estado)}
                        {reserva.estado}
                      </div>
                    </div>
                    {reserva.estado !== 'cancelada' && reserva.guia_id === user?.id && (
                      <div className="flex gap-2 mt-4">
                        {reserva.estado === 'pendiente' && <button onClick={() => cambiarEstado(reserva.id, 'confirmada')} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600">Confirmar</button>}
                        {reserva.estado === 'confirmada' && (
                          <>
                            <button onClick={() => cambiarEstado(reserva.id, 'completada')} className="flex-1 bg-sky-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-sky-600">Completar</button>
                            <button onClick={() => cambiarEstado(reserva.id, 'cancelada')} className="flex-1 bg-rose-400 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-rose-500">Cancelar</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'eventos' && puedeGestionarEventos && (
        <div className="px-5 mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">🎮 Eventos diarios</h2>
            <button onClick={() => setMostrarFormEvento(true)} className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700"><PlusIcon className="w-4 h-4" /> Nuevo evento</button>
          </div>

          {cargandoEventos ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
          ) : eventos.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">No hay eventos creados aún</div>
          ) : (
            <div className="space-y-2">
              {eventos.map(ev => (
                <div key={ev.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTipoColor(ev.tipo || 'pregunta')}`}>
                        {ev.tipo === 'pregunta' && '❓ Pregunta'}
                        {ev.tipo === 'pistas' && '🔍 Pistas'}
                        {ev.tipo === 'reto' && '⏱️ Reto'}
                        {ev.tipo === 'reunion' && '📍 Reunión'}
                        {ev.tipo === 'temporal' && '🎪 Temporal'}
                      </span>
                      <span className="font-medium text-gray-800">{ev.pregunta}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Respuesta: {ev.respuesta} | +{ev.puntos || 50} XP</div>
                    {ev.tipo === 'pistas' && ev.pistas && ev.pistas.length > 0 && <div className="text-xs text-gray-400 mt-1">📜 {ev.pistas.length} pistas</div>}
                    {ev.tipo === 'temporal' && ev.es_temporal && <div className="text-xs text-pink-500 mt-1">🎪 Evento temporal hasta {ev.fecha_fin ? new Date(ev.fecha_fin).toLocaleDateString() : 'Sin fecha'}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditandoEvento(ev); setTipoEvento(ev.tipo || 'pregunta'); setFormEvento(prev => ({ ...prev, ...ev })); setMostrarFormEvento(true); }} className="text-blue-500 hover:text-blue-700"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => eliminarEvento(ev.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de creación/edición de eventos (respetando diseño previo) */}
          {mostrarFormEvento && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{editandoEvento ? 'Editar evento' : 'Nuevo evento'}</h3><button onClick={resetFormEvento}><XMarkIcon className="w-6 h-6 text-gray-500" /></button></div>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">Tipo de evento</label><select value={tipoEvento} onChange={e => setTipoEvento(e.target.value)} className="w-full p-2 border rounded"><option value="pregunta">❓ Pregunta</option><option value="pistas">🔍 Caza de pistas</option><option value="reto">⏱️ Reto contrarreloj</option><option value="reunion">📍 Punto de encuentro</option><option value="temporal">🎪 Evento temporal</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Título / pregunta *</label><input type="text" value={formEvento.pregunta} onChange={e => setFormEvento({ ...formEvento, pregunta: e.target.value })} className="w-full p-2 border rounded" required /></div>
                  {tipoEvento !== 'reunion' && <div><label className="block text-sm font-medium mb-1">Respuesta correcta *</label><input type="text" value={formEvento.respuesta} onChange={e => setFormEvento({ ...formEvento, respuesta: e.target.value })} className="w-full p-2 border rounded" required /></div>}
                  <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">Dificultad</label><select value={formEvento.dificultad} onChange={e => setFormEvento({ ...formEvento, dificultad: parseInt(e.target.value) })} className="w-full p-2 border rounded"><option value={1}>Fácil (+50 XP)</option><option value={2}>Media (+60 XP)</option><option value={3}>Difícil (+80 XP)</option></select></div><div><label className="block text-sm font-medium mb-1">Puntos base</label><input type="number" value={formEvento.puntos} onChange={e => setFormEvento({ ...formEvento, puntos: parseInt(e.target.value) })} className="w-full p-2 border rounded" /></div></div>
                  <div><label className="block text-sm font-medium mb-1">Ubicación (opcional)</label><select value={formEvento.ubicacion_id} onChange={e => setFormEvento({ ...formEvento, ubicacion_id: e.target.value })} className="w-full p-2 border rounded"><option value="">Sin ubicación</option>{ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div>
                  {tipoEvento === 'pistas' && (
                    <div><label className="block text-sm font-medium mb-1">Pistas (cada una con ubicación)</label>{formEvento.pistas.map((pista, idx) => (<div key={idx} className="border rounded p-3 mb-2"><div className="flex justify-between"><span className="font-medium">Pista {idx+1}</span>{idx > 0 && <button type="button" onClick={() => eliminarPista(idx)} className="text-red-500 text-sm">Eliminar</button>}</div><select value={pista.lugar} onChange={e => actualizarPista(idx, 'lugar', e.target.value)} className="w-full p-2 border rounded mb-2"><option value="">Ubicación</option>{ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select><textarea value={pista.texto} onChange={e => actualizarPista(idx, 'texto', e.target.value)} placeholder="Texto de la pista" className="w-full p-2 border rounded" rows="2" /></div>))}<button type="button" onClick={agregarPista} className="text-blue-500 text-sm">+ Agregar pista</button></div>
                  )}
                  {tipoEvento === 'reto' && <div><label className="block text-sm font-medium mb-1">Tiempo límite (minutos)</label><input type="number" value={formEvento.duracion} onChange={e => setFormEvento({ ...formEvento, duracion: parseInt(e.target.value) })} className="w-full p-2 border rounded" /></div>}
                  {tipoEvento === 'temporal' && (
                    <>
                      <div><label className="block text-sm font-medium mb-1">Tipo de temporal</label><select value={formEvento.evento_temporal_tipo} onChange={e => setFormEvento({ ...formEvento, evento_temporal_tipo: e.target.value })} className="w-full p-2 border rounded"><option value="navidad">🎄 Navidad</option><option value="fiestas">🎉 Fiestas Patronales</option><option value="semana_santa">🌿 Semana Santa</option><option value="reto_pueblo">🏃‍♂️ Reto del Pueblo</option><option value="personalizado">📅 Personalizado</option></select></div>
                      <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">Fecha inicio</label><input type="date" value={formEvento.fecha_inicio} onChange={e => setFormEvento({ ...formEvento, fecha_inicio: e.target.value })} className="w-full p-2 border rounded" /></div><div><label className="block text-sm font-medium mb-1">Fecha fin</label><input type="date" value={formEvento.fecha_fin} onChange={e => setFormEvento({ ...formEvento, fecha_fin: e.target.value })} className="w-full p-2 border rounded" /></div></div>
                      <div><label className="block text-sm font-medium mb-1">Requiere visitas</label><select value={formEvento.requiere_visitas} onChange={e => setFormEvento({ ...formEvento, requiere_visitas: parseInt(e.target.value) })} className="w-full p-2 border rounded"><option value={1}>1 lugar</option><option value={3}>3 lugares</option><option value={5}>5 lugares</option></select></div>
                      {formEvento.requiere_visitas > 1 && (
                        <div><label className="block text-sm font-medium mb-2">Lugares a visitar</label><div className="border rounded max-h-48 overflow-y-auto p-2">{ubicaciones.map(u => (<label key={u.id} className="flex items-center gap-2 p-1"><input type="checkbox" checked={formEvento.lugares_requeridos.includes(u.id)} onChange={() => toggleLugarRequerido(u.id)} />{u.nombre}</label>))}</div></div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6"><button onClick={resetFormEvento} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button><button onClick={handleGuardarEvento} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Guardar</button></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}