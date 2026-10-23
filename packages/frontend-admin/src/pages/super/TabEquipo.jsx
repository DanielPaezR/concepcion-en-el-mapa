// Permisos de admins y guías: cada interruptor se guarda al instante
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Interruptor = ({ activo, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} role="switch" aria-checked={activo}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${activo ? 'bg-indigo-600' : 'bg-gray-300'} ${disabled ? 'opacity-50' : ''}`}>
    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

export default function TabEquipo() {
  const [datos, setDatos] = useState(null);
  const [guardando, setGuardando] = useState(null); // "id:clave"
  const [filtro, setFiltro] = useState('admin');

  const cargar = () => api.get('/super/equipo')
    .then(({ data }) => setDatos(data))
    .catch(() => toast.error('No se pudo cargar el equipo'));

  useEffect(() => { cargar(); }, []);

  const alternar = async (usuario, clave) => {
    const nuevo = !usuario.permisos[clave];
    setGuardando(`${usuario.id}:${clave}`);
    try {
      const { data } = await api.put(`/super/equipo/${usuario.id}/permisos`, { permisos: { [clave]: nuevo } });
      setDatos((d) => ({ ...d, usuarios: d.usuarios.map((u) => (u.id === usuario.id ? { ...u, permisos: data.permisos } : u)) }));
      toast.success(`${nuevo ? 'Permiso dado' : 'Permiso quitado'}: ${usuario.nombre}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'No se pudo guardar');
    } finally {
      setGuardando(null);
    }
  };

  if (!datos) return <p className="text-gray-400">Cargando...</p>;
  const usuarios = datos.usuarios.filter((u) => u.rol === filtro);
  const catalogo = datos.catalogo[filtro];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[['admin', 'Administradores'], ['guia', 'Guías']].map(([v, t]) => (
          <button key={v} onClick={() => setFiltro(v)}
            className={`px-3 py-1.5 text-sm rounded-lg ${filtro === v ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {t} ({datos.usuarios.filter((u) => u.rol === v).length})
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        {filtro === 'admin'
          ? 'Lo que apagues desaparece del menú de ese administrador y su servidor lo bloquea.'
          : 'Controla qué puede gestionar cada guía desde su panel.'}
      </p>

      {usuarios.length === 0 ? <p className="text-gray-400">No hay {filtro === 'admin' ? 'administradores' : 'guías'}.</p> : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="font-semibold text-gray-900">{u.nombre}</p>
              <p className="text-xs text-gray-500 mb-3">{u.email}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                {Object.entries(catalogo).map(([clave, etiqueta]) => (
                  <label key={clave} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                    {etiqueta}
                    <Interruptor activo={!!u.permisos[clave]} disabled={guardando === `${u.id}:${clave}`} onClick={() => alternar(u, clave)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
