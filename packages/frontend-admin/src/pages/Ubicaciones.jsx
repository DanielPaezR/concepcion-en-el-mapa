import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapPinIcon, UserGroupIcon, PhotoIcon, WifiIcon } from '@heroicons/react/24/outline';

export default function Ubicaciones() {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const response = await api.get('/usuarios/ubicaciones');
        setGuias(response.data.guias || []);
      } catch (error) {
        console.error('Error cargando ubicaciones:', error);
        toast.error('Error cargando ubicaciones de guías');
      } finally {
        setLoading(false);
      }
    };

    cargarUbicaciones();
  }, []);

  const avatarUrl = (guia) => {
    if (guia.foto_perfil_url) return guia.foto_perfil_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(guia.nombre || 'Guía')}&background=1f2937&color=ffffff&rounded=true&size=128`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Ubicaciones de guías</h1>
            <p className="mt-2 text-sm text-slate-600">Visualiza la ubicación y visibilidad pública de las guías conectadas.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
            <PhotoIcon className="h-5 w-5 text-slate-500" /> {guias.length} guías
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
            Cargando ubicaciones...
          </div>
        ) : guias.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
            No se encontró ninguna guía.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {guias.map((guia) => (
              <div key={guia.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                <div className="relative h-36 bg-gradient-to-br from-emerald-500 to-sky-500" />
                <div className="-mt-12 px-5 pb-5">
                  <div className="flex items-center gap-4">
                    <img src={avatarUrl(guia)} alt={guia.nombre} className="h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-md" />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900">{guia.nombre}</h2>
                      <p className="text-sm text-slate-500">{guia.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <WifiIcon className="h-4 w-4 text-emerald-500" />
                      <span>{guia.en_linea ? 'En línea' : 'Desconectado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-slate-400" />
                      <span>{guia.latitud && guia.longitud ? `${Number(guia.latitud).toFixed(5)}, ${Number(guia.longitud).toFixed(5)}` : 'Sin ubicación actual'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4 text-slate-400" />
                      <span>{guia.mostrar_avatar_publico ? 'Avatar visible públicamente' : 'Avatar oculto públicamente'}</span>
                    </div>
                    {guia.foto_perfil_url && (
                      <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">Foto de perfil desde el perfil de guardián</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
