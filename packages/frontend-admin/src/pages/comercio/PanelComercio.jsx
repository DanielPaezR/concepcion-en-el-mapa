// pages/comercio/PanelComercio.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  KeyIcon, CheckCircleIcon, XCircleIcon, PhotoIcon,
  TrashIcon, ArrowPathIcon, PowerIcon, PrinterIcon,
  PencilIcon, PlusIcon, ClockIcon, XMarkIcon, CheckIcon
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

const DIAS = [
  { clave: 'lunes', etiqueta: 'Lunes' },
  { clave: 'martes', etiqueta: 'Martes' },
  { clave: 'miercoles', etiqueta: 'Miércoles' },
  { clave: 'jueves', etiqueta: 'Jueves' },
  { clave: 'viernes', etiqueta: 'Viernes' },
  { clave: 'sabado', etiqueta: 'Sábado' },
  { clave: 'domingo', etiqueta: 'Domingo' },
];

const HORARIO_VACIO = () => Object.fromEntries(
  DIAS.map((d) => [d.clave, { abierto: false, apertura: '08:00', cierre: '18:00' }])
);

export default function PanelComercio() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('validar');

  const [codigoInput, setCodigoInput] = useState('');
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [canjeando, setCanjeando] = useState(false);

  const [negocio, setNegocio] = useState(null);
  const [cargandoNegocio, setCargandoNegocio] = useState(true);
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [form, setForm] = useState({ nombre: '', categoria: 'tienda', descripcion: '', beneficio: '', direccion: '' });
  const [portadaFile, setPortadaFile] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [editandoHorario, setEditandoHorario] = useState(false);
  const [horario, setHorario] = useState(HORARIO_VACIO());
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  const [modalProducto, setModalProducto] = useState(null);
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', imagen: null });
  const [guardandoProducto, setGuardandoProducto] = useState(false);

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
      setHorario({ ...HORARIO_VACIO(), ...(res.data.horario_atencion || {}) });
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

  const guardarInfo = async () => {
    setGuardando(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (portadaFile) formData.append('imagen', portadaFile);
      await api.put('/comercios/mi-negocio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Perfil actualizado');
      setPortadaFile(null);
      setEditandoInfo(false);
      cargarNegocio();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const guardarHorario = async () => {
    setGuardandoHorario(true);
    try {
      const formData = new FormData();
      formData.append('horario_atencion', JSON.stringify(horario));
      await api.put('/comercios/mi-negocio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Horario actualizado');
      setEditandoHorario(false);
      cargarNegocio();
    } catch (error) {
      toast.error('Error al guardar el horario');
    } finally {
      setGuardandoHorario(false);
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

  const abrirModalProducto = (producto = null) => {
    if (producto) {
      setFormProducto({ nombre: producto.nombre, precio: producto.precio || '', imagen: null });
      setModalProducto(producto);
    } else {
      setFormProducto({ nombre: '', precio: '', imagen: null });
      setModalProducto({});
    }
  };

  const guardarProducto = async () => {
    if (!formProducto.nombre.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    setGuardandoProducto(true);
    try {
      const formData = new FormData();
      formData.append('nombre', formProducto.nombre);
      formData.append('precio', formProducto.precio || '');
      if (formProducto.imagen) formData.append('imagen', formProducto.imagen);

      if (modalProducto?.id) {
        await api.put(`/comercios/mi-negocio/productos/${modalProducto.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Producto actualizado');
      } else {
        await api.post('/comercios/mi-negocio/productos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Producto agregado');
      }
      setModalProducto(null);
      cargarNegocio();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setGuardandoProducto(false);
    }
  };

  const eliminarProducto = async (productoId) => {
    if (!confirm('¿Eliminar este producto del menú?')) return;
    try {
      await api.delete(`/comercios/mi-negocio/productos/${productoId}`);
      toast.success('Producto eliminado');
      cargarNegocio();
    } catch {
      toast.error('Error al eliminar el producto');
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
          cargandoNegocio ? (
            <p className="text-gray-400 text-sm text-center py-8">Cargando...</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="relative h-40 bg-gradient-to-br from-amber-600 to-amber-900">
                  {negocio?.imagen_portada_url && (
                    <img src={negocio.imagen_portada_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <label className="absolute top-3 right-3 bg-black/40 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-black/60">
                    {portadaFile ? <CheckIcon className="w-3.5 h-3.5" /> : <PhotoIcon className="w-3.5 h-3.5" />}
                    {portadaFile ? 'Lista para guardar' : 'Cambiar portada'}
                    <input type="file" accept="image/*" onChange={(e) => setPortadaFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    {!editandoInfo ? (
                      <>
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          {CATEGORIAS.find((c) => c.valor === negocio?.categoria)?.etiqueta}
                        </div>
                        <h2 className="text-xl font-bold">{negocio?.nombre}</h2>
                      </>
                    ) : (
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Editando...</div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {!editandoInfo ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">🎁 Beneficio</div>
                        <p className="text-amber-900 text-sm font-medium">{negocio?.beneficio || '—'}</p>
                      </div>
                      {negocio?.descripcion && <p className="text-gray-600 text-sm mb-3">{negocio.descripcion}</p>}
                      {negocio?.direccion && <p className="text-gray-500 text-sm mb-3">📍 {negocio.direccion}</p>}
                      <button
                        onClick={() => setEditandoInfo(true)}
                        className="w-full flex items-center justify-center gap-2 border border-amber-300 text-amber-700 font-semibold py-2 rounded-lg text-sm hover:bg-amber-50"
                      >
                        <PencilIcon className="w-4 h-4" /> Editar información
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
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
                      <div className="flex gap-2">
                        <button onClick={guardarInfo} disabled={guardando} className="flex-1 bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm">
                          {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button onClick={() => { setEditandoInfo(false); setPortadaFile(null); }} className="px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" /> Horario de atención
                  </h3>
                  {!editandoHorario && (
                    <button onClick={() => setEditandoHorario(true)} className="text-amber-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {!editandoHorario ? (
                  <div className="space-y-1">
                    {DIAS.map((dia) => (
                      <div key={dia.clave} className="flex justify-between text-sm">
                        <span className="text-gray-500">{dia.etiqueta}</span>
                        <span className={horario[dia.clave]?.abierto ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                          {horario[dia.clave]?.abierto ? `${horario[dia.clave].apertura} - ${horario[dia.clave].cierre}` : 'Cerrado'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {DIAS.map((dia) => (
                      <div key={dia.clave} className="flex items-center gap-2">
                        <button
                          onClick={() => setHorario({ ...horario, [dia.clave]: { ...horario[dia.clave], abierto: !horario[dia.clave]?.abierto } })}
                          className={`w-16 text-[11px] font-bold py-1 rounded-md ${horario[dia.clave]?.abierto ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {horario[dia.clave]?.abierto ? 'ABIERTO' : 'CERRADO'}
                        </button>
                        <span className="text-xs text-gray-500 w-16">{dia.etiqueta}</span>
                        <input
                          type="time"
                          disabled={!horario[dia.clave]?.abierto}
                          value={horario[dia.clave]?.apertura || '08:00'}
                          onChange={(e) => setHorario({ ...horario, [dia.clave]: { ...horario[dia.clave], apertura: e.target.value } })}
                          className="border border-gray-200 rounded px-1.5 py-1 text-xs disabled:opacity-30 flex-1"
                        />
                        <span className="text-gray-300 text-xs">–</span>
                        <input
                          type="time"
                          disabled={!horario[dia.clave]?.abierto}
                          value={horario[dia.clave]?.cierre || '18:00'}
                          onChange={(e) => setHorario({ ...horario, [dia.clave]: { ...horario[dia.clave], cierre: e.target.value } })}
                          className="border border-gray-200 rounded px-1.5 py-1 text-xs disabled:opacity-30 flex-1"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={guardarHorario} disabled={guardandoHorario} className="flex-1 bg-amber-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm">
                        {guardandoHorario ? 'Guardando...' : 'Guardar horario'}
                      </button>
                      <button onClick={() => { setEditandoHorario(false); setHorario({ ...HORARIO_VACIO(), ...(negocio?.horario_atencion || {}) }); }} className="px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <label className="text-sm font-bold text-gray-800">Fotos ({negocio?.fotos?.length || 0}/4)</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {negocio?.fotos?.map((foto) => (
                    <div key={foto.id} className="relative aspect-square">
                      <img src={foto.imagen_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button onClick={() => eliminarFotoGaleria(foto.id)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1">
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(negocio?.fotos?.length || 0) < 4 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:border-amber-400">
                      {subiendoFoto ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PhotoIcon className="w-6 h-6" />}
                      <input type="file" accept="image/*" onChange={subirFotoGaleria} disabled={subiendoFoto} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800">Menú ({negocio?.productos?.length || 0}/12)</label>
                  {(negocio?.productos?.length || 0) < 12 && (
                    <button onClick={() => abrirModalProducto()} className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <PlusIcon className="w-4 h-4" /> Agregar
                    </button>
                  )}
                </div>
                {negocio?.productos?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {negocio.productos.map((p) => (
                      <button key={p.id} onClick={() => abrirModalProducto(p)} className="text-left rounded-lg overflow-hidden border border-gray-100 relative group">
                        {p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} className="w-full h-20 object-cover" />
                        ) : (
                          <div className="w-full h-20 bg-gray-50 flex items-center justify-center text-gray-300"><PhotoIcon className="w-6 h-6" /></div>
                        )}
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-800 truncate">{p.nombre}</div>
                          {p.precio && <div className="text-xs text-amber-600 font-bold">${Number(p.precio).toLocaleString('es-CO')}</div>}
                        </div>
                        <div
                          onClick={(e) => { e.stopPropagation(); eliminarProducto(p.id); }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs text-center py-4">Todavía no has agregado productos a tu menú.</p>
                )}
              </div>
            </div>
          )
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

      {modalProducto !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setModalProducto(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">{modalProducto?.id ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setModalProducto(null)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Nombre *</label>
                <input value={formProducto.nombre} onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Precio (COP)</label>
                <input type="number" value={formProducto.precio} onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })} placeholder="15000" className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Foto</label>
                {modalProducto?.imagen_url && !formProducto.imagen && (
                  <img src={modalProducto.imagen_url} alt="" className="w-20 h-20 object-cover rounded-lg mt-1 mb-1" />
                )}
                <input type="file" accept="image/*" onChange={(e) => setFormProducto({ ...formProducto, imagen: e.target.files?.[0] || null })} className="text-sm" />
              </div>
              <button onClick={guardarProducto} disabled={guardandoProducto} className="w-full bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg mt-2">
                {guardandoProducto ? 'Guardando...' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
