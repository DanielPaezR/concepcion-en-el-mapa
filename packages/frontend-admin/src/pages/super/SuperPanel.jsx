// pages/super/SuperPanel.jsx
// Panel exclusivo del superadmin: estado del servidor, visitas, moderación de
// anuncios y permisos de admins y guías.
import { useState, useEffect } from 'react';
import { ServerStackIcon, ChartBarIcon, MegaphoneIcon, KeyIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import TabSistema from './TabSistema';
import TabVisitas from './TabVisitas';
import TabAnuncios from './TabAnuncios';
import TabEquipo from './TabEquipo';

const TABS = [
  { id: 'sistema', label: 'Servidor', icon: ServerStackIcon },
  { id: 'visitas', label: 'Visitas', icon: ChartBarIcon },
  { id: 'anuncios', label: 'Anuncios', icon: MegaphoneIcon },
  { id: 'equipo', label: 'Permisos', icon: KeyIcon },
];

export default function SuperPanel() {
  const [tab, setTab] = useState('sistema');
  const [pendientes, setPendientes] = useState(0);

  const cargarPendientes = async () => {
    try {
      const { data } = await api.get('/anuncios/moderacion?estado=pendiente');
      setPendientes(data.conteo?.pendiente || 0);
    } catch { /* el contador es informativo */ }
  };

  useEffect(() => { cargarPendientes(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de superadmin</h1>
        <p className="text-sm text-gray-500">Estado técnico, uso del aplicativo, anuncios y permisos del equipo.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <Icon className="w-4 h-4" /> {label}
            {id === 'anuncios' && pendientes > 0 && (
              <span className={`ml-1 text-xs px-1.5 rounded-full ${tab === id ? 'bg-white text-indigo-700' : 'bg-amber-500 text-white'}`}>{pendientes}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'sistema' && <TabSistema />}
      {tab === 'visitas' && <TabVisitas />}
      {tab === 'anuncios' && <TabAnuncios onCambio={cargarPendientes} />}
      {tab === 'equipo' && <TabEquipo />}
    </div>
  );
}
