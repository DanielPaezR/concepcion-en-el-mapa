// Estado del servidor, de la base de datos y de las peticiones (se refresca cada 15 s)
import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from '../../services/api';

const duracion = (seg) => {
  const d = Math.floor(seg / 86400), h = Math.floor((seg % 86400) / 3600), m = Math.floor((seg % 3600) / 60);
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
};

const Tarjeta = ({ titulo, valor, detalle, alerta }) => (
  <div className={`bg-white rounded-xl border p-4 ${alerta ? 'border-red-200' : 'border-gray-100'}`}>
    <p className="text-xs text-gray-500 uppercase tracking-wide">{titulo}</p>
    <p className={`text-2xl font-bold mt-1 ${alerta ? 'text-red-600' : 'text-gray-900'}`}>{valor}</p>
    {detalle && <p className="text-xs text-gray-400 mt-0.5">{detalle}</p>}
  </div>
);

const Tabla = ({ titulo, filas, columnas }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-x-auto">
    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{titulo}</h3>
    {filas.length === 0 ? <p className="text-sm text-gray-400">Sin datos todavía.</p> : (
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 text-xs">{columnas.map((c) => <th key={c.k} className={`pb-1 ${c.num ? 'text-right' : ''}`}>{c.t}</th>)}</tr></thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-t border-gray-50">
              {columnas.map((c) => <td key={c.k} className={`py-1 ${c.num ? 'text-right tabular-nums' : 'font-mono text-xs text-gray-700'}`}>{f[c.k]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default function TabSistema() {
  const [sis, setSis] = useState(null);
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);

  const cargar = async () => {
    try {
      const [s, r] = await Promise.all([api.get('/super/sistema'), api.get('/super/resumen')]);
      setSis(s.data); setRes(r.data); setError(null);
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo consultar el servidor');
    }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 15000);
    return () => clearInterval(id);
  }, []);

  if (error) return <div className="bg-red-50 text-red-700 rounded-xl p-4">{error}</div>;
  if (!sis) return <p className="text-gray-400">Cargando...</p>;

  const p = sis.peticiones;
  const serie = p.serie.map((m) => ({ ...m, hora: new Date(m.minuto).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }));
  const usuarios = res?.usuarios || [];
  const totalRegistrados = usuarios.reduce((a, u) => a + u.registrados, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Tarjeta titulo="Servidor activo" valor={duracion(sis.servidor.uptime_seg)} detalle={`Node ${sis.servidor.node}`} />
        <Tarjeta titulo="Latencia BD" valor={`${sis.base_datos.latencia_ms} ms`} detalle={`PostgreSQL ${sis.base_datos.version.split(' ')[0]}`} alerta={sis.base_datos.latencia_ms > 200} />
        <Tarjeta titulo="Respuesta p95" valor={`${p.latencia_ms.p95} ms`} detalle={`p50 ${p.latencia_ms.p50} · p99 ${p.latencia_ms.p99} ms`} alerta={p.latencia_ms.p95 > 1500} />
        <Tarjeta titulo="Peticiones/min" valor={p.por_minuto_5min} detalle={`${p.ultima_hora} en la última hora`} />
        <Tarjeta titulo="Errores 5xx" valor={`${p.tasa_error_5xx}%`} detalle={`última hora`} alerta={p.tasa_error_5xx > 2} />
        <Tarjeta titulo="Memoria" valor={`${sis.servidor.memoria_mb.rss} MB`} detalle={`heap ${sis.servidor.memoria_mb.heap_usado}/${sis.servidor.memoria_mb.heap_total} MB`} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Últimos 30 minutos</h3>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={serie}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hora" tick={{ fontSize: 11 }} interval={4} />
              <YAxis yAxisId="izq" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="der" orientation="right" tick={{ fontSize: 11 }} unit=" ms" />
              <Tooltip />
              <Legend />
              <Line yAxisId="izq" type="monotone" dataKey="peticiones" name="Peticiones" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line yAxisId="der" type="monotone" dataKey="promedio_ms" name="Tiempo medio (ms)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Códigos: {Object.entries(p.codigos).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'} · {p.desde_inicio} peticiones desde que arrancó el servidor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Tabla titulo="Rutas más lentas (última hora)" filas={p.rutas_mas_lentas}
          columnas={[{ k: 'ruta', t: 'Ruta' }, { k: 'promedio_ms', t: 'Media ms', num: true }, { k: 'max_ms', t: 'Máx ms', num: true }, { k: 'peticiones', t: 'Peticiones', num: true }]} />
        <Tabla titulo="Rutas más usadas (última hora)" filas={p.rutas_mas_usadas}
          columnas={[{ k: 'ruta', t: 'Ruta' }, { k: 'peticiones', t: 'Peticiones', num: true }, { k: 'errores', t: 'Errores', num: true }, { k: 'promedio_ms', t: 'Media ms', num: true }]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm space-y-1">
          <h3 className="font-semibold text-gray-800 mb-2">Base de datos</h3>
          <p>Tamaño: <strong>{sis.base_datos.tamano}</strong></p>
          <p>Conexiones activas: <strong>{sis.base_datos.conexiones_activas}</strong></p>
          <p>Pool: {sis.base_datos.pool.total} total · {sis.base_datos.pool.libres} libres · {sis.base_datos.pool.en_espera} en espera</p>
          <p className="pt-2 font-semibold text-gray-800">Servidor</p>
          <p>{sis.servidor.plataforma} · {sis.servidor.cpus} CPU · carga {sis.servidor.carga_promedio.join(' / ')}</p>
          <p>Memoria del equipo: {sis.servidor.memoria_sistema_mb.libre} MB libres de {sis.servidor.memoria_sistema_mb.total} MB</p>
          <p>Entorno: {sis.servidor.entorno}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Servicios externos</h3>
          {[['cloudinary', 'Cloudinary (imágenes)'], ['correo_smtp', 'Correo (códigos de verificación)'], ['google_login', 'Inicio con Google'], ['push', 'Notificaciones push']].map(([k, t]) => (
            <p key={k} className="py-0.5">{sis.servicios[k] ? '🟢' : '⚪'} {t} {sis.servicios[k] ? '' : <span className="text-gray-400">— sin configurar</span>}</p>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Uso del aplicativo</h3>
          <p>Cuentas registradas: <strong>{totalRegistrados}</strong></p>
          {usuarios.map((u) => <p key={u.rol} className="text-gray-600">· {u.rol}: {u.registrados}{u.anonimos ? ` (+${u.anonimos} anónimos)` : ''}</p>)}
          <p className="pt-2">Descubrimientos hoy: <strong>{res?.actividad?.descubrimientos_hoy ?? '—'}</strong> (total {res?.actividad?.descubrimientos_total ?? '—'})</p>
          <p>Retos completados hoy: <strong>{res?.actividad?.retos_hoy ?? '—'}</strong></p>
          <p>Reservas pendientes: <strong>{res?.actividad?.reservas_pendientes ?? '—'}</strong></p>
          <p>Anuncios: {Object.entries(res?.anuncios || {}).map(([k, v]) => `${k} ${v}`).join(' · ') || 'ninguno'}</p>
        </div>
      </div>

      <Tabla titulo="Tablas con más filas" filas={sis.base_datos.tablas_mas_grandes} columnas={[{ k: 'tabla', t: 'Tabla' }, { k: 'filas', t: 'Filas', num: true }]} />
      <p className="text-xs text-gray-400">Se actualiza cada 15 segundos. Las métricas de peticiones se reinician cuando el servidor se reinicia (por ejemplo, en cada despliegue).</p>
    </div>
  );
}
