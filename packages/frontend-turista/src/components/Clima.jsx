import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// NOTA: Esta es una versión mock para desarrollo
// Reemplazar con API real de OpenWeatherMap usando coordenadas de Concepción, Antioquia
export default function Clima() {
  const [clima, setClima] = useState(null)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    // Simular carga de clima para Concepción, Antioquia
    setTimeout(() => {
      setClima({
        temperatura: 22,
        descripcion: 'Parcialmente nublado',
        icono: '☁️',
        humedad: 65,
        viento: 12
      })
    }, 1000)
  }, [])

  if (!clima) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 animate-pulse">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAbierto(!abierto)}
        className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2"
      >
        <span className="text-2xl">{clima.icono}</span>
        <span className="font-semibold">{clima.temperatura}°C</span>
      </motion.button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-4 w-64"
          >
            <h4 className="font-bold mb-2">Clima en Concepción, Antioquia</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperatura:</span>
                <span className="font-semibold">{clima.temperatura}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descripción:</span>
                <span className="font-semibold">{clima.descripcion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Humedad:</span>
                <span className="font-semibold">{clima.humedad}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Viento:</span>
                <span className="font-semibold">{clima.viento} km/h</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}