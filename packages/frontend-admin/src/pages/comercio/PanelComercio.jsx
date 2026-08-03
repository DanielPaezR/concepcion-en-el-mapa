// pages/comercio/PanelComercio.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  KeyIcon, CheckCircleIcon, XCircleIcon, PhotoIcon,
  TrashIcon, ArrowPathIcon, PowerIcon, StarIcon, PrinterIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CATEGORIAS = [
  { valor: 'tienda', etiqueta: 'Tienda' },
  { valor: 'restaurante', etiqueta: 'Restaurante' },
  { valor: 'cafe', etiqueta: 'Café' },
  { valor: 'artesanias', etiqueta: 'Artesanías' },
  { valor: 'hospedaje', etiqueta: 'Hospedaje' },
  { valor: 'otro', etiqueta: 'Otro' },
];

export default function PanelComercio() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('validar');

  const [codigoInput, setCodigoInput] = useState('');
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [canjeando, setCanjeando] = useState(false);

  const [negocio, setNegocio] = useState(null);
  const [cargandoNegocio, setCargandoNegocio] = useState(true);
  const [form, setForm] = useState({ nombre: '', categoria: 'tienda', descripcion: '', beneficio: '', direccion: '' });
  const [portadaFile, setPortadaFile] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [recuerdos, setRecuerdos] = useState([]);
  const [cargandoRecuerdos, setCargandoRecuerdos] = useState(false);

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  const cargarNegocio = async () => {
    setCargandoNegocio(true);
    try {
      const res = await api.get('/comercios/mi-negocio');
      setNegocio(res.data);
      setForm({
        nombre: res.data.nombre || '',
        categoria: res.data.categoria || 'tienda',
        descripcion: res.data.descripcion || '',
        beneficio: res.data.beneficio || '',
        direccion: res.data.direccion || '',
      });
    } catch (error) {
      toast.error('No se pudo cargar tu negocio');
    } finally {
      setCargandoNegocio(false);
    }
  };

  const cargarRecuerdos = async () => {
    setCargandoRecuerdos(true);
    try {
      const res = await api.get('/comercios/mi-negocio/recuerdos');
      setRecuerdos(res.data || []);
    } catch {
      toast.error('No se pudieron cargar los recuerdos');
    } finally {
      setCargandoRecuerdos(false);
    }
  };

  useEffect(() => {
    cargarNegocio();
    cargarRecuerdos();
  }, []);

  const buscarCodigo = async () => {
    if (!codigoInput.trim()) return;
    setBuscando(true);
    setResultado(null);
    try {
      const res = await api.get(`/comercios/codigos/${codigoInput.trim().toUpperCase()}`);
      setResultado({ ok: true, ...res.data });
    } catch (error) {
      setResultado({ ok: false, error: error.response?.data?.error || 'Código no válido' });
    } finally {
      setBuscando(false);
    }
  };

  const confirmarCanje = async () => {
    setCanjeando(true);
    try {
      await api.post(`/comercios/codigos/${codigoInput.trim().toUpperCase()}/canjear`);
      toast.success('¡Código canjeado!');
      setResultado(null);
      setCodigoInput('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo canjear');
    } finally {
      setCanjeando(false);
    }
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (portadaFile) formData.append('imagen', portadaFile);
      await api.put('/comercios/mi-negocio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Perfil actualizado');
      setPortadaFile(null);
      cargarNegocio();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const subirFotoGaleria = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      await api.post('/comercios/mi-negocio/fotos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Foto agregada');
      cargarNegocio();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al subir foto');
    } finally {
      setSubiendoFoto(false);
      e.target.value = '';
    }
  };

  const eliminarFotoGaleria = async (fotoId) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await api.delete(`/comercios/mi-negocio/fotos/${fotoId}`);
      toast.success('Foto eliminada');
      cargarNegocio();
    } catch {
      toast.error('Error al eliminar la foto');
    }
  };

  const TABS = [
    { id: 'validar', label: 'Validar código', icon: KeyIcon },
    { id: 'perfil', label: 'Mi perfil', icon: PhotoIcon },
    { id: 'recuerdos', label: 'Recuerdos', icon: PrinterIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50 pb-24">
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-5 rounded-b-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-100">Panel de comercio aliado</p>
            <h1 className="text-xl font-bold">{negocio?.nombre || user?.nombre || 'Mi negocio'}</h1>
          </div>
          <button onClick={handleLogout} className="bg-white/15 p-2 rounded-full hover:bg-white/25 transition">
            <PowerIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                tab === id ? 'bg-white text-amber-700' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {tab === 'validar' && (
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-gray-800 mb-3">Validar código de descuento</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                placeholder="CEM-XXXXXX"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 font-mono tracking-wider focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <button
                onClick={buscarCodigo}
                disabled={buscando || !codigoInput.trim()}
                className="bg-amber-600 disabled:opacity-40 text-white font-semibold px-4 rounded-lg"
              >
                {buscando ? '...' : 'Buscar'}
              </button>
            </div>

            {resultado && (
              <div className={`mt-4 rounded-lg p-4 ${resultado.ok ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                {resultado.ok ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                      <CheckCircleIcon className="w-5 h-5" /> Código válido
                    </div>
                    <p className="text-sm text-gray-600">Turista: <b>{resultado.turista_nombre}</b></p>
                    <p className="text-sm text-gray-600">Lugar descubierto: <b>{resultado.lugar_nombre}</b></p>
                    <button
                      onClick={confirmarCanje}
                      disabled={canjeando}
                      className="w-full mt-3 bg-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg"
                    >
                      {canjeando ? 'Canjeando...' : 'Confirmar canje'}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-700 font-semibold">
                    <XCircleIcon className="w-5 h-5" /> {resultado.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'perfil' && (
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-gray-800 mb-3">Editar mi perfil</h2>
            {cargandoNegocio ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Foto de portada</label>
                  {negocio?.imagen_portada_url && (
                    <img src={negocio.imagen_portada_url} alt="" className="w-full h-32 object-cover rounded-lg mt-1 mb-1" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => setPortadaFile(e.target.files?.[0] || null)} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Nombre</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Categoría</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1">
                    {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Descripción</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Beneficio para turistas</label>
                  <input value={form.beneficio} onChange={(e) => setForm({ ...form, beneficio: e.target.value })} placeholder="Ej: 10% de descuento" className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Dirección</label>
                  <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" />
                </div>
                <button onClick={guardarPerfil} disabled={guardando} className="w-full bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>

                <div className="pt-3 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-500">Fotos ({negocio?.fotos?.length || 0}/8)</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {negocio?.fotos?.map((foto) => (
                      <div key={foto.id} className="relative aspect-square">
                        <img src={foto.imagen_url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button onClick={() => eliminarFotoGaleria(foto.id)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1">
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(negocio?.fotos?.length || 0) < 8 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:border-amber-400">
                        {subiendoFoto ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PhotoIcon className="w-6 h-6" />}
                        <input type="file" accept="image/*" onChange={subirFotoGaleria} disabled={subiendoFoto} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'recuerdos' && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Recuerdos pendientes de imprimir</h2>
              <button onClick={cargarRecuerdos} className="text-gray-400 hover:text-amber-600">
                <ArrowPathIcon className={`w-5 h-5 ${cargandoRecuerdos ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {recuerdos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {recuerdos.map((r) => (
                  <div key={r.id} className="relative aspect-[4/5] rounded-lg overflow-hidden">
                    <img src={r.imagen_url} alt={r.lugar_nombre} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">{r.lugar_nombre}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <PrinterIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Todavía no hay recuerdos asignados a tu negocio.</p>
                <p className="text-xs mt-1">Esta sección se activa cuando llegue la impresora de stickers.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
