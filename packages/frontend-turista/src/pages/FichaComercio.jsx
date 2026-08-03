import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Star, MapPin, Store } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIA_LABEL = {
  tienda: 'Tienda',
  restaurante: 'Restaurante',
  cafe: 'Café',
  artesanias: 'Artesanías',
  hospedaje: 'Hospedaje',
  otro: 'Comercio',
};

function EstrellasSelector({ valor, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star className={`w-7 h-7 ${n <= valor ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function FichaComercio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');

  const { data: comercio, isLoading } = useQuery({
    queryKey: ['comercio', id],
    queryFn: async () => (await api.get(`/comercios/${id}`)).data,
  });

  const { data: puedeCalificarData } = useQuery({
    queryKey: ['puedo-calificar', id],
    queryFn: async () => (await api.get(`/comercios/${id}/puedo-calificar`)).data,
  });

  const enviarResena = useMutation({
    mutationFn: async () => api.post(`/comercios/${id}/resenas`, { calificacion, comentario }),
    onSuccess: () => {
      toast.success('¡Gracias por tu reseña!');
      setCalificacion(0);
      setComentario('');
      queryClient.invalidateQueries(['comercio', id]);
      queryClient.invalidateQueries(['puedo-calificar', id]);
    },
    onError: (e) => {
      toast.error(e.response?.data?.error || 'No se pudo enviar la reseña');
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>;
  }

  if (!comercio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500 p-6 text-center">
        <Store className="w-12 h-12 text-gray-300" />
        <p>No encontramos este comercio.</p>
        <button onClick={() => navigate('/')} className="text-amber-600 font-semibold">Volver al mapa</button>
      </div>
    );
  }

  const puedeCalificar = puedeCalificarData?.puede_calificar;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="relative h-56 bg-gradient-to-br from-amber-600 to-amber-900">
        {comercio.imagen_portada_url && (
          <img src={comercio.imagen_portada_url} alt={comercio.nombre} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/30 backdrop-blur rounded-full p-2"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            {CATEGORIA_LABEL[comercio.categoria] || comercio.categoria}
          </div>
          <h1 className="text-2xl font-bold">{comercio.nombre}</h1>
          {Number(comercio.total_resenas) > 0 && (
            <div className="flex items-center gap-1 mt-1 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {Number(comercio.calificacion_promedio).toFixed(1)} · {comercio.total_resenas} reseña{comercio.total_resenas != 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 -mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">🎁 Beneficio para exploradores</div>
          <p className="text-amber-900 font-medium">{comercio.beneficio}</p>
        </div>

        {comercio.descripcion && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <p className="text-gray-600 text-sm">{comercio.descripcion}</p>
          </div>
        )}

        {comercio.direccion && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 px-1">
            <MapPin className="w-4 h-4" /> {comercio.direccion}
          </div>
        )}

        {comercio.fotos?.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Fotos</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {comercio.fotos.map((foto) => (
                <img key={foto.id} src={foto.imagen_url} alt="" className="w-28 h-28 rounded-lg object-cover flex-shrink-0" />
              ))}
            </div>
          </div>
        )}

        {puedeCalificar && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Ya canjeaste tu código aquí — ¡califica tu experiencia!</h3>
            <EstrellasSelector valor={calificacion} onChange={setCalificacion} />
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos qué tal (opcional)"
              rows={2}
              className="w-full mt-3 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
            <button
              disabled={calificacion === 0 || enviarResena.isPending}
              onClick={() => enviarResena.mutate()}
              className="w-full mt-3 bg-amber-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg text-sm"
            >
              {enviarResena.isPending ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">
            Reseñas {comercio.resenas?.length > 0 && `(${comercio.resenas.length})`}
          </h3>
          {comercio.resenas?.length > 0 ? (
            <div className="space-y-3">
              {comercio.resenas.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-700">{r.turista_nombre}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.calificacion ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comentario && <p className="text-sm text-gray-500">{r.comentario}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">Todavía no hay reseñas de este comercio.</p>
          )}
        </div>
      </div>
    </div>
  );
}
