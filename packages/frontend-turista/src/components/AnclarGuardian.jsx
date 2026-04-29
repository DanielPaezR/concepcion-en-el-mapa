import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, MapPin, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import RegistroModal from './RegistroModal';

export default function AnclarGuardian({ userPosition, onClose, onAnclado }) {
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoNivel, setCargandoNivel] = useState(true);
  const [nivelSuficiente, setNivelSuficiente] = useState(false);
  const [nivelActual, setNivelActual] = useState(0);
  const [totalLugares, setTotalLugares] = useState(0);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const usuario = getTuristaActual();

  useEffect(() => {
    verificarNivel();
    cargarTotalLugares();
  }, []);

  const cargarTotalLugares = async () => {
    try {
      const lugaresRes = await api.get('/lugares');
      const total = lugaresRes.data.data?.length || 0;
      setTotalLugares(total);
    } catch (error) {
      console.error('Error al cargar lugares:', error);
    }
  };

  const verificarNivel = async () => {
    try {
      setCargandoNivel(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setNivelSuficiente(false);
        setNivelActual(0);
        return;
      }
      
      // Decodificar token para obtener el ID del usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      const usuarioId = payload.id;
      
      // Obtener datos del usuario desde el backend
      const usuarioRes = await api.get(`/usuarios/${usuarioId}`);
      const nivel = usuarioRes.data.nivel || 1;
      
      setNivelActual(nivel);
      setNivelSuficiente(nivel >= 5);
      
      console.log('✅ Nivel verificado:', nivel, 'Nivel 5 requerido:', nivel >= 5);
    } catch (error) {
      console.error('Error al verificar nivel:', error);
      setNivelSuficiente(false);
      setNivelActual(0);
    } finally {
      setCargandoNivel(false);
    }
  };

  const handleAnclar = async () => {
    if (!nivelSuficiente) {
      alert(`❌ Necesitas nivel 5 para anclar un guardián.\n\nTu nivel actual es ${nivelActual}. ¡Sigue explorando para subir de nivel!`);
      return;
    }
    
    if (!userPosition) {
      alert('📍 No se pudo obtener tu ubicación. Activa el GPS y recarga la página.');
      return;
    }
    
    setCargando(true);
    try {
      const data = {
        latitud: userPosition.lat,
        longitud: userPosition.lng,
        mensaje: mensaje
      };

      if (!navigator.onLine) {
        // Guardar en cola si no hay internet
        const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
        queue.push({ 
          type: 'ANCLAR_GUARDIAN', 
          data, 
          timestamp: new Date().toISOString() 
        });
        localStorage.setItem('sync_queue', JSON.stringify(queue));
        alert('📡 Estás sin conexión. Tu guardián se anclará automáticamente apenas recuperes la señal.');
        onClose();
      } else {
        const response = await api.post('/guardianes/anclar', data);
        
        if (response.data.success) {
          // Feedback exitoso
          alert('🛡️ ¡GUARDIÁN ANCLADO EXITOSAMENTE!\n\n✨ Tu guardián ahora protege este lugar.\n📱 Otros aventureros podrán encontrarte en el mapa.\n🏅 Has ganado una insignia especial.');
          
          console.log('✅ Guardián anclado correctamente:', response.data.guardian);
          
          // Notificar al componente padre
          if (onAnclado) {
            onAnclado();
          }
          
          onClose();
        }
      }
    } catch (error) {
      console.error('Error al anclar guardián:', error);
      const errorMsg = error.response?.data?.error || 'Error al anclar guardián. Intenta nuevamente.';
      alert(`❌ ${errorMsg}`);
    } finally {
      setCargando(false);
    }
  };

  // Verificar si es anónimo antes de anclar
  const handleAbrirAnclar = () => {
    if (usuario?.anonimo) {
      setMostrarRegistro(true);
    } else {
      handleAnclar();
    }
  };

  // Si está cargando el nivel, mostrar loader
  if (cargandoNivel) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl max-w-md w-full p-6 text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando tu nivel...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Anclar Guardián
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nivel del usuario - Reemplaza el progreso anterior */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Nivel Requerido</span>
              <span className="font-bold text-purple-600">Nivel 5 🎯</span>
            </div>
            <div className="flex justify-between text-sm mb-1 mt-2">
              <span className="font-medium">Tu Nivel Actual</span>
              <span className={`font-bold ${nivelSuficiente ? 'text-green-600' : 'text-amber-600'}`}>
                Nivel {nivelActual} {nivelSuficiente ? '✅' : '🔒'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full transition-all ${nivelSuficiente ? 'bg-green-600' : 'bg-amber-600'}`}
                style={{ width: `${Math.min((nivelActual / 5) * 100, 100)}%` }}
              />
            </div>
            {!nivelSuficiente && (
              <p className="text-xs text-amber-600 mt-2">
                🔥 Necesitas {5 - nivelActual} niveles más para anclar un guardián. ¡Sigue explorando!
              </p>
            )}
            {nivelSuficiente && (
              <p className="text-xs text-green-600 mt-2">
                ✅ ¡Felicidades! Ya puedes anclar guardianes y proteger tus lugares favoritos.
              </p>
            )}
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Total lugares: {totalLugares}</span>
              <span>Desbloqueas: 🛡️ Insignia de Guardián</span>
            </div>
          </div>

          {/* Mensaje del guardián */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Mensaje para quien te encuentre
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Deja un mensaje especial para los viajeros que encuentren tu guardián..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows="3"
              maxLength="200"
            />
            <p className="text-xs text-gray-400 mt-1">{mensaje.length}/200 caracteres</p>
          </div>

          {/* Ubicación actual */}
          {userPosition && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Ubicación actual</p>
                <p className="text-xs text-gray-500">
                  📍 Lat: {userPosition.lat.toFixed(6)}, Lng: {userPosition.lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tu guardián se anclará exactamente donde estás ahora
                </p>
              </div>
            </div>
          )}

          {/* Botón de anclar */}
          <button
            onClick={handleAbrirAnclar}
            disabled={!nivelSuficiente || cargando}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              nivelSuficiente && !cargando
                ? 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Anclando...
              </span>
            ) : (
              '🛡️ Anclar Guardián'
            )}
          </button>

          {/* Información adicional */}
          {nivelSuficiente && (
            <div className="text-center text-xs text-gray-400 pt-2">
              <p>✨ Al anclar un guardián:</p>
              <p>- Proteges un lugar especial del municipio</p>
              <p>- Ganas la insignia 🛡️ "Guardián de Concepción"</p>
              <p>- Otros aventureros podrán encontrarte</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal de registro */}
      {mostrarRegistro && (
        <RegistroModal
          onClose={() => setMostrarRegistro(false)}
          onSuccess={() => {
            // Recargar datos del usuario y proceder
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}