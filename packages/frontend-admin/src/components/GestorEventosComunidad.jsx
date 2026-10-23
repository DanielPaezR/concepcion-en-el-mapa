// components/GestorEventosComunidad.jsx
// Lista y formulario de eventos del pueblo. Se usa en el panel del admin,
// en el del guía (si tiene permiso) y en el del comercio. El backend decide
// qué puede hacer cada uno: el comercio publica siempre en la ubicación de su
// negocio (ubicacion_fija) y los demás eligen el punto en el mapa.
import { useState, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, CalendarDaysIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import MapaCoordenadas from './MapaCoordenadas';

const FORM_VACIO = {
  titulo: '', descripcion: '', lugar_texto: '', fecha_inicio: '', fecha_fin: '',
  latitud: '', longitud: '', activo: true, imagen: null, imagen_url: null, quitar_imagen: false,
};

const formatearFecha = (texto) => {
  if (!texto) return '';
  return new Date(texto).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

// Estado según fechas en hora local ("2026-10-23T15:00" se interpreta como local)
const estadoEvento = (evento) => {
  if (!evento.activo) return { texto: 'Oculto', clase: 'bg-gray-100 text-gray-600' };
  const ahora = new Date();
  const inicio = new Date(evento.fecha_inicio);
  const fin = evento.fecha_fin ? new Date(evento.fecha_fin) : new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 1);
  if (fin < ahora) return { texto: 'Finalizado', clase: 'bg-gray-100 text-gray-500' };
  if (inicio <= ahora) return { texto: 'En curso', clase: 'bg-green-100 text-green-700' };
  return { texto: 'Próximo', clase: 'bg-blue-100 text-blue-700' };
};

export default function GestorEventosComunidad({ titulo = 'Eventos del pueblo', mostrarCreador = false }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [puedeCrear, setPuedeCrear] = useState(false);
  const [motivo, setMotivo] = useState(null);
  const [ubicacionFija, setUbicacionFija] = useState(null);
  const [modal, setModal] = useState(null); // null | 'nuevo' | evento
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get('/eventos-comunidad/gestion');
      setEventos(data.eventos || []);
      setPuedeCrear(data.puede_crear);
      setMotivo(data.motivo);
      setUbicacionFija(data.ubicacion_fija);
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudieron cargar los eventos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(FORM_VACIO); setModal('nuevo'); };

  const abrirEditar = (evento) => {
    setForm({
      ...FORM_VACIO,
      titulo: evento.titulo || '',
      descripcion: evento.descripcion || '',
      lugar_texto: evento.lugar_texto || '',
      fecha_inicio: evento.fecha_inicio || '',
      fecha_fin: evento.fecha_fin || '',
      latitud: evento.latitud || '',
      longitud: evento.longitud || '',
      activo: evento.activo,
      imagen_url: evento.imagen_url,
    });
    setModal(evento);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!ubicacionFija && (!form.latitud || !form.longitud)) {
      toast.error('Toca el mapa para elegir dónde es el evento');
      return;
    }
    setGuardando(true);
    try {
      const datos = new FormData();
      ['titulo', 'descripcion', 'lugar_texto', 'fecha_inicio', 'fecha_fin', 'latitud', 'longitud'].forEach((campo) => datos.append(campo, form[campo] ?? ''));
      datos.append('activo', form.activo ? 'true' : 'false');
      if (form.imagen) datos.append('imagen', form.imagen);
      if (form.quitar_imagen) datos.append('quitar_imagen', 'true');

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (modal === 'nuevo') await api.post('/eventos-comunidad', datos, config);
      else await api.put(`/eventos-comunidad/${modal.id}`, datos, config);

      toast.success(modal === 'nuevo' ? 'Evento publicado en el mapa' : 'Evento actualizado');
      setModal(null);
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar el evento');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (evento) => {
    if (!window.confirm(`¿Eliminar el evento "${evento.titulo}"?`)) return;
    try {
      await api.delete(`/eventos-comunidad/${evento.id}`);
      toast.success('Evento eliminado');
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar');
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
          <p className="text-sm text-gray-500">Aparecen en el mapa de los turistas hasta que terminan.</p>
        </div>
        {puedeCrear && (
          <button onClick={abrirNuevo} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shrink-0">
            <PlusIcon className="w-4 h-4" /> Nuevo evento
          </button>
        )}
      </div>

      {!puedeCrear && motivo && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 mb-4">{motivo}</div>
      )}

      {eventos.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 py-10">
          <CalendarDaysIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          Todavía no hay eventos.
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((evento) => {
            const estado = estadoEvento(evento);
            return (
              <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
                {evento.imagen_url ? (
                  <img src={evento.imagen_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center text-2xl shrink-0">🎉</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 truncate">{evento.titulo}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${estado.clase}`}>{estado.texto}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    📅 {formatearFecha(evento.fecha_inicio)}{evento.fecha_fin ? ` – ${formatearFecha(evento.fecha_fin)}` : ''}
                  </p>
                  {evento.lugar_texto && <p className="text-sm text-gray-500 truncate">📍 {evento.lugar_texto}</p>}
                  {mostrarCreador && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Por {evento.comercio_nombre || evento.creador_nombre} ({evento.comercio_nombre ? 'comercio' : evento.creador_rol})
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => abrirEditar(evento)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Editar">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => eliminar(evento)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={guardar} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{modal === 'nuevo' ? 'Nuevo evento' : 'Editar evento'}</h3>
              <button type="button" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} maxLength={150} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ej: Festival de la Trucha" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="¿De qué se trata? ¿Tiene costo?" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio *</label>
                <input type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin (opcional)</label>
                <input type="datetime-local" value={form.fecha_fin} min={form.fecha_inicio || undefined} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lugar (texto)</label>
              <input value={form.lugar_texto} onChange={(e) => setForm({ ...form, lugar_texto: e.target.value })} maxLength={255}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder={ubicacionFija ? ubicacionFija.nombre : 'Ej: Parque principal'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación en el mapa *</label>
              {ubicacionFija ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <MapPinIcon className="w-5 h-5 shrink-0" />
                  Se publica en la ubicación de tu negocio ({ubicacionFija.nombre}).
                </div>
              ) : (
                <MapaCoordenadas latitud={form.latitud} longitud={form.longitud} altura={260}
                  onCoordenadasChange={(lat, lng) => setForm((f) => ({ ...f, latitud: lat, longitud: lng }))} />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
              {form.imagen_url && !form.quitar_imagen && !form.imagen && (
                <div className="flex items-center gap-3 mb-2">
                  <img src={form.imagen_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, quitar_imagen: true })} className="text-sm text-red-600 hover:underline">Quitar imagen</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imagen: e.target.files?.[0] || null })}
                className="w-full text-sm text-gray-600" />
            </div>

            {modal !== 'nuevo' && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Visible en el mapa
              </label>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-700">Cancelar</button>
              <button type="submit" disabled={guardando} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60">
                {guardando ? 'Guardando...' : modal === 'nuevo' ? 'Publicar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
