import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import MapaCoordenadas from '../../components/MapaCoordenadas';

export default function LugarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [usarMapa, setUsarMapa] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'cultural',
    latitud: '',
    longitud: '',
    direccion: '',
    imagen_url: '',
    horario: ''
  });

  // Fotos extra (hasta 4, además de la portada): { url } si ya estaba
  // guardada, o { archivo, preview } si es nueva
  const [extras, setExtras] = useState([]);
  const MAX_EXTRAS = 4;
  const extrasDropzone = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    onDrop: (aceptados, rechazados) => {
      if (rechazados.length) toast.error('Algunas fotos no se agregaron: deben ser imágenes de máximo 5MB');
      setExtras((prev) => {
        const libres = MAX_EXTRAS - prev.length;
        if (aceptados.length > libres) toast.error(`Solo caben ${MAX_EXTRAS} fotos extra (5 en total con la portada)`);
        return [...prev, ...aceptados.slice(0, Math.max(0, libres)).map((archivo) => ({ archivo, preview: URL.createObjectURL(archivo) }))];
      });
    },
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
        imagen_url: lugar.imagen_url || '',
        horario: lugar.horario || ''
      });
      if (lugar.imagen_url) setImagenPreview(lugar.imagen_url);
      setExtras((Array.isArray(lugar.imagenes_extra) ? lugar.imagenes_extra : []).map((url) => ({ url })));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el lugar');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoordenadasChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng
    }));
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
    formDataToSend.append('horario', formData.horario);

    if (archivoSeleccionado) {
      formDataToSend.append('imagen', archivoSeleccionado);
    }
    // Fotos extra: las ya guardadas que se conservan + las nuevas
    formDataToSend.append('imagenes_extra_actuales', JSON.stringify(extras.filter((e) => e.url).map((e) => e.url)));
    extras.filter((e) => e.archivo).forEach((e) => formDataToSend.append('imagenes', e.archivo));
    
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
      navigate('/admin/lugares');
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

          {/* COORDENADAS CON MAPA */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Ubicación</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUsarMapa(true)}
                  className={`text-xs px-2 py-1 rounded ${usarMapa ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  🗺️ Seleccionar en mapa
                </button>
                <button
                  type="button"
                  onClick={() => setUsarMapa(false)}
                  className={`text-xs px-2 py-1 rounded ${!usarMapa ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ✏️ Ingresar manual
                </button>
              </div>
            </div>
            
            {usarMapa ? (
              <MapaCoordenadas
                latitud={formData.latitud}
                longitud={formData.longitud}
                onCoordenadasChange={handleCoordenadasChange}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                <div>
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
              </div>
            )}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto de portada</label>
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

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Más fotos <span className="text-gray-400 font-normal">({extras.length}/{MAX_EXTRAS}, hasta 5 en total con la portada)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Se ven en la galería del lugar, en la app del turista.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {extras.map((foto, i) => (
                <div key={foto.url || foto.preview} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img src={foto.url || foto.preview} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" />
                  {foto.archivo && (
                    <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">Nueva</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setExtras((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Quitar foto"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {extras.length < MAX_EXTRAS && (
                <div
                  {...extrasDropzone.getRootProps()}
                  className={`aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors p-2
                    ${extrasDropzone.isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
                >
                  <input {...extrasDropzone.getInputProps()} />
                  <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-600 mt-1">Agregar fotos</span>
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario de atención
            </label>
            <input
                type="text"
                name="horario"
                value={formData.horario || ''}
                onChange={handleChange}
                placeholder="Ej: 9:00-17:00"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Formato: HH:MM-HH:MM (ej: 9:00-17:00)</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/lugares')}
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