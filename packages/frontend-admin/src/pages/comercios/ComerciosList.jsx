// pages/comercios/ComerciosList.jsx
import { useState, useEffect } from 'react';
import {
  PlusIcon, PencilIcon, XMarkIcon, MagnifyingGlassIcon, StarIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { valor: 'tienda', etiqueta: 'Tienda' },
  { valor: 'restaurante', etiqueta: 'Restaurante' },
  { valor: 'cafe', etiqueta: 'Café' },
  { valor: 'artesanias', etiqueta: 'Artesanías' },
  { valor: 'hospedaje', etiqueta: 'Hospedaje' },
  { valor: 'otro', etiqueta: 'Otro' },
];

const FORM_VACIO = {
  email: '', password: '', nombre_dueno: '',
  nombre: '', categoria: 'tienda', descripcion: '', beneficio: '',
  direccion: '', latitud: '', longitud: '',
};

export default function ComerciosList() {
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarComercios();
  }, []);

  const cargarComercios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/comercios/admin/todos');
      setComercios(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar comercios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (comercio = null) => {
    if (comercio) {
      setEditando(comercio);
      setFormData({
        ...FORM_VACIO,
        nombre: comercio.nombre || '',
        categoria: comercio.categoria || 'tienda',
        descripcion: comercio.descripcion || '',
        beneficio: comercio.beneficio || '',
        direccion: comercio.direccion || '',
        latitud: comercio.latitud ?? '',
        longitud: comercio.longitud ?? '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editando) {
        await api.put(`/comercios/admin/${editando.id}`, {
          nombre: formData.nombre,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          beneficio: formData.beneficio,
          direccion: formData.direccion,
          latitud: formData.latitud || null,
          longitud: formData.longitud || null,
        });
        toast.success('Comercio actualizado');
      } else {
        if (!formData.email || !formData.password) {
          toast.error('Email y contraseña son requeridos');
          setSubmitting(false);
          return;
        }
        await api.post('/comercios/admin', {
          email: formData.email,
          password: formData.password,
          nombre_dueno: formData.nombre_dueno,
          nombre: formData.nombre,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          beneficio: formData.beneficio,
          direccion: formData.direccion,
          latitud: formData.latitud || null,
          longitud: formData.longitud || null,
        });
        toast.success('Comercio creado');
      }
      cargarComercios();
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al guardar comercio');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActivo = async (comercio) => {
    try {
      await api.put(`/comercios/admin/${comercio.id}`, { activo: !comercio.activo });
      toast.success(`Comercio ${!comercio.activo ? 'activado' : 'desactivado'}`);
      cargarComercios();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const comerciosFiltrados = comercios.filter((c) =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dueno_email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Comercios Aliados</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona los negocios asociados y sus cuentas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-medium">Nuevo Comercio</span>
        </button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email del dueño..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="block lg:hidden space-y-3">
        {comerciosFiltrados.map((c) => (
          <div key={c.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{c.nombre}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 capitalize">{c.categoria}</p>
                <p className="text-sm text-gray-500">{c.dueno_email}</p>
                {Number(c.total_resenas) > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <StarIcon className="w-4 h-4 text-yellow-500" /> {c.calificacion_promedio} ({c.total_resenas})
                  </div>
                )}
              </div>
              <button onClick={() => handleOpenModal(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                <PencilIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => toggleActivo(c)}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition ${c.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
              >
                {c.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dueño</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comerciosFiltrados.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{c.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.dueno_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Number(c.total_resenas) > 0 ? (
                    <div className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-500" /> {c.calificacion_promedio} ({c.total_resenas})</div>
                  ) : <span className="text-gray-400">Sin reseñas</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${c.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(c)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleActivo(c)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition ${c.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {c.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comerciosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">{searchTerm ? 'No se encontraron comercios con esa búsqueda' : 'No hay comercios registrados'}</p>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[75vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{editando ? 'Editar Comercio' : 'Nuevo Comercio'}</h3>
                    <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {!editando && (
                      <>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                          Esto crea la cuenta de acceso del dueño (para su panel de validar códigos) Y el perfil del negocio, en un solo paso.
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email de acceso *</label>
                          <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                          <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del dueño</label>
                          <input value={formData.nombre_dueno} onChange={(e) => setFormData({ ...formData, nombre_dueno: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <hr className="border-gray-100" />
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio *</label>
                      <input required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea rows={2} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beneficio para turistas *</label>
                      <input required placeholder="Ej: 10% de descuento" value={formData.beneficio} onChange={(e) => setFormData({ ...formData, beneficio: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <input value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                        <input type="number" step="any" value={formData.latitud} onChange={(e) => setFormData({ ...formData, latitud: e.target.value })} placeholder="6.3953494" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                        <input type="number" step="any" value={formData.longitud} onChange={(e) => setFormData({ ...formData, longitud: e.target.value })} placeholder="-75.2592802" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Tip: abre Google Maps, mantén tocado el punto exacto, y copia las coordenadas que aparecen.</p>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (editando ? 'Actualizar' : 'Crear Comercio')}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="mt-3 sm:mt-0 inline-flex justify-center w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
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
