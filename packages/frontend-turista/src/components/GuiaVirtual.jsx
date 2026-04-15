// components/GuiaVirtual.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GuiaVirtual = ({ mensaje, tipo = 'normal', duracion = 5000 }) => {
  const [visible, setVisible] = useState(true);
  const [mensajeActual, setMensajeActual] = useState(mensaje);

  useEffect(() => {
    setVisible(true);
    setMensajeActual(mensaje);
    
    const timer = setTimeout(() => {
      setVisible(false);
    }, duracion);

    return () => clearTimeout(timer);
  }, [mensaje, duracion]);

  const getAvatarPorTipo = (tipo) => {
    switch(tipo) {
      case 'bienvenida':
        return '🧙‍♂️';
      case 'consejo':
        return '📜';
      case 'descubrimiento':
        return '🎉';
      case 'cerca':
        return '🔍';
      case 'nivel':
        return '⭐';
      default:
        return '🧭';
    }
  };

  const getColorPorTipo = (tipo) => {
    switch(tipo) {
      case 'bienvenida':
        return 'from-green-500 to-green-600';
      case 'consejo':
        return 'from-blue-500 to-blue-600';
      case 'descubrimiento':
        return 'from-yellow-500 to-yellow-600';
      case 'cerca':
        return 'from-purple-500 to-purple-600';
      case 'nivel':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-32 right-4 z-[2000] pointer-events-none"
        >
          {/* Burbuja de diálogo */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            {/* Triángulo de la burbuja */}
            <div className="absolute -bottom-2 right-10 w-4 h-4 bg-white transform rotate-45 shadow-lg" />
            
            {/* Contenido de la burbuja */}
            <div className={`bg-gradient-to-r ${getColorPorTipo(tipo)} rounded-2xl shadow-2xl p-4 max-w-xs`}>
              <div className="flex items-start space-x-3">
                {/* Avatar del guía */}
                <div className="text-4xl animate-bounce">
                  {getAvatarPorTipo(tipo)}
                </div>
                
                {/* Mensaje */}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm leading-relaxed">
                    {mensajeActual}
                  </p>
                  
                  {/* Barra de progreso del mensaje */}
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duracion / 1000, ease: 'linear' }}
                    className="h-1 bg-white/30 rounded-full mt-2"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Efecto de partículas alrededor del guía */}
          <div className="absolute -top-4 -right-4">
            <div className="relative">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: Math.random() * 20 - 10,
                    left: Math.random() * 20 - 10,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuiaVirtual;