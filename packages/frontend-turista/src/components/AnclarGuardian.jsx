import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, MapPin, MessageCircle } from 'lucide-react';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import RegistroModal from './RegistroModal';

export default function AnclarGuardian({ userPosition, onClose, onAnclado }) {
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [lugaresCompletados, setLugaresCompletados] = useState(false);
  const [totalLugares, setTotalLugares] = useState(0);
  const [descubiertos, setDescubiertos] = useState(0);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const usuario = getTuristaActual();

  useEffect(() => {
    verificarProgreso();
  }, []);

  const verificarProgreso = async () => {
    try {
      const lugaresRes = await api.get('/lugares');
      const total = lugaresRes.data.data?.length || 0;
      setTotalLugares(total);
      
      const descubiertosStr = localStorage.getItem('concepcion_descubiertos');
      const descubiertosArr = descubiertosStr ? JSON.parse(descubiertosStr) : [];
      setDescubiertos(descubiertosArr.length);
      setLugaresCompletados(descubiertosArr.length >= total);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAnclar = async () => {
    if (!lugaresCompletados) {
      alert('Debes descubrir todos los lugares primero');
      return;
    }
    
    if (!userPosition) {
      alert('No se pudo obtener tu ubicación');
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
      } else {
          await api.post('/guardianes/anclar', data);
          alert('🛡️ ¡Guardián anclado exitosamente!');
          onAnclado?.();
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al anclar guardián');
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
          {/* Progreso */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progreso</span>
              <span>{descubiertos}/{totalLugares} lugares</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(descubiertos / totalLugares) * 100}%` }}
              />
            </div>
            {!lugaresCompletados && (
              <p className="text-xs text-amber-600 mt-2">
                🔒 Debes descubrir todos los lugares para anclar un guardián
              </p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Mensaje para quien te encuentre
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Deja un mensaje especial para los viajeros que encuentren tu guardián..."
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows="3"
              maxLength="200"
            />
            <p className="text-xs text-gray-400 mt-1">{mensaje.length}/200 caracteres</p>
          </div>

          {/* Ubicación */}
          {userPosition && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Ubicación actual</p>
                <p className="text-xs text-gray-500">Tu guardián se anclará donde estás ahora</p>
              </div>
            </div>
          )}

          <button
            onClick={handleAbrirAnclar}
            disabled={!lugaresCompletados || cargando}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {cargando ? 'Anclando...' : '🛡️ Anclar Guardián'}
          </button>
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