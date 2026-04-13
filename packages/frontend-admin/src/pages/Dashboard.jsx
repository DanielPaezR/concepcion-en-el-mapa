// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import {
  MapPinIcon, CalendarIcon, UsersIcon, ClipboardDocumentListIcon,
  StarIcon, ChartBarIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    cargarDatos();
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
      ] = await Promise.all([
        api.get('/metricas/estadisticas'),
        api.get('/metricas/reservas-por-mes'),
        api.get('/metricas/lugares-top'),
        api.get('/metricas/origen-turistas'),
        api.get('/metricas/calificaciones-por-mes'),
        api.get('/metricas/actividad-reciente')
      ]);

      setEstadisticas(estadisticasRes.data.data);
      setReservasPorMes(reservasMesRes.data.data || []);
      setLugaresTop(lugaresTopRes.data.data || []);
      setOrigenTuristas(origenRes.data.data || []);
      setCalificacionesPorMes(calificacionesRes.data.data || []);
      setActividadReciente(actividadRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Tarjetas de métricas
  const metricCards = [
    { name: 'Lugares', value: estadisticas.totalLugares, icon: MapPinIcon, color: 'bg-blue-500' },
    { name: 'Reservas', value: estadisticas.totalReservas, icon: CalendarIcon, color: 'bg-green-500' },
    { name: 'Guías Activos', value: estadisticas.guiasActivos, icon: UsersIcon, color: 'bg-purple-500' },
    { name: 'Encuestas', value: estadisticas.totalEncuestas, icon: ClipboardDocumentListIcon, color: 'bg-orange-500' },
    { name: 'Pendientes', value: estadisticas.reservasPendientes, icon: ChartBarIcon, color: 'bg-yellow-500' },
    { name: 'Calificación', value: estadisticas.calificacionPromedio.toFixed(1), icon: StarIcon, color: 'bg-pink-500', suffix: '★' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">Resumen de actividad y métricas de la plataforma</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {metricCards.map((card) => (
          <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value} {card.suffix || ''}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reservas por mes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Reservas por mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reservasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickFormatter={(value) => new Date(value).toLocaleDateString('es', { month: 'short' })} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Reservas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lugares más visitados */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 Lugares más visitados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lugaresTop} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="nombre" width={100} />
              <Tooltip />
              <Bar dataKey="visitas" fill="#10B981" name="Visitas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Origen de turistas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🌍 Origen de turistas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={origenTuristas}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
        </div>

        {/* Calificaciones por mes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⭐ Calificaciones promedio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calificacionesPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickFormatter={(value) => new Date(value).toLocaleDateString('es', { month: 'short' })} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="promedio_guia" stroke="#EF4444" name="Guía" />
              <Line type="monotone" dataKey="promedio_experiencia" stroke="#8B5CF6" name="Experiencia" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">🕐 Actividad reciente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {actividadReciente.map((actividad, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      actividad.tipo === 'reserva' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {actividad.tipo === 'reserva' ? '📅 Reserva' : '📝 Encuesta'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {actividad.usuario || 'Anónimo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {actividad.lugar}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(actividad.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      actividad.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                      actividad.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      actividad.estado === 'completada' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {actividad.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {actividadReciente.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay actividad reciente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}