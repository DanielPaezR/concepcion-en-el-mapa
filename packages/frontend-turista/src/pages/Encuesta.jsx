import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../config/api'
import Avatar from '../components/Avatar'
import toast from 'react-hot-toast'

export default function Encuesta() {
  const { reservaId } = useParams()
  const navigate = useNavigate()
  const [showAvatar, setShowAvatar] = useState(true)
  const [calificacionGuia, setCalificacionGuia] = useState(0)
  const [calificacionExperiencia, setCalificacionExperiencia] = useState(0)
  const [comentarios, setComentarios] = useState('')
  const [sugerencias, setSugerencias] = useState('')
  const [origen, setOrigen] = useState('')

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/encuestas', {
        reserva_id: parseInt(reservaId),
        ...data
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('¡Gracias por tu opinión!')
      navigate('/')
    },
    onError: () => {
      toast.error('Error al enviar la encuesta')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      calificacion_guia: calificacionGuia,
      calificacion_experiencia: calificacionExperiencia,
      comentarios,
      sugerencias,
      origen_turista: origen
    })
  }

  const Estrellas = ({ valor, setValor, nombre }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          onClick={() => setValor(estrella)}
          className="focus:outline-none"
        >
          <svg
            className={`w-8 h-8 ${
              estrella <= valor ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Encuesta de Satisfacción</h1>
          <p className="text-sm text-gray-600 mt-1">Tu opinión nos ayuda a mejorar</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Califica a tu guía
              </label>
              <Estrellas valor={calificacionGuia} setValor={setCalificacionGuia} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Califica tu experiencia
              </label>
              <Estrellas valor={calificacionExperiencia} setValor={setCalificacionExperiencia} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows="3"
              className="input-field"
              placeholder="Cuéntanos cómo fue tu experiencia..."
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sugerencias
            </label>
            <textarea
              value={sugerencias}
              onChange={(e) => setSugerencias(e.target.value)}
              rows="2"
              className="input-field"
              placeholder="¿Qué podríamos mejorar?"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿De dónde nos visitas?
            </label>
            <input
              type="text"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              className="input-field"
              placeholder="Ciudad / País"
            />
          </motion.div>

          <motion.button
            type="submit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            disabled={mutation.isLoading || calificacionGuia === 0 || calificacionExperiencia === 0}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50"
          >
            {mutation.isLoading ? 'Enviando...' : 'Enviar Encuesta'}
          </motion.button>
        </form>
      </div>

      {/* Avatar */}
      {showAvatar && (
        <Avatar mensaje="gracias" />
      )}
    </div>
  )
}