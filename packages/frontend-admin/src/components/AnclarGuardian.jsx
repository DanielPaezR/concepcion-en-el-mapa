// components/AnclarGuardian.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AnclarGuardian({ userPosition, onClose, onAnclado }) {
  const [mensaje, setMensaje] = useState('');
  const [nivelSuficiente, setNivelSuficiente] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [nivelActual, setNivelActual] = useState(0);
  const [nivelRequerido] = useState(5);

  useEffect(() => {
    verificarNivel();
  }, []);

  const verificarNivel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión para anclar un guardián');
        return;
      }

      const res = await api.get('/usuarios/mi-perfil');
      const nivel = res.data.nivel || 0;
      
      setNivelActual(nivel);
      setNivelSuficiente(nivel >= nivelRequerido);
    } catch (error) {
      console.error('Error al verificar nivel:', error);
      toast.error('Error al verificar tu nivel');
    }
  };

  const handleAnclar = async () => {
    if (!nivelSuficiente) {
      toast.error(`Debes alcanzar el nivel ${nivelRequerido} para anclar un guardián (Nivel actual: ${nivelActual})`);
      return;
    }
    
    if (!userPosition) {
      toast.error('No se pudo obtener tu ubicación');
      return;
    }
    
    setCargando(true);
    try {
      await api.post('/guardianes/anclar', {
        latitud: userPosition.lat,
        longitud: userPosition.lng,
        mensaje: mensaje
      });
      
      toast.success('¡Guardián anclado exitosamente!');
      onAnclado?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Error al anclar guardián');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-md w-full p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
              Anclar Guardián
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Progreso de nivel */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Nivel Requerido</span>
                <span className="font-bold text-primary-600">Nivel {nivelRequerido}</span>
              </div>
              <div className="flex justify-between text-sm mb-1 mt-2">
                <span>Tu Nivel Actual</span>
                <span className={`font-bold ${nivelSuficiente ? 'text-green-600' : 'text-amber-600'}`}>
                  Nivel {nivelActual}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${nivelSuficiente ? 'bg-green-600' : 'bg-amber-600'}`}
                  style={{ width: `${Math.min((nivelActual / nivelRequerido) * 100, 100)}%` }}
                />
              </div>
              {!nivelSuficiente && (
                <p className="text-xs text-amber-600 mt-2">
                  🔒 Necesitas {nivelRequerido - nivelActual} niveles más para anclar un guardián
                </p>
              )}
              {nivelSuficiente && (
                <p className="text-xs text-green-600 mt-2">
                  ✅ ¡Ya puedes anclar guardianes!
                </p>
              )}
            </div>

            {/* Mensaje del guardián */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje para quien te encuentre
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Deja un mensaje especial para los viajeros que encuentren tu guardián..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                maxLength="200"
              />
              <p className="text-xs text-gray-400 mt-1">{mensaje.length}/200 caracteres</p>
            </div>

            {/* Ubicación actual */}
            {userPosition && (
              <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Ubicación actual</p>
                  <p className="text-xs text-gray-500">
                    Tu guardián se anclará donde estás ahora
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleAnclar}
              disabled={!nivelSuficiente || cargando}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {cargando ? 'Anclando...' : '🛡️ Anclar Guardián'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}