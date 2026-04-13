// pages/lugares/LugarForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function LugarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'cultural',
    latitud: '',
    longitud: '',
    direccion: '',
    imagen_url: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setArchivoSeleccionado(file);
        setImagenPreview(URL.createObjectURL(file));
      }
    }
  });

  useEffect(() => {
    if (id) {
      cargarLugar();
    }
  }, [id]);

  const cargarLugar = async () => {
    try {
      const response = await api.get(`/lugares/${id}`);
      let lugar = response.data;
      if (lugar.success && lugar.data) lugar = lugar.data;
      setFormData({
        nombre: lugar.nombre || '',
        descripcion: lugar.descripcion || '',
        tipo: lugar.tipo || 'cultural',
        latitud: lugar.latitud || '',
        longitud: lugar.longitud || '',
        direccion: lugar.direccion || '',
        imagen_url: lugar.imagen_url || ''
      });
      if (lugar.imagen_url) setImagenPreview(lugar.imagen_url);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el lugar');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('descripcion', formData.descripcion);
    formDataToSend.append('tipo', formData.tipo);
    formDataToSend.append('latitud', formData.latitud);
    formDataToSend.append('longitud', formData.longitud);
    formDataToSend.append('direccion', formData.direccion);
    formDataToSend.append('imagen_url_actual', formData.imagen_url);
    
    if (archivoSeleccionado) {
      formDataToSend.append('imagen', archivoSeleccionado);
    }
    
    try {
      if (id) {
        await api.put(`/lugares/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Lugar actualizado');
      } else {
        await api.post('/lugares', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Lugar creado');
      }
      navigate('/lugares');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {id ? 'Editar Lugar' : 'Nuevo Lugar'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {id ? 'Modifica la información del lugar' : 'Agrega un nuevo punto de interés'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tipo *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="historico">Histórico</option>
              <option value="natural">Natural</option>
              <option value="cultural">Cultural</option>
              <option value="gastronomico">Gastronómico</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Latitud *</label>
            <input
              type="number"
              step="any"
              name="latitud"
              value={formData.latitud}
              onChange={handleChange}
              required
              placeholder="Ej: 6.3944"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Longitud *</label>
            <input
              type="number"
              step="any"
              name="longitud"
              value={formData.longitud}
              onChange={handleChange}
              required
              placeholder="Ej: -75.2581"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          {/* Zona de subida de imágenes */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del lugar</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
            >
              <input {...getInputProps()} />
              {imagenPreview ? (
                <div className="relative">
                  <img src={imagenPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setArchivoSeleccionado(null);
                      setImagenPreview(null);
                      setFormData({ ...formData, imagen_url: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Arrastra o haz clic para subir una imagen
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF, WEBP (máx 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/lugares')}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}