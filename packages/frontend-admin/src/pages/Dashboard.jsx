// pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import {
  MapPinIcon, CalendarIcon, UsersIcon, ClipboardDocumentListIcon,
  StarIcon, ChartBarIcon, ArrowTrendingUpIcon, QrCodeIcon,
  HomeIcon, TrophyIcon, PhotoIcon, BuildingLibraryIcon,
  Cog6ToothIcon, ArrowRightOnRectangleIcon, XMarkIcon,
  Bars3Icon, ClockIcon, UserGroupIcon, WifiIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/runtime';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4', '#45B7D1'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [estadisticas, setEstadisticas] = useState({
    totalLugares: 0,
    lugaresVisitados: 0,
    totalReservas: 0,
    reservasPendientes: 0,
    guiasActivos: 0,
    totalEncuestas: 0,
    calificacionPromedio: 0
  });
  const [reservasPorMes, setReservasPorMes] = useState([]);
  const [lugaresTop, setLugaresTop] = useState([]);
  const [origenTuristas, setOrigenTuristas] = useState([]);
  const [calificacionesPorMes, setCalificacionesPorMes] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [escaneos, setEscaneos] = useState({ total: 0, unicos: 0 });
  const [visitasPorDia, setVisitasPorDia] = useState([]);
  const [estadisticasHoras, setEstadisticasHoras] = useState([]);
  const [sesionesDetalle, setSesionesDetalle] = useState([]);
  const [guiaSeleccionado, setGuiaSeleccionado] = useState(null);
  const [guiasEnVivo, setGuiasEnVivo] = useState([]);
  const [guiasCargando, setGuiasCargando] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: -75.2592802,
    latitude: 6.3953494,
    zoom: 13,
    pitch: 0,
    bearing: 0
  });
  const [guiaPopup, setGuiaPopup] = useState(null);
  const [socket, setSocket] = useState(null);
  const [rangoFechas, setRangoFechas] = useState({
    inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  const mapRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', nombre: 'Dashboard', icon: HomeIcon, ruta: '/admin', color: 'text-blue-500' },
    { id: 'lugares', nombre: 'Lugares', icon: MapPinIcon, ruta: '/admin/lugares', color: 'text-green-500' },
    { id: 'eventos', nombre: 'Eventos', icon: CalendarIcon, ruta: '/admin/eventos', color: 'text-purple-500' },
    { id: 'reservas', nombre: 'Reservas', icon: ClipboardDocumentListIcon, ruta: '/admin/reservas', color: 'text-orange-500' },
    { id: 'guias', nombre: 'Guías', icon: UsersIcon, ruta: '/admin/guias', color: 'text-indigo-500' },
    { id: 'insignias', nombre: 'Insignias', icon: TrophyIcon, ruta: '/admin/insignias', color: 'text-yellow-500' },
    { id: 'galeria', nombre: 'Galería', icon: PhotoIcon, ruta: '/admin/galeria', color: 'text-pink-500' },
    { id: 'ubicaciones', nombre: 'Ubicaciones', icon: BuildingLibraryIcon, ruta: '/admin/ubicaciones', color: 'text-teal-500' },
  ];

  // Cargar guías en vivo desde el backend
  const cargarGuiasEnVivo = async () => {
    try {
      const response = await api.get('/usuarios/ubicaciones');
      setGuiasEnVivo(response.data.guias || []);
    } catch (error) {
      console.error('Error al cargar guías en vivo:', error);
    } finally {
      setGuiasCargando(false);
    }
  };

  // Conectar WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    cargarGuiasEnVivo();

    const socketIo = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('🔌 Admin conectado a WebSocket');
      socketIo.emit('admin-conectar', { adminId: 'admin' });
    });

    socketIo.on('guia-ubicacion-actualizada', (data) => {
      console.log('📍 Actualización de ubicación:', data);
      setGuiasEnVivo(prev => {
        const index = prev.findIndex(g => g.id === data.guiaId);
        if (index >= 0) {
          const nuevaLista = [...prev];
          nuevaLista[index] = { ...nuevaLista[index], ...data };
          return nuevaLista;
        } else {
          return [...prev, data];
        }
      });
    });

    socketIo.on('guia-desconectado', (data) => {
      console.log('🔴 Guía desconectado:', data);
      setGuiasEnVivo(prev => prev.filter(g => g.id !== data.guiaId));
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  useEffect(() => {
    cargarDatos();
    cargarEscaneos();
    cargarVisitasPorDia();
    cargarEstadisticasHoras();
  }, [rangoFechas]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        estadisticasRes,
        reservasMesRes,
        lugaresTopRes,
        origenRes,
        calificacionesRes,
        actividadRes
      ] = await Promise.allSettled([
        api.get('/metricas/estadisticas'),
        api.get('/metricas/reservas-por-mes'),
        api.get('/metricas/lugares-top'),
        api.get('/metricas/origen-turistas'),
        api.get('/metricas/calificaciones-por-mes'),
        api.get('/metricas/actividad-reciente')
      ]);

      if (estadisticasRes.status === 'fulfilled') setEstadisticas(estadisticasRes.value.data.data || estadisticasRes.value.data);
      if (reservasMesRes.status === 'fulfilled') setReservasPorMes(reservasMesRes.value.data.data || []);
      if (lugaresTopRes.status === 'fulfilled') setLugaresTop(lugaresTopRes.value.data.data || []);
      if (origenRes.status === 'fulfilled') setOrigenTuristas(origenRes.value.data.data || []);
      if (calificacionesRes.status === 'fulfilled') setCalificacionesPorMes(calificacionesRes.value.data.data || []);
      if (actividadRes.status === 'fulfilled') setActividadReciente(actividadRes.value.data.data || []);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarEscaneos = async () => {
    try {
      const response = await api.get('/escaneos/visitantes-unicos');
      setEscaneos(response.data.estadisticas || { total: 0, unicos: 0 });
    } catch (error) {
      console.error('Error al cargar escaneos:', error);
    }
  };

  const cargarVisitasPorDia = async () => {
    try {
      const response = await api.get('/metricas/visitas-por-dia');
      setVisitasPorDia(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar visitas por día:', error);
    }
  };

  const cargarEstadisticasHoras = async () => {
    try {
      const response = await api.get(`/usuarios/sesiones/estadisticas?fechaInicio=${rangoFechas.inicio}&fechaFin=${rangoFechas.fin}`);
      setEstadisticasHoras(response.data.estadisticas || []);
    } catch (error) {
      console.error('Error al cargar estadísticas de horas:', error);
    }
  };

  const cargarDetalleSesiones = async (guiaId) => {
    try {
      const response = await api.get(`/usuarios/sesiones/detalle/${guiaId}?fechaInicio=${rangoFechas.inicio}&fechaFin=${rangoFechas.fin}`);
      setSesionesDetalle(response.data.sesiones || []);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  };

  const handleVerDetalle = async (guiaId) => {
    setGuiaSeleccionado(guiaId);
    await cargarDetalleSesiones(guiaId);
  };

  const formatHoras = (minutos) => {
    const horas = Math.floor(Math.abs(minutos) / 60);
    const mins = Math.abs(minutos) % 60;
    return `${horas}h ${mins}min`;
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'activa': return 'bg-green-100 text-green-700';
      case 'finalizada': return 'bg-blue-100 text-blue-700';
      case 'interrumpida': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const metricCards = [
    { nombre: 'Lugares', valor: estadisticas.totalLugares, icon: MapPinIcon, color: 'bg-blue-500' },
    { nombre: 'Reservas', valor: estadisticas.totalReservas, icon: CalendarIcon, color: 'bg-green-500' },
    { nombre: 'Guías', valor: estadisticas.guiasActivos, icon: UsersIcon, color: 'bg-purple-500' },
    { nombre: 'Encuestas', valor: estadisticas.totalEncuestas, icon: ClipboardDocumentListIcon, color: 'bg-orange-500' },
    { nombre: 'Pendientes', valor: estadisticas.reservasPendientes, icon: ChartBarIcon, color: 'bg-yellow-500' },
    { nombre: '⭐ Calificación', valor: estadisticas.calificacionPromedio?.toFixed(1) || '0.0', icon: StarIcon, color: 'bg-pink-500' },
    { nombre: '📱 Visitantes', valor: escaneos.unicos || 0, icon: QrCodeIcon, color: 'bg-indigo-500', tooltip: 'Visitantes únicos' },
    { nombre: '👥 Visitas', valor: escaneos.total || 0, icon: UserGroupIcon, color: 'bg-teal-500', tooltip: 'Total de escaneos' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Error de Configuración</h2>
          <p className="text-gray-500">No se detectó VITE_MAPBOX_TOKEN</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header móvil */}
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-white z-30 flex items-center justify-between px-4 py-3 shadow-lg md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🗺️</div>
          <span className="font-bold text-sm">Concepción Admin</span>
        </div>
        <button onClick={() => setMenuAbierto(true)} className="p-2 rounded-lg hover:bg-white/20 transition">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Menú lateral móvil */}
      {menuAbierto && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMenuAbierto(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-gray-900 text-white z-50 flex flex-col shadow-2xl md:hidden animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-lg">🗺️</div>
                <span className="font-bold">Concepción Admin</span>
              </div>
              <button onClick={() => setMenuAbierto(false)} className="p-2 rounded-lg hover:bg-gray-700 transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMenuAbierto(false);
                      navigate(item.ruta);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-800 active:bg-gray-700"
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm">{item.nombre}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-700">
              <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-400">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="pt-16 md:pt-6 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'dashboard' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'mapa' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗺️ Guías en Vivo
          </button>
          <button
            onClick={() => setActiveTab('horas')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === 'horas' 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⏱️ Seguimiento de Horas
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {metricCards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-3 group" title={card.tooltip}>
                  <div className="flex items-center justify-between">
                    <div className={`${card.color} p-2 rounded-lg`}>
                      <card.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-800">
                      {typeof card.valor === 'number' ? card.valor.toLocaleString() : card.valor}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 truncate">{card.nombre}</p>
                </div>
              ))}
            </div>

            {/* Gráficos */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                  Reservas por mes
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={reservasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tickFormatter={(value) => new Date(value).toLocaleDateString('es', { month: 'short' })} fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F633" name="Reservas" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  Visitas diarias (últimos 7 días)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={visitasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="visitas" fill="#10B981" radius={[4, 4, 0, 0]} name="Visitas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-green-500" />
                  Lugares más visitados
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={lugaresTop} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={10} />
                    <YAxis type="category" dataKey="nombre" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="visitas" fill="#10B981" name="Visitas" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  Calificaciones promedio
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={calificacionesPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tickFormatter={(value) => new Date(value).toLocaleDateString('es', { month: 'short' })} fontSize={10} />
                    <YAxis domain={[0, 5]} fontSize={10} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="promedio_guia" stroke="#EF4444" name="Guía" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="promedio_experiencia" stroke="#8B5CF6" name="Experiencia" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-indigo-500" />
                  Origen de turistas
                </h3>
                {origenTuristas.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={origenTuristas} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''} outerRadius={80} dataKey="total" nameKey="origen_turista">
                        {origenTuristas.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">No hay datos disponibles</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'mapa' && (
          <div className="space-y-4">
            {/* Lista de guías conectados */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <WifiIcon className="w-5 h-5 text-green-500" />
                  Guías conectados ({guiasEnVivo.filter(g => g.conectado).length})
                </h3>
                <button
                  onClick={cargarGuiasEnVivo}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Actualizar
                </button>
              </div>
              {guiasCargando ? (
                <div className="text-center py-4 text-gray-400">Cargando guías...</div>
              ) : guiasEnVivo.filter(g => g.conectado).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <WifiOffIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  No hay guías conectados en este momento
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {guiasEnVivo.filter(g => g.conectado).map((guia) => (
                    <div
                      key={guia.id}
                      onClick={() => {
                        if (guia.latitud && guia.longitud) {
                          setViewState(prev => ({
                            ...prev,
                            latitude: parseFloat(guia.latitud),
                            longitude: parseFloat(guia.longitud),
                            zoom: 15
                          }));
                          setGuiaPopup(guia);
                        }
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        {guia.nombre?.charAt(0)?.toUpperCase() || 'G'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">{guia.nombre}</div>
                        <div className="text-xs text-gray-400">
                          {guia.latitud && guia.longitud ? '📍 Ubicación disponible' : '📍 Ubicación desconocida'}
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 500 }}>
              <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/outdoors-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                attributionControl={false}
                style={{ width: '100%', height: '100%' }}
              >
                <NavigationControl position="top-right" />
                
                {/* Marcadores de guías */}
                {guiasEnVivo.filter(g => g.conectado && g.latitud && g.longitud).map((guia) => (
                  <Marker
                    key={guia.id}
                    longitude={parseFloat(guia.longitud)}
                    latitude={parseFloat(guia.latitud)}
                    onClick={() => setGuiaPopup(guia)}
                  >
                    <div className="relative cursor-pointer group">
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                      <div className="relative w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
                        {guia.nombre?.charAt(0)?.toUpperCase() || 'G'}
                      </div>
                    </div>
                  </Marker>
                ))}

                {/* Popup de guía */}
                {guiaPopup && (
                  <Popup
                    longitude={parseFloat(guiaPopup.longitud)}
                    latitude={parseFloat(guiaPopup.latitud)}
                    onClose={() => setGuiaPopup(null)}
                    closeButton={true}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={16}
                  >
                    <div className="p-2 min-w-[150px]">
                      <div className="font-bold text-gray-800">{guiaPopup.nombre}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${guiaPopup.conectado ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {guiaPopup.conectado ? 'Conectado' : 'Desconectado'}
                      </div>
                      {guiaPopup.ultima_actividad && (
                        <div className="text-xs text-gray-400 mt-1">
                          Última actividad: {new Date(guiaPopup.ultima_actividad).toLocaleTimeString()}
                        </div>
                      )}
                      <button
                        onClick={() => handleVerDetalle(guiaPopup.id)}
                        className="mt-2 w-full text-xs text-blue-500 hover:text-blue-600"
                      >
                        Ver estadísticas →
                      </button>
                    </div>
                  </Popup>
                )}
              </Map>
            </div>

            {/* Estadísticas de ubicación */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-purple-500" />
                Actividad de guías
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{guiasEnVivo.filter(g => g.conectado).length}</div>
                  <div className="text-xs text-gray-500">Conectados ahora</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{guiasEnVivo.filter(g => g.latitud && g.longitud).length}</div>
                  <div className="text-xs text-gray-500">Con ubicación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{estadisticasHoras.length}</div>
                  <div className="text-xs text-gray-500">Guías registrados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(estadisticasHoras.reduce((acc, g) => acc + (g.total_minutos || 0), 0) / 60).toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-500">Horas totales</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'horas' && (
          <div className="space-y-6">
            {/* Selector de fechas */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-500" />
                Rango de fechas
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={rangoFechas.inicio}
                    onChange={(e) => setRangoFechas({ ...rangoFechas, inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    value={rangoFechas.fin}
                    onChange={(e) => setRangoFechas({ ...rangoFechas, fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 invisible">.</label>
                  <button
                    onClick={() => {
                      setRangoFechas({
                        inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                        fin: new Date().toISOString().split('T')[0]
                      });
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen general */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white">
                <div className="text-2xl font-bold">
                  {(estadisticasHoras.reduce((acc, g) => acc + (g.total_minutos || 0), 0) / 60).toFixed(1)}h
                </div>
                <div className="text-xs opacity-90">Total horas acumuladas</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 text-white">
                <div className="text-2xl font-bold">{estadisticasHoras.length}</div>
                <div className="text-xs opacity-90">Guías activos</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white">
                <div className="text-2xl font-bold">{estadisticasHoras.reduce((acc, g) => acc + (g.dias_trabajados || 0), 0)}</div>
                <div className="text-xs opacity-90">Días trabajados</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 text-white">
                <div className="text-2xl font-bold">
                  {(estadisticasHoras.reduce((acc, g) => acc + (g.total_minutos || 0), 0) / (estadisticasHoras.length || 1) / 60).toFixed(1)}h
                </div>
                <div className="text-xs opacity-90">Promedio por guía</div>
              </div>
            </div>

            {/* Tabla de horas */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-indigo-500" />
                  Detalle por guía
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guía</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días trabajados</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total horas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio/día</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estadisticasHoras.map((guia) => (
                      <tr key={guia.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{guia.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{guia.dias_trabajados || 0}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatHoras(guia.total_minutos || 0)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatHoras(guia.promedio_minutos || 0)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleVerDetalle(guia.id)}
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            Ver detalle →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {estadisticasHoras.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No hay datos en el período seleccionado</div>
                )}
              </div>
            </div>

            {/* Detalle de sesiones */}
            {guiaSeleccionado && sesionesDetalle.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-purple-500" />
                    Historial de sesiones - {estadisticasHoras.find(g => g.id === guiaSeleccionado)?.nombre}
                  </h3>
                  <button onClick={() => setGuiaSeleccionado(null)} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {sesionesDetalle.map((sesion) => (
                    <div key={sesion.id} className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <span className="font-medium text-gray-800">
                            {new Date(sesion.fecha).toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            <span>🕐 Inicio: {sesion.hora_inicio ? new Date(sesion.hora_inicio).toLocaleTimeString() : '-'}</span>
                            <span className="mx-2">→</span>
                            <span>Fin: {sesion.hora_fin ? new Date(sesion.hora_fin).toLocaleTimeString() : 'En curso'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(sesion.estado)}`}>
                            {sesion.estado === 'activa' ? '🟢 Activa' : sesion.estado === 'finalizada' ? '✅ Finalizada' : '⚠️ Interrumpida'}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            ⏱️ {formatHoras(sesion.duracion_minutos)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}