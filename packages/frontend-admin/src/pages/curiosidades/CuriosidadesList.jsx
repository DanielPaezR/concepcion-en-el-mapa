// pages/curiosidades/CuriosidadesList.jsx
// Curiosidades del pueblo: datos con foto que el turista solo ve al pasar cerca.
// No forman parte del recorrido ni dan XP.
import { useState, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import MapaCoordenadas from '../../components/MapaCoordenadas';

const FORM_VACIO = { titulo: '', descripcion: '', latitud: '', longitud: '', activo: true, imagen: null, imagen_url: null, quitar_imagen: false };

export default function CuriosidadesList() {
  const [curiosidades, setCuriosidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nueva' | curiosidad
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get('/curiosidades/admin');
      setCuriosidades(data.curiosidades || []);
    } catch (error) {
      toast.error('No se pudieron cargar las curiosidades');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNueva = () => { setForm(FORM_VACIO); setModal('nueva'); };
  const abrirEditar = (c) => {
    setForm({ ...FORM_VACIO, titulo: c.titulo, descripcion: c.descripcion, latitud: c.latitud, longitud: c.longitud, activo: c.activo, imagen_url: c.imagen_url });
    setModal(c);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.latitud || !form.longitud) {
      toast.error('Toca el mapa para elegir dónde está la curiosidad');
      return;
    }
    setGuardando(true);
    try {
      const datos = new FormData();
      ['titulo', 'descripcion', 'latitud', 'longitud'].forEach((campo) => datos.append(campo, form[campo] ?? ''));
      datos.append('activo', form.activo ? 'true' : 'false');
      if (form.imagen) datos.append('imagen', form.imagen);
      if (form.quitar_imagen) datos.append('quitar_imagen', 'true');

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (modal === 'nueva') await api.post('/curiosidades', datos, config);
      else await api.put(`/curiosidades/${modal.id}`, datos, config);

      toast.success(modal === 'nueva' ? 'Curiosidad creada' : 'Curiosidad actualizada');
      setModal(null);
      cargar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (c) => {
    if (!window.confirm(`¿Eliminar la curiosidad "${c.titulo}"?`)) return;
    try {
      await api.delete(`/curiosidades/${c.id}`);
      toast.success('Curiosidad eliminada');
      cargar();
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curiosidades</h1>
          <p className="text-gray-500 text-sm">Datos curiosos del pueblo que los turistas descubren al pasar cerca (a menos de 150 m). No cuentan en el juego.</p>
        </div>
        <button onClick={abrirNueva} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shrink-0">
          <PlusIcon className="w-4 h-4" /> Nueva curiosidad
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : curiosidades.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 py-10">
          <LightBulbIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          Todavía no hay curiosidades.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {curiosidades.map((c) => (
            <div key={c.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${c.activo ? '' : 'opacity-60'}`}>
              {c.imagen_url ? (
                <img src={c.imagen_url} alt="" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-amber-50 flex items-center justify-center text-4xl">💡</div>
              )}
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <h3 className="font-semibold text-gray-800 flex-1">{c.titulo}</h3>
                  {!c.activo && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Oculta</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-3">{c.descripcion}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => abrirEditar(c)} className="flex-1 flex items-center justify-center gap-1 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-2">
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                  </button>
                  <button onClick={() => eliminar(c)} className="flex items-center justify-center text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2" title="Eliminar">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <form onSubmit={guardar} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{modal === 'nueva' ? 'Nueva curiosidad' : 'Editar curiosidad'}</h3>
              <button type="button" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} maxLength={150} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Ej: La casa donde nació..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={4} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Cuenta la curiosidad..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
              {form.imagen_url && !form.quitar_imagen && !form.imagen && (
                <div className="flex items-center gap-3 mb-2">
                  <img src={form.imagen_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, quitar_imagen: true })} className="text-sm text-red-600 hover:underline">Quitar foto</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imagen: e.target.files?.[0] || null })} className="w-full text-sm text-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
              <MapaCoordenadas latitud={form.latitud} longitud={form.longitud} altura={260}
                onCoordenadasChange={(lat, lng) => setForm((f) => ({ ...f, latitud: lat, longitud: lng }))} />
            </div>

            {modal !== 'nueva' && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Visible para los turistas
              </label>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-700">Cancelar</button>
              <button type="submit" disabled={guardando} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
