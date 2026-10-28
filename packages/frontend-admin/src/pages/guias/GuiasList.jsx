// pages/guias/GuiasList.jsx
// Usuarios: guías turísticos y cuentas del equipo de la alcaldía (alcalde,
// funcionarios). A cada uno se le da o quita acceso a cada sección.
//   - Guía turístico (rol guia): entra a su panel de guía con recorridos y
//     las secciones que se le marquen.
//   - Equipo (rol admin): entra al panel de administración y solo ve las
//     secciones marcadas. Solo el superadmin las ve, crea y edita.
import { useState, useEffect } from 'react';
import {
  PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, UserPlusIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

// Secciones a las que se puede dar acceso a un guía (en su panel de guía)
const ACCESOS_GUIA = [
  { clave: 'retos', emoji: '🎮', titulo: 'Retos', desc: 'Crear y editar retos, quizzes y "¿verdad o mito?"' },
  { clave: 'eventos_pueblo', emoji: '🎉', titulo: 'Eventos del pueblo', desc: 'Publicar eventos en el mapa' },
  { clave: 'curiosidades', emoji: '💡', titulo: 'Curiosidades', desc: 'Crear y editar las curiosidades del mapa' },
];

// Secciones del panel de administración para una cuenta del equipo
const ACCESOS_EQUIPO = [
  { clave: 'metricas', emoji: '📊', titulo: 'Dashboard y métricas', desc: 'Visitas, uso de la app y estadísticas' },
  { clave: 'lugares', emoji: '📍', titulo: 'Lugares', desc: 'Crear y editar los lugares del mapa y sus fotos' },
  { clave: 'comercios', emoji: '🏪', titulo: 'Comercios', desc: 'Comercios aliados y sus beneficios' },
  { clave: 'eventos_pueblo', emoji: '🎉', titulo: 'Eventos del pueblo', desc: 'Publicar eventos en el mapa' },
  { clave: 'curiosidades', emoji: '💡', titulo: 'Curiosidades', desc: 'Crear y editar las curiosidades del mapa' },
  { clave: 'retos', emoji: '🎮', titulo: 'Retos', desc: 'Retos, quizzes y "¿verdad o mito?"' },
  { clave: 'reservas', emoji: '📅', titulo: 'Reservas', desc: 'Reservas de recorridos con guías' },
  { clave: 'encuestas', emoji: '📝', titulo: 'Encuestas', desc: 'Resultados de las encuestas de los turistas' },
  { clave: 'guias', emoji: '👥', titulo: 'Usuarios (guías)', desc: 'Crear y editar guías. Las cuentas del equipo solo las gestionas tú' },
];

const accesosDe = (tipo) => (tipo === 'admin' ? ACCESOS_EQUIPO : ACCESOS_GUIA);
const sinPermisos = (tipo) => Object.fromEntries(accesosDe(tipo).map((a) => [a.clave, false]));

const FORM_VACIO = {
  tipo: 'guia',
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  permisos: sinPermisos('guia'),
  mostrar_avatar_publico: false
};

// Etiquetas con las secciones a las que tiene acceso
function Accesos({ usuario }) {
  const activos = accesosDe(usuario.rol).filter((a) => usuario.permisos?.[a.clave]);
  if (activos.length === 0) return <span className="text-xs text-gray-400">Sin acceso a secciones</span>;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {activos.map((a) => (
        <span key={a.clave} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-medium">
          {a.emoji} {a.titulo}
        </span>
      ))}
    </div>
  );
}

