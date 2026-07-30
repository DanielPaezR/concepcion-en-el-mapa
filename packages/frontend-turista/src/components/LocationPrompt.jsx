// components/LocationPrompt.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed, X } from 'lucide-react';

export default function LocationPrompt({ show, onAccept, onDeny }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70"
          onClick={(e) => e.target === e.currentTarget && onDeny()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
          >
            {/* Cerrar */}
            <button
              onClick={onDeny}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Contenido */}
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <LocateFixed className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Activar ubicación
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                Necesitamos tu ubicación para mostrarte los lugares cercanos y descubrirlos automáticamente cuando te acerques.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onAccept}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition"
                >
                  Activar
                </button>
                <button
                  onClick={onDeny}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl transition"
                >
                  Ahora no
                </button>
              </div>
            </div>

            {/* Barra inferior decorativa */}
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}