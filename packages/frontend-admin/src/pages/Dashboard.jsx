// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import {
  MapPinIcon, CalendarIcon, UsersIcon, ClipboardDocumentListIcon,
  StarIcon, ChartBarIcon, ArrowTrendingUpIcon, QrCodeIcon,
  HomeIcon, FlagIcon, TrophyIcon, ShieldCheckIcon,
  Cog6ToothIcon, ArrowRightOnRectangleIcon, ChevronLeftIcon,
  ChevronRightIcon, BuildingLibraryIcon, PhotoIcon
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

// Componente de menú lateral mejorado
function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, color: 'text-blue-500' },
    { id: 'lugares', name: 'Lugares', icon: MapPinIcon, color: 'text-green-500' },
    { id: 'eventos', name: 'Eventos', icon: CalendarIcon, color: 'text-purple-500' },
    { id: 'reservas', name: 'Reservas', icon: ClipboardDocumentListIcon, color: 'text-orange-500' },
    { id: 'guias', name: 'Guías', icon: UsersIcon, color: 'text-indigo-500' },
    { id: 'insignias', name: 'Insignias', icon: TrophyIcon, color: 'text-yellow-500' },
    { id: 'galeria', name: 'Galería', icon: PhotoIcon, color: 'text-pink-500' },
    { id: 'ubicaciones', name: 'Ubicaciones', icon: BuildingLibraryIcon, color: 'text-teal-500' },
    { id: 'escaneos', name: 'Escaneos QR', icon: QrCodeIcon, color: 'text-cyan-500' },
    { id: 'configuracion', name: 'Configuración', icon: Cog6ToothIcon, color: 'text-gray-500' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('turista_token');
    navigate('/login');
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-20 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo y título */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-xl">
              🗺️
            </div>
            <span className="font-bold text-sm">Concepción Admin</span>
          </div>
        )}
        {collapsed && <div className="w-full text-center text-xl">🗺️</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-700 transition"
        >
          {collapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // No se colapsa automáticamente para no molestar, pero puedes descomentar la siguiente línea si quieres que se cierre:
                // setCollapsed(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-green-600 text-white border-l-4 border-green-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 ${item.color}`} />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Botón de cerrar sesión */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-600/20 text-red-400 hover:text-red-300 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    // Verificar autenticación
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

  // Tarjetas de métricas mejoradas
  const metricCards = [
    { name: 'Lugares', value: estadisticas.totalLugares, icon: MapPinIcon, color: 'bg-blue-500', suffix: '', description: 'Puntos turísticos' },
    { name: 'Reservas', value: estadisticas.totalReservas, icon: CalendarIcon, color: 'bg-green-500', suffix: '', description: 'Total agendadas' },
    { name: 'Guías Activos', value: estadisticas.guiasActivos, icon: UsersIcon, color: 'bg-purple-500', suffix: '', description: 'Disponibles' },
    { name: 'Encuestas', value: estadisticas.totalEncuestas, icon: ClipboardDocumentListIcon, color: 'bg-orange-500', suffix: '', description: 'Respondidas' },
    { name: 'Pendientes', value: estadisticas.reservasPendientes, icon: ChartBarIcon, color: 'bg-yellow-500', suffix: '', description: 'Por confirmar' },
    { name: 'Calificación', value: estadisticas.calificacionPromedio?.toFixed(1) || '0.0', icon: StarIcon, color: 'bg-pink-500', suffix: '★', description: 'Promedio general' },
    { name: 'Escaneos QR', value: escaneos.total || 0, icon: QrCodeIcon, color: 'bg-indigo-500', suffix: '', description: 'Total escaneos' },
    { name: 'Visitantes únicos', value: escaneos.unicos || 0, icon: UsersIcon, color: 'bg-teal-500', suffix: '', description: 'Turistas distintos' },
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
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Contenido principal */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          {/* Encabezado */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm">Resumen general de la plataforma</p>
          </div>

          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
            {metricCards.map((card, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-center justify-between">
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    <span className="text-sm text-yellow-500 ml-1">{card.suffix}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{card.name}</p>
                <p className="text-xs text-gray-400">{card.description}</p>
              </div>
            ))}
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Reservas por mes con Área */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Reservas por mes
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={reservasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="mes" 
                    tickFormatter={(value) => value ? new Date(value).toLocaleDateString('es', { month: 'short' }) : ''}
                    stroke="#9ca3af"
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    labelFormatter={(value) => value ? new Date(value).toLocaleDateString('es', { month: 'long', year: 'numeric' }) : ''}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F633" name="Reservas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Visitas por día */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                Visitas diarias (últimos 7 días)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={visitasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="visitas" fill="#10B981" radius={[4, 4, 0, 0]} name="Visitas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Segunda fila de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Lugares más visitados */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-green-500" />
                Lugares más visitados
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={lugaresTop} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="nombre" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visitas" fill="#10B981" name="Visitas" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Calificaciones por mes */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                Calificaciones promedio
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={calificacionesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="mes" 
                    tickFormatter={(value) => value ? new Date(value).toLocaleDateString('es', { month: 'short' }) : ''}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="promedio_guia" stroke="#EF4444" name="Calificación Guía" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="promedio_experiencia" stroke="#8B5CF6" name="Calificación Experiencia" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Origen de turistas y actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-indigo-500" />
                Origen de turistas
              </h3>
              {origenTuristas.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={origenTuristas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={90}
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
                <div className="flex items-center justify-center h-[280px] text-gray-400">
                  No hay datos disponibles
                </div>
              )}
            </div>

            {/* Actividad reciente */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
                  Actividad reciente
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {actividadReciente.slice(0, 5).map((actividad, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3 whitespace-nowrap text-sm">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            actividad.tipo === 'reserva' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {actividad.tipo === 'reserva' ? '📅 Reserva' : '📝 Encuesta'}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                          {actividad.usuario || 'Anónimo'}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                          {actividad.lugar || '—'}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-400">
                          {new Date(actividad.fecha).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {actividadReciente.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                          No hay actividad reciente
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}