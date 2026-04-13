import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react';

const mensajes = {
  bienvenida: "¡Hola! Soy tu guía virtual. Explora el mapa y descubre los tesoros de Concepción, Antioquia.",
  lugar: "¡Qué lugar tan interesante! ¿Quieres conocer más?",
  guia: "¿Necesitas un guía? Puedo ayudarte a encontrar al mejor para ti.",
  clima: "Revisa el clima antes de tu visita para que disfrutes al máximo.",
  gracias: "¡Gracias por tu opinión! Vuelve pronto.",
}

export default function Avatar({ mensaje = "bienvenida", animacion = "saludo" }) {
  const [mostrar, setMostrar] = useState(true)
  const [texto, setTexto] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (mensajes[mensaje]) {
      setTexto('')
      setIndex(0)
    }
  }, [mensaje])

  useEffect(() => {
    if (index < (mensajes[mensaje]?.length || 0)) {
      const timeout = setTimeout(() => {
        setTexto(prev => prev + mensajes[mensaje][index])
        setIndex(prev => prev + 1)
      }, 30)
      return () => clearTimeout(timeout)
    }
  }, [index, mensaje])

  return (
    <AnimatePresence>
      {mostrar && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex items-center space-x-3">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center"
              >
                <span className="text-3xl">🎭</span>
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Guía Virtual</h3>
                <p className="text-primary-100 text-xs">Tu compañero de viaje</p>
              </div>
              <button
                onClick={() => setMostrar(false)}
                className="text-white hover:text-primary-100"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-lg p-3 shadow-sm"
              >
                <p className="text-gray-700 text-sm">{texto}</p>
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-primary-500 inline-block ml-1"
                />
              </motion.div>
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setMostrar(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}