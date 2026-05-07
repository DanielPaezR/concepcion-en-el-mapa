// pages/LandingPage.jsx (frontend-turista)
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Map, 
  Shield, 
  Camera, 
  Trophy, 
  Star, 
  Zap, 
  Users, 
  Calendar,
  ChevronRight,
  Smartphone,
  Compass,
  Award,
  Sparkles,
  Heart,
  MessageCircle,
  Crown
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Map className="w-8 h-8" />,
      title: 'Mapa Interactivo',
      description: 'Explora todos los puntos turísticos de Concepción con marcadores personalizados y descubre lugares cercanos.'
    },
    {
      icon: <Compass className="w-8 h-8" />,
      title: 'Descubrimiento Automático',
      description: 'Acércate a los lugares y desbloquéalos para ganar experiencia y subir de nivel.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Guardianes',
      description: 'Conviértete en guardián de tus lugares favoritos y protégelos en el mapa.'
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Galería de Recuerdos',
      description: 'Comparte tus fotos y recuerdos del municipio. ¡Desbloquea insignias especiales!'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Eventos Diarios',
      description: 'Participa en retos, preguntas y misiones especiales para ganar XP extra.'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Sistema de Logros',
      description: 'Gana insignias por descubrir lugares, completar eventos y alcanzar nuevos niveles.'
    }
  ];

  const levels = [
    { nivel: 1, nombre: '🌱 Principiante', descripcion: 'Comienza tu aventura en Concepción', color: 'from-green-600 to-green-400' },
    { nivel: 2, nombre: '⭐ Explorador', descripcion: 'Ya conoces los primeros lugares', color: 'from-blue-600 to-blue-400' },
    { nivel: 3, nombre: '⚡ Aventurero', descripcion: 'Eres un viajero experimentado', color: 'from-indigo-600 to-indigo-400' },
    { nivel: 4, nombre: '🛡️ Guardián', descripcion: 'Proteges los tesoros del pueblo', color: 'from-amber-600 to-amber-400' },
    { nivel: 5, nombre: '👑 Leyenda', descripcion: '¡Has conquistado todo Concepción!', color: 'from-red-600 to-red-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <Map className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Concepción en el Mapa
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-green-100">
              Descubre, explora y vive la magia del municipio antioqueño
            </p>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Una experiencia turística gamificada que te invita a recorrer cada rincón, 
              ganar recompensas y convertirte en parte de la historia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/mapa"
                className="bg-white text-green-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                Comenzar Aventura <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="bg-green-800/50 backdrop-blur text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-800 transition"
              >
                Conoce más
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Ola decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36,5.37,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57-13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57-13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57,13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,0,0Z" 
                  fill="#f0fdf4" opacity="0.9"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Una experiencia única que combina turismo, tecnología y gamificación
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-center"
              >
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sistema de Niveles */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-purple-200 rounded-full p-3">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sistema de Niveles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada lugar que descubres te da experiencia. ¡Sube de nivel y conviértete en una leyenda!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {levels.map((level, index) => (
              <motion.div
                key={level.nivel}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gradient-to-r ${level.color} rounded-xl p-4 text-white text-center shadow-lg`}
              >
                <div className="text-3xl mb-2">{level.nombre.split(' ')[0]}</div>
                <div className="font-bold text-lg">{level.nombre}</div>
                <div className="text-xs opacity-90 mt-1">{level.descripcion}</div>
                <div className="mt-2 text-sm font-bold">Nivel {level.nivel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Insignias Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-200 rounded-full p-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Insignias y Logros
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Completa desafíos, descubre lugares y participa en eventos para ganar insignias exclusivas
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Curioso Viajero', req: 'Descubre 5 lugares', emoji: '🗺️' },
              { name: 'Fotógrafo', req: 'Sube 3 fotos', emoji: '📷' },
              { name: 'Primer Evento', req: 'Completa un evento', emoji: '🎯' },
              { name: 'Primer Guardián', req: 'Ancla tu primer guardián', emoji: '🛡️' },
              { name: 'Explorador Estrella', req: 'Alcanza nivel 5', emoji: '⭐' },
              { name: 'Leyenda', req: 'Alcanza nivel 20', emoji: '👑' }
            ].map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-4 shadow-md text-center min-w-[140px]"
              >
                <div className="text-3xl mb-2">{badge.emoji}</div>
                <div className="font-bold text-gray-800 text-sm">{badge.name}</div>
                <div className="text-xs text-gray-500 mt-1">{badge.req}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Estadísticas / Números */}
      <section className="py-20 bg-green-700 text-white px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">8+</div>
              <div className="text-green-100">Lugares Turísticos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-green-100">Insignias</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4</div>
              <div className="text-green-100">Tipos de Eventos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5</div>
              <div className="text-green-100">Niveles</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para la aventura?
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Explora Concepción como nunca antes. Descubre lugares, gana experiencia y conviértete en una leyenda.
            </p>
            <Link
              to="/mapa"
              className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Comenzar ahora <Sparkles className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t">
        <p>© 2026 Concepción en el Mapa - Municipio de Concepción, Antioquia</p>
        <p className="mt-1">Una experiencia turística gamificada</p>
      </footer>
    </div>
  );
}