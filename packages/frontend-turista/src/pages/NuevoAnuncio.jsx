// pages/NuevoAnuncio.jsx
// Solicitud de anuncio: queda pendiente hasta que el administrador la apruebe.
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Megaphone, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import { useVolver } from '../utils/navegacion';
import { TIPOS_ANUNCIO } from './Anuncios';

export default function NuevoAnuncio() {
  const navigate = useNavigate();
  const volver = useVolver('/anuncios');
  const usuario = getTuristaActual();
  const [form, setForm] = useState({ tipo: 'venta', titulo: '', descripcion: '', precio: '', telefono: '' });
  const [tieneTelefono, setTieneTelefono] = useState(true);
  const [imagen, setImagen] = useState(null);
  const [vista, setVista] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // El WhatsApp sale del perfil; si no hay, se pide aquí
    api.get('/anuncios/mios').then(({ data }) => {
      setTieneTelefono(!!data.telefono);
      setForm((f) => ({ ...f, telefono: data.telefono || '' }));
    }).catch(() => setTieneTelefono(false));
  }, []);

  useEffect(() => () => vista && URL.revokeObjectURL(vista), [vista]);

  if (!usuario || usuario.anonimo) return <Navigate to="/login-turista?volver=/anuncios/nuevo" replace />;

  const elegirImagen = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) { toast.error('La foto debe pesar menos de 5 MB'); return; }
    setImagen(archivo);
    setVista(URL.createObjectURL(archivo));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const datos = new FormData();
      datos.append('tipo', form.tipo);
      datos.append('titulo', form.titulo.trim());
      datos.append('descripcion', form.descripcion.trim());
      if (form.precio) datos.append('precio', form.precio);
      if (form.telefono) datos.append('telefono', form.telefono);
      if (imagen) datos.append('imagen', imagen);
      await api.post('/anuncios', datos);
      toast.success('¡Solicitud enviada! Te avisaremos cuando la aprueben.');
      navigate('/mis-anuncios');
    } catch (error) {
      if (error.response?.data?.codigo === 'SIN_TELEFONO') setTieneTelefono(false);
      toast.error(error.response?.data?.error || 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  const etiquetaPrecio = form.tipo === 'compra' ? 'Presupuesto (opcional)' : form.tipo === 'servicio' ? 'Precio (opcional)' : 'Precio';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
        <button onClick={volver} className="text-white mb-4">← Volver</button>
        <div className="flex items-center gap-3">
          <Megaphone className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">Publicar anuncio</h1>
            <p className="text-green-100 text-sm">Lo revisamos antes de publicarlo en el tablero</p>
          </div>
        </div>
      </div>

      <form onSubmit={enviar} className="p-4 max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-xl p-4 space-y-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">¿Qué quieres publicar?</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TIPOS_ANUNCIO).map(([k, t]) => (
                <button type="button" key={k} onClick={() => setForm({ ...form, tipo: k })}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold ${form.tipo === k ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                  <span className="block text-xl">{t.emoji}</span>{k === 'servicio' ? 'Ofrezco un servicio' : k === 'venta' ? 'Vendo algo' : 'Busco / compro'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} maxLength={120} required minLength={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={form.tipo === 'servicio' ? 'Ej: Clases de guitarra' : form.tipo === 'venta' ? 'Ej: Bicicleta todoterreno' : 'Ej: Compro café pergamino'} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} maxLength={1000} required minLength={10} rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Cuenta los detalles: estado, horarios, dónde se entrega..." />
            <p className="text-xs text-gray-400 text-right">{form.descripcion.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{etiquetaPrecio}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input inputMode="numeric" value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value.replace(/\D/g, '') ? Number(e.target.value.replace(/\D/g, '')).toLocaleString('es-CO') : '' })}
                required={form.tipo === 'venta'}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0" />
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</p>
            {vista ? (
              <div className="relative">
                <img src={vista} alt="Vista previa" className="w-full h-52 object-cover rounded-lg" />
                <button type="button" onClick={() => { setImagen(null); setVista(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1" aria-label="Quitar foto"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg py-6 text-gray-500 cursor-pointer hover:bg-gray-50">
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm">Agregar una foto</span>
                <input type="file" accept="image/*" onChange={elegirImagen} className="hidden" />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu WhatsApp {tieneTelefono ? '' : '*'}</label>
            <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required={!tieneTelefono}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="300 123 4567" />
            <p className="text-xs text-gray-400 mt-1">Quien vea tu anuncio te escribirá a este número. Se guarda en tu perfil.</p>
          </div>
        </div>

        <button type="submit" disabled={enviando}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {enviando ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
}
