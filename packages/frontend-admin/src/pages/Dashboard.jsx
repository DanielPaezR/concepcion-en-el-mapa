// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import {
  MapPinIcon, CalendarIcon, UsersIcon, ClipboardDocumentListIcon,
  StarIcon, ChartBarIcon, ArrowTrendingUpIcon, QrCodeIcon,
  HomeIcon, TrophyIcon, PhotoIcon, BuildingLibraryIcon,
  Cog6ToothIcon, ArrowRightOnRectangleIcon, XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4', '#45B7D1'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
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
  const navigate = useNavigate();

  // Elementos del menú con sus rutas
  const menuItems = [
    { id: 'dashboard', nombre: 'Dashboard', icon: HomeIcon, ruta: '/admin', color: 'text-blue-500' },
    { id: 'lugares', nombre: 'Lugares', icon: MapPinIcon, ruta: '/admin/lugares', color: 'text-green-500' },
    { id: 'eventos', nombre: 'Eventos', icon: CalendarIcon, ruta: '/admin/eventos', color: 'text-purple-500' },
    { id: 'reservas', nombre: 'Reservas', icon: ClipboardDocumentListIcon, ruta: '/admin/reservas', color: 'text-orange-500' },
    { id: 'guias', nombre: 'Guías', icon: UsersIcon, ruta: '/admin/guias', color: 'text-indigo-500' },
    { id: 'insignias', nombre: 'Insignias', icon: TrophyIcon, ruta: '/admin/insignias', color: 'text-yellow-500' },
    { id: 'galeria', nombre: 'Galería', icon: PhotoIcon, ruta: '/admin/galeria', color: 'text-pink-500' },
    { id: 'ubicaciones', nombre: 'Ubicaciones', icon: BuildingLibraryIcon, ruta: '/admin/ubicaciones', color: 'text-teal-500' },
    { id: 'escaneos', nombre: 'Escaneos QR', icon: QrCodeIcon, ruta: '/admin/escaneos', color: 'text-cyan-500' },
    { id: 'configuracion', nombre: 'Configuración', icon: Cog6ToothIcon, ruta: '/admin/configuracion', color: 'text-gray-500' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarDatos();
    cargarEscaneos();
    cargarVisitasPorDia();
  }, []);

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
      const response = await api.get('/escaneos/estadisticas');
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

  const handleNavegacion = (ruta) => {
    setMenuAbierto(false); // Cierra el menú inmediatamente
    navigate(ruta); // Navega a la página
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('turista_token');
    navigate('/login');
  };

  // Tarjetas de métricas
  const metricCards = [
    { nombre: 'Lugares', valor: estadisticas.totalLugares, icon: MapPinIcon, color: 'bg-blue-500' },
    { nombre: 'Reservas', valor: estadisticas.totalReservas, icon: CalendarIcon, color: 'bg-green-500' },
    { nombre: 'Guías', valor: estadisticas.guiasActivos, icon: UsersIcon, color: 'bg-purple-500' },
    { nombre: 'Encuestas', valor: estadisticas.totalEncuestas, icon: ClipboardDocumentListIcon, color: 'bg-orange-500' },
    { nombre: 'Pendientes', valor: estadisticas.reservasPendientes, icon: ChartBarIcon, color: 'bg-yellow-500' },
    { nombre: '⭐ Calificación', valor: estadisticas.calificacionPromedio?.toFixed(1) || '0.0', icon: StarIcon, color: 'bg-pink-500' },
    { nombre: '📱 Escaneos', valor: escaneos.total || 0, icon: QrCodeIcon, color: 'bg-indigo-500' },
    { nombre: '👥 Visitantes', valor: escaneos.unicos || 0, icon: UsersIcon, color: 'bg-teal-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header móvil con botón de menú */}
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-white z-30 flex items-center justify-between px-4 py-3 shadow-lg md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">
            🗺️
          </div>
          <span className="font-bold text-sm">Concepción Admin</span>
        </div>
        <button
          onClick={() => setMenuAbierto(true)}
          className="p-2 rounded-lg hover:bg-white/20 transition"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Menú lateral - versión móvil (slide-in) */}
      {menuAbierto && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMenuAbierto(false)}
          />
          
          {/* Menú deslizante */}
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-gray-900 text-white z-50 flex flex-col shadow-2xl md:hidden animate-slide-in">
            {/* Header del menú */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-lg">
                  🗺️
                </div>
                <span className="font-bold">Concepción Admin</span>
              </div>
              <button
                onClick={() => setMenuAbierto(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Opciones del menú */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavegacion(item.ruta)}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-800 active:bg-gray-700"
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm">{item.nombre}</span>
                  </button>
                );
              })}
            </nav>

            {/* Botón de cerrar sesión */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-600/20 text-red-400"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal con padding-top para el header móvil */}
      <div className="pt-16 md:pt-6 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Título (visible solo en desktop) */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Resumen general de la plataforma</p>
        </div>

        {/* Tarjetas de métricas - grid responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {metricCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-3">
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

        {/* Gráficos - stack en móvil, grid en desktop */}
        <div className="space-y-6">
          {/* Reservas por mes */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Reservas por mes
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={reservasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  tickFormatter={(value) => value ? new Date(value).toLocaleDateString('es', { month: 'short' }) : ''}
                  stroke="#9ca3af"
                  fontSize={10}
                />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F633" name="Reservas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Visitas por día */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
              Visitas diarias (últimos 7 días)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={visitasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dia" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip />
                <Bar dataKey="visitas" fill="#10B981" radius={[4, 4, 0, 0]} name="Visitas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lugares más visitados */}
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

          {/* Calificaciones por mes */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              Calificaciones promedio
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={calificacionesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  tickFormatter={(value) => value ? new Date(value).toLocaleDateString('es', { month: 'short' }) : ''}
                  fontSize={10}
                />
                <YAxis domain={[0, 5]} fontSize={10} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="promedio_guia" stroke="#EF4444" name="Guía" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="promedio_experiencia" stroke="#8B5CF6" name="Experiencia" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Origen de turistas y actividad reciente en grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-indigo-500" />
                Origen de turistas
              </h3>
              {origenTuristas.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={origenTuristas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="origen_turista"
                    >
                      {origenTuristas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
                  No hay datos disponibles
                </div>
              )}
            </div>

            {/* Actividad reciente */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
                  Actividad reciente
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {actividadReciente.slice(0, 5).map((actividad, idx) => (
                  <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        actividad.tipo === 'reserva' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {actividad.tipo === 'reserva' ? '📅 Reserva' : '📝 Encuesta'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(actividad.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{actividad.usuario || 'Anónimo'}</span>
                      {actividad.lugar && ` visitó ${actividad.lugar}`}
                    </p>
                  </div>
                ))}
                {actividadReciente.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animación CSS para el menú deslizante */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}