const TipoBadge = ({ rol }) => (rol === 'admin'
  ? <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700">🏛️ Equipo</span>
  : <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">🧭 Guía</span>);

export default function GuiasList() {
  const { user } = useAuth();
  const esSuperadmin = user?.rol === 'superadmin';
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      // Las cuentas del equipo solo las ve el superadmin
      const [guias, equipo] = await Promise.all([
        api.get('/usuarios?rol=guia'),
        esSuperadmin ? api.get('/usuarios?rol=admin') : Promise.resolve({ data: [] }),
      ]);
      setUsuarios([...(equipo.data || []), ...(guias.data || [])]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (usuario = null) => {
    if (usuario) {
      setEditando(usuario);
      setFormData({
        tipo: usuario.rol,
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        password: '',
        permisos: Object.fromEntries(accesosDe(usuario.rol).map((a) => [a.clave, !!usuario.permisos?.[a.clave]])),
        mostrar_avatar_publico: !!usuario.mostrar_avatar_publico
      });
    } else {
      setEditando(null);
      setFormData(FORM_VACIO);
    }
    setModalAbierto(true);
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setFormData(FORM_VACIO);
  };

  const cambiarTipo = (tipo) => setFormData({ ...formData, tipo, permisos: sinPermisos(tipo) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          disponible: editando.disponible,
          permisos: formData.permisos,
          mostrar_avatar_publico: !!formData.mostrar_avatar_publico
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        if (!formData.password) {
          toast.error('La contraseña es requerida');
          setSubmitting(false);
          return;
        }
        await api.post('/usuarios', {
          rol: formData.tipo,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
          permisos: formData.permisos,
          mostrar_avatar_publico: formData.tipo === 'guia' && !!formData.mostrar_avatar_publico
        });
        toast.success('Usuario creado correctamente');
      }
      cargarUsuarios();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const cambiarDisponibilidad = async (id, disponible) => {
    try {
      await api.patch(`/usuarios/${id}/disponibilidad`, { disponible: !disponible });
      toast.success(`Guía ${!disponible ? 'activado' : 'desactivado'}`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar disponibilidad');
    }
  };

  const eliminarUsuario = async (usuario) => {
    if (!confirm(`¿Eliminar a "${usuario.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await api.delete(`/usuarios/${usuario.id}`);
      toast.success('Usuario eliminado correctamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const filtrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const esGuia = (u) => u.rol === 'guia';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            {esSuperadmin
              ? 'Guías turísticos y equipo de la alcaldía: crea cuentas y decide a qué secciones tiene acceso cada uno'
              : 'Guías turísticos: crea cuentas y decide a qué secciones tiene acceso cada uno'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span className="font-medium">Nuevo usuario</span>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Lista - Vista móvil (cards) */}
      <div className="block lg:hidden space-y-3">
        {filtrados.map((u) => (
          <div key={u.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{u.nombre}</h3>
                  <TipoBadge rol={u.rol} />
                  {esGuia(u) && (
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="text-sm text-gray-500">{u.telefono || 'Sin teléfono'}</p>
                <Accesos usuario={u} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(u)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => eliminarUsuario(u)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            {esGuia(u) && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => cambiarDisponibilidad(u.id, u.disponible)}
                  className={`text-sm font-medium px-3 py-1 rounded-lg transition ${
                    u.disponible ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {u.disponible ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabla - Vista desktop */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtrados.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {u.nombre}
                  <div className="text-xs text-gray-400 font-normal">{u.telefono || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><TipoBadge rol={u.rol} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 text-sm"><Accesos usuario={u} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {esGuia(u) ? (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      u.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(u)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => eliminarUsuario(u)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {esGuia(u) && (
                      <button
                        onClick={() => cambiarDisponibilidad(u.id, u.disponible)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                          u.disponible ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.disponible ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje sin resultados */}
      {filtrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron usuarios con esa búsqueda' : 'No hay usuarios registrados'}
          </p>
        </div>
      )}

      {/* Modal de creación/edición */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editando ? 'Editar usuario' : 'Nuevo usuario'}
                    </h3>
                    <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Tipo de cuenta: solo el superadmin puede crear cuentas del equipo */}
                    {esSuperadmin && !editando && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ['guia', '🧭 Guía turístico', 'Hace recorridos; entra a su panel de guía'],
                            ['admin', '🏛️ Equipo / alcaldía', 'Alcalde, funcionarios: entra al panel de administración'],
                          ].map(([tipo, titulo, desc]) => (
                            <button key={tipo} type="button" onClick={() => cambiarTipo(tipo)}
                              className={`text-left rounded-lg border-2 p-2.5 transition ${formData.tipo === tipo ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="text-sm font-semibold text-gray-800">{titulo}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {editando && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">Tipo de cuenta: <TipoBadge rol={editando.rol} /></div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Acceso a secciones</span>
                        {formData.tipo === 'admin' && (
                          <button type="button" className="text-xs text-green-700 hover:underline"
                            onClick={() => {
                              const todos = Object.values(formData.permisos).every(Boolean);
                              setFormData({ ...formData, permisos: Object.fromEntries(Object.keys(formData.permisos).map((k) => [k, !todos])) });
                            }}>
                            {Object.values(formData.permisos).every(Boolean) ? 'Quitar todos' : 'Marcar todos'}
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {accesosDe(formData.tipo).map((acceso) => (
                          <label key={acceso.clave} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!formData.permisos[acceso.clave]}
                              onChange={(e) => setFormData({ ...formData, permisos: { ...formData.permisos, [acceso.clave]: e.target.checked } })}
                              className="h-4 w-4 mt-0.5 rounded border-gray-300"
                            />
                            <div className="text-sm">
                              <div className="font-medium">{acceso.emoji} {acceso.titulo}</div>
                              <div className="text-xs text-gray-500">{acceso.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {formData.tipo === 'admin'
                          ? 'Al entrar al panel de administración solo verá las secciones marcadas.'
                          : 'Las secciones marcadas le aparecen en su panel de guía al iniciar sesión.'}
                      </p>
                    </div>

                    {formData.tipo === 'guia' && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!formData.mostrar_avatar_publico}
                          onChange={(e) => setFormData({ ...formData, mostrar_avatar_publico: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <div className="text-sm">
                          <div className="font-medium">Avatar visible públicamente</div>
                          <div className="text-xs text-gray-500">Si está activado, su avatar puede mostrarse en el mapa público</div>
                        </div>
                      </label>
                    )}

                    {!editando && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Contraseña inicial; la persona puede cambiarla después</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      editando ? 'Actualizar' : 'Crear usuario'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 sm:mt-0 inline-flex justify-center w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
