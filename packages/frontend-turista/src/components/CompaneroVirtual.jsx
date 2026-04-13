// components/CompaneroVirtual.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CompaneroVirtual = ({ mensaje, nivel = 1, emocion = 'feliz' }) => {
  const [mostrarBurbuja, setMostrarBurbuja] = useState(true);
  const [mensajeActual, setMensajeActual] = useState(mensaje);

  useEffect(() => {
    if (mensaje) {
      setMensajeActual(mensaje);
      setMostrarBurbuja(true);
      
      const timer = setTimeout(() => {
        setMostrarBurbuja(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleClickPantalla = () => {
    setMostrarBurbuja(false);
  };

  // Colores por nivel (escala de verde/turquesa como la región)
  const getColores = () => {
    const colores = {
      1: { principal: 'bg-emerald-300', secundario: 'bg-emerald-200', acento: 'bg-amber-300' },
      2: { principal: 'bg-emerald-400', secundario: 'bg-emerald-300', acento: 'bg-amber-400' },
      3: { principal: 'bg-teal-400', secundario: 'bg-teal-300', acento: 'bg-amber-500' },
      4: { principal: 'bg-teal-500', secundario: 'bg-teal-400', acento: 'bg-orange-400' },
      5: { principal: 'bg-cyan-500', secundario: 'bg-cyan-400', acento: 'bg-orange-500' }
    };
    return colores[nivel] || colores[1];
  };

  // Tamaño por nivel
  const getTamaño = () => {
    const base = window.innerWidth < 640 ? 60 : 70;
    return base + (nivel * 2);
  };

  const colores = getColores();
  const tamaño = getTamaño();

  // Expresiones faciales
  const getExpresion = () => {
    switch(emocion) {
      case 'feliz': return {
        ojos: '◕‿◕',
        boca: 'ω',
        color: 'text-black'
      };
      case 'sorprendido': return {
        ojos: '◕▃◕',
        boca: '〇',
        color: 'text-black'
      };
      case 'celebrando': return {
        ojos: '✧‿✧',
        boca: '◡',
        color: 'text-pink-500'
      };
      case 'pensativo': return {
        ojos: '◕-◕',
        boca: '?',
        color: 'text-black'
      };
      default: return {
        ojos: '◕‿◕',
        boca: 'ω',
        color: 'text-black'
      };
    }
  };

  const expresion = getExpresion();

  return (
    <>
      {/* Overlay para cerrar burbuja */}
      {mostrarBurbuja && (
        <div 
          className="fixed inset-0 z-[1500]" 
          onClick={handleClickPantalla}
        />
      )}

      {/* Contenedor principal */}
      <div className="fixed bottom-28 right-4 z-[2000] pointer-events-none">
        {/* Burbuja de diálogo */}
        <AnimatePresence>
          {mostrarBurbuja && mensajeActual && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: 20 }}
              transition={{ type: 'spring', damping: 15 }}
              className="absolute bottom-full right-0 mb-4 min-w-[200px] max-w-[250px] pointer-events-auto"
            >
              {/* Burbuja estilo cómic */}
              <div className="bg-white rounded-3xl shadow-2xl p-4 border-4 border-emerald-400 relative">
                {/* Triángulo */}
                <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white border-b-4 border-r-4 border-emerald-400 transform rotate-45" />
                
                <p className="text-gray-700 text-sm leading-relaxed">
                  {mensajeActual}
                </p>
                
                {/* Decoración de la burbuja */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xs">
                  {nivel}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* El compañero */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative cursor-pointer pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setMostrarBurbuja(!mostrarBurbuja);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Cuerpo principal (forma de gota) */}
          <div className="relative">
            {/* Cuerpo */}
            <div 
              className={`${colores.principal} rounded-t-full rounded-b-3xl 
                         shadow-xl border-4 border-white
                         flex flex-col items-center justify-end pb-3
                         overflow-hidden`}
              style={{ 
                width: tamaño, 
                height: tamaño * 1.2,
              }}
            >
              {/* Pancita */}
              <div className={`${colores.secundario} w-4/5 h-2/5 rounded-t-full mb-2`} />
              
              {/* Cara */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-full">
                {/* Ojos */}
                <div className="flex justify-center space-x-4 mb-1">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                </div>
                
                {/* Boca */}
                <div className={`text-2xl text-center ${expresion.color}`}>
                  {expresion.boca}
                </div>
              </div>
            </div>

            {/* Orejas/antenas (crecen con nivel) */}
            <div className="absolute -top-3 left-2">
              <div className={`${colores.principal} w-4 h-6 rounded-t-full transform -rotate-12 border-2 border-white`} />
            </div>
            <div className="absolute -top-3 right-2">
              <div className={`${colores.principal} w-4 h-6 rounded-t-full transform rotate-12 border-2 border-white`} />
            </div>

            {/* Accesorios por nivel */}
            {nivel >= 2 && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                {nivel === 2 && <span className="text-xl">✨</span>}
                {nivel === 3 && <span className="text-2xl">⭐</span>}
                {nivel === 4 && <span className="text-2xl">🌟</span>}
                {nivel === 5 && <span className="text-2xl">👑</span>}
              </div>
            )}

            {/* Mejillas (nivel 3+) */}
            {nivel >= 3 && (
              <>
                <div className="absolute bottom-1/3 left-1 w-3 h-2 bg-pink-300 rounded-full opacity-60" />
                <div className="absolute bottom-1/3 right-1 w-3 h-2 bg-pink-300 rounded-full opacity-60" />
              </>
            )}
          </div>

          {/* Indicador de nivel (discreto) */}
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 
                        bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 
                        border border-emerald-400">
            <span className="text-white text-[9px] font-bold">
              NIVEL {nivel}
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CompaneroVirtual;