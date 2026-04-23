import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react';

const mensajes = {
  bienvenida: "¡Saludos, viajero! Soy el Explorador de la Villa. Juntos descubriremos los secretos ocultos en estas tierras.",
  lugar: "¡Vaya hallazgo! Este lugar respira historia. ¿Quieres que te cuente sus secretos?",
  guia: "¿Necesitas un guía? Puedo ayudarte a encontrar al mejor para ti.",
  clima: "Revisa el clima antes de tu visita para que disfrutes al máximo.",
  gracias: "¡Gracias por tu opinión! Vuelve pronto.",
}

const emociones = {
  alegre: { emoji: "🤠", color: "from-green-600 to-emerald-700", shadow: "shadow-green-500/50" },
  pensativo: { emoji: "🕵️", color: "from-amber-700 to-orange-800", shadow: "shadow-orange-500/50" },
  sorprendido: { emoji: "🏔️", color: "from-blue-500 to-cyan-600", shadow: "shadow-blue-500/50" },
  ayuda: { emoji: "📜", color: "from-yellow-600 to-amber-700", shadow: "shadow-yellow-500/50" },
  guardian: { emoji: "⚔️", color: "from-slate-700 to-slate-900", shadow: "shadow-slate-500/50" }
}

export default function Avatar({ mensaje = "bienvenida", emocion = "alegre", nivel = 1 }) {
  const [mostrar, setMostrar] = useState(true)
  const [texto, setTexto] = useState('')
  const [index, setIndex] = useState(0)

  // Configuración visual basada en nivel
  const getConfigNivel = () => {
    if (nivel >= 5) return { border: "border-yellow-400", shadow: "shadow-yellow-500/60", badge: "👑", glow: "animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.5)]" };
    if (nivel >= 3) return { border: "border-amber-600", shadow: "shadow-amber-500/40", badge: "🛡️", glow: "" };
    return { border: "border-white", shadow: "shadow-2xl", badge: "" };
  };

  const configNivel = getConfigNivel();

  // Determinar el contenido del mensaje (si es clave de diccionario o string directo)
  const contenidoMensaje = mensajes[mensaje] || mensaje;
  const estiloEmocion = emociones[emocion] || emociones.alegre;

  useEffect(() => {
    setTexto('')
    setIndex(0)
  }, [contenidoMensaje])

  useEffect(() => {
    if (index < (contenidoMensaje?.length || 0)) {
      const timeout = setTimeout(() => {
        setTexto(prev => prev + contenidoMensaje[index])
        setIndex(prev => prev + 1)
      }, 30)
      return () => clearTimeout(timeout)
    }
  }, [index, contenidoMensaje])

  return (
    <AnimatePresence>
      {mostrar && (
        <motion.div
          initial={{ y: 50, x: 50, scale: 0, opacity: 0 }}
          animate={{ y: 0, x: 0, scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-4 left-4 md:left-auto md:w-80 z-[3000]"
        >
          <div className={`bg-white/90 backdrop-blur-md rounded-3xl ${configNivel.shadow} ${configNivel.glow} overflow-hidden border-2 ${configNivel.border}`}>
            {/* Header dinámico según emoción */}
            <div className={`bg-gradient-to-r ${estiloEmocion.color} p-4 flex items-center space-x-3`}>
              <motion.div
                animate={{
                  y: [0, -5, 0], // Animación de flotar (Idle)
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg relative`}
              >
                <span className="text-4xl">{estiloEmocion.emoji}</span>
                <span className="absolute -top-2 -right-2 text-xl">{configNivel.badge}</span>
              </motion.div>
              <div className="flex-1">
                <h3 className="font-black text-white uppercase tracking-wider text-sm">Explorador Nv. {nivel}</h3>
                <div className="h-1 w-full bg-white/30 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '70%' }} 
                        className="h-full bg-white" 
                    />
                </div>
              </div>
              <button
                onClick={() => setMostrar(false)}
                className="text-white hover:text-primary-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white/50">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white/80 rounded-xl p-3 shadow-inner border border-gray-100"
              >
                <p className="text-gray-800 text-sm font-medium leading-relaxed">{texto}</p>
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-green-500 inline-block ml-1 align-middle"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}