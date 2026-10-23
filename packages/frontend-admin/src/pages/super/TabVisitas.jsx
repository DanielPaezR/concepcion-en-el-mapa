// Visitas a la app del turista, agrupadas por día, semana o mes
import { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from '../../services/api';

const RANGOS = [
  { dias: 7, t: '7 días' }, { dias: 30, t: '30 días' }, { dias: 90, t: '3 meses' }, { dias: 365, t: '1 año' },
];
const AGRUPAR = [{ v: 'dia', t: 'Día' }, { v: 'semana', t: 'Semana' }, { v: 'mes', t: 'Mes' }];

const etiqueta = (periodo, agrupar) => {
  const d = new Date(`${periodo}T12:00:00`);
  if (agrupar === 'mes') return d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const Boton = ({ activo, onClick, children }) => (
  <button onClick={onClick} className={`px-3 py-1.5 text-sm rounded-lg ${activo ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{children}</button>
);

export default function TabVisitas() {
  const [agrupar, setAgrupar] = useState('dia');
  const [dias, setDias] = useState(30);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/super/visitas?agrupar=${agrupar}&dias=${dias}`)
      .then(({ data }) => { setDatos(data); setError(null); })
      .catch((e) => setError(e.response?.data?.error || 'No se pudieron cargar las visitas'));
  }, [agrupar, dias]);

  if (error) return <div className="bg-red-50 text-red-700 rounded-xl p-4">{error}</div>;
  if (!datos) return <p className="text-gray-400">Cargando...</p>;

  const serie = datos.serie.map((s) => ({ ...s, etiqueta: etiqueta(s.periodo, agrupar) }));
  const t = datos.totales;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Hoy', t.hoy], ['Últimos 7 días', t.semana], ['Últimos 30 días', t.mes], ['Total histórico', t.total]].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{k}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Agrupar por</span>
        {AGRUPAR.map((a) => <Boton key={a.v} activo={agrupar === a.v} onClick={() => setAgrupar(a.v)}>{a.t}</Boton>)}
        <span className="text-sm text-gray-500 ml-3">Rango</span>
        {RANGOS.map((r) => <Boton key={r.dias} activo={dias === r.dias} onClick={() => setDias(r.dias)}>{r.t}</Boton>)}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Visitas, personas distintas y registros nuevos</h3>
        {serie.length === 0 ? <p className="text-sm text-gray-400 py-10 text-center">Aún no hay visitas en este rango.</p> : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <ComposedChart data={serie}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitas" name="Visitas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sesiones" name="Dispositivos distintos" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="registros" name="Registros nuevos" stroke="#16a34a" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">Una visita = una apertura de la app del turista (se cuenta una vez cada 30 minutos por dispositivo). Horas de Colombia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Por dispositivo</h3>
          {datos.dispositivos.length === 0 ? <p className="text-gray-400">Sin datos.</p> : datos.dispositivos.map((d) => (
            <p key={d.dispositivo} className="flex justify-between py-0.5"><span className="capitalize">{d.dispositivo}</span><strong className="tabular-nums">{d.visitas}</strong></p>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Pantallas de entrada</h3>
          {datos.rutas.length === 0 ? <p className="text-gray-400">Sin datos.</p> : datos.rutas.map((r) => (
            <p key={r.ruta} className="flex justify-between py-0.5"><span className="font-mono text-xs">{r.ruta}</span><strong className="tabular-nums">{r.visitas}</strong></p>
          ))}
        </div>
      </div>
    </div>
  );
}
