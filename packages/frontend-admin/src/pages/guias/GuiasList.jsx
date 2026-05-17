// pages/guias/GuiasList.jsx
import { useState, useEffect } from 'react';
import { 
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon,
  CheckIcon, MagnifyingGlassIcon, UserPlusIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function GuiasList() {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarGuias();
  }, []);

  const cargarGuias = async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios?rol=guia');
      setGuias(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar guías');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (guia = null) => {
    if (guia) {
      setEditando(guia);
      setFormData({
        nombre: guia.nombre || '',
        email: guia.email || '',
        telefono: guia.telefono || '',
        password: ''
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        password: ''
      });
    }
    setModalAbierto(true);
  };

  const handleCloseModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editando) {
        // Actualizar guía
        await api.put(`/usuarios/${editando.id}`, {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          disponible: editando.disponible
        });
        toast.success('Guía actualizado correctamente');
      } else {
        // Crear nuevo guía
        if (!formData.password) {
          toast.error('La contraseña es requerida');
          setSubmitting(false);
          return;
        }
        await api.post('/usuarios', {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password
        });
        toast.success('Guía creado correctamente');
      }
      cargarGuias();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al guardar guía');
    } finally {
      setSubmitting(false);
    }
  };

  const cambiarDisponibilidad = async (id, disponible) => {
    try {
      await api.patch(`/usuarios/${id}/disponibilidad`, { disponible: !disponible });
      toast.success(`Guía ${!disponible ? 'activado' : 'desactivado'}`);
      cargarGuias();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar disponibilidad');
    }
  };

  const eliminarGuia = async (guia) => {
    if (!confirm(`¿Eliminar al guía "${guia.nombre}"? Esta acción no se puede deshacer.`)) return;
    
    try {
      await api.delete(`/usuarios/${guia.id}`);
      toast.success('Guía eliminado correctamente');
      cargarGuias();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar guía');
    }
  };

  const guiasFiltrados = guias.filter(guia =>
    guia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guia.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-semibold text-gray-900">Guías Turísticos</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los guías y su disponibilidad</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span className="font-medium">Nuevo Guía</span>
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

      {/* Lista de guías - Vista móvil (cards) */}
      <div className="block lg:hidden space-y-3">
        {guiasFiltrados.map((guia) => (
          <div key={guia.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{guia.nombre}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    guia.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {guia.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{guia.email}</p>
                <p className="text-sm text-gray-500">{guia.telefono || 'Sin teléfono'}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-600">
                    {guia.calificacion_promedio ? parseFloat(guia.calificacion_promedio).toFixed(1) : 'Sin calificar'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(guia)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => eliminarGuia(guia)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => cambiarDisponibilidad(guia.id, guia.disponible)}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition ${
                  guia.disponible 
                    ? 'text-red-600 hover:bg-red-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {guia.disponible ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla - Vista desktop */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guiasFiltrados.map((guia) => (
              <tr key={guia.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guia.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guia.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guia.telefono || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {guia.calificacion_promedio ? (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {parseFloat(guia.calificacion_promedio).toFixed(1)}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin calificar</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    guia.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {guia.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(guia)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => eliminarGuia(guia)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => cambiarDisponibilidad(guia.id, guia.disponible)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                        guia.disponible 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {guia.disponible ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje sin resultados */}
      {guiasFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron guías con esa búsqueda' : 'No hay guías registrados'}
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
                      {editando ? 'Editar Guía' : 'Nuevo Guía'}
                    </h3>
                    <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
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
                        <p className="text-xs text-gray-500 mt-1">Contraseña por defecto para el nuevo guía</p>
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
                      editando ? 'Actualizar' : 'Crear Guía'
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