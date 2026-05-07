// pages/LandingPage.jsx (frontend-admin)
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Calendar, 
  BarChart3, 
  MapPin, 
  Award,
  Bell,
  CheckCircle,
  Settings,
  MessageSquare,
  Star,
  Clock,
  ChevronRight,
  Crown
} from 'lucide-react';

export default function LandingPage() {
  const adminFeatures = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Gestión de Lugares',
      description: 'Crea, edita y administra todos los puntos turísticos del municipio con mapa interactivo.'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Eventos y Retos',
      description: 'Crea eventos diarios, preguntas, pistas y retos para mantener la experiencia dinámica.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Dashboard de Métricas',
      description: 'Visualiza estadísticas en tiempo real: visitantes, lugares más visitados y tendencias.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Gestión de Guías',
      description: 'Administra los guías turísticos, revisa sus calificaciones y disponibilidad.'
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Notificaciones',
      description: 'Gestiona alertas y novedades para mantener informados a los turistas.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Insignias y Logros',
      description: 'Configura las insignias que los turistas pueden ganar durante su experiencia.'
    }
  ];

  const guideFeatures = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Gestión de Reservas',
      description: 'Visualiza y administra las solicitudes de guianza asignadas a tu perfil.'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Disponibilidad',
      description: 'Activa o desactiva tu disponibilidad para recibir nuevas solicitudes de turistas.'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Calificaciones',
      description: 'Consulta tus calificaciones y comentarios de los turistas que has guiado.'
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Comunicación',
      description: 'Recibe notificaciones en tiempo real cuando un turista solicita tus servicios.'
    }
  ];

  const roles = [
    {
      nombre: 'Administrador',
      icon: <Crown className="w-12 h-12" />,
      color: 'from-purple-600 to-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Control total de la plataforma. Gestión de lugares, eventos, usuarios y métricas.',
      features: [
        'CRUD completo de lugares turísticos',
        'Creación de eventos y retos diarios',
        'Dashboard con estadísticas en tiempo real',
        'Gestión de guías y calificaciones',
        'Configuración de insignias y logros',
        'Reportes exportables (PDF/Excel)'
      ]
    },
    {
      nombre: 'Guía Turístico',
      icon: <Shield className="w-12 h-12" />,
      color: 'from-green-600 to-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Acompaña a los turistas en su recorrido por Concepción y recibe calificaciones.',
      features: [
        'Ver reservas asignadas (hoy/próximas/pasadas)',
        'Confirmar o cancelar reservas',
        'Marcar disponibilidad en tiempo real',
        'Consultar calificaciones recibidas',
        'Notificaciones de nuevas solicitudes',
        'Historial de recorridos realizados'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <Shield className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Concepción en el Mapa
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-300">
              Panel de Control
            </p>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Plataforma de administración y gestión para operadores turísticos, 
              administradores y guías del municipio de Concepción, Antioquia.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
            >
              Acceder al Panel <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
        
        {/* Ola decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36,5.37,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,70.24,2.46,136.33,16.31,206.57,13.85,70.24-2.46,136.33-16.31,206.57-13.85,0,0Z" 
                  fill="#f3f4f6" opacity="0.9"></path>
          </svg>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Perfiles de Acceso
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              La plataforma cuenta con dos perfiles principales según el rol del usuario
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roles.map((rol, index) => (
              <motion.div
                key={rol.nombre}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${rol.bgColor} rounded-2xl p-6 border ${rol.borderColor} shadow-lg`}
              >
                <div className={`bg-gradient-to-r ${rol.color} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                  {rol.icon}
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{rol.nombre}</h3>
                <p className="text-gray-600 text-center mb-6">{rol.description}</p>
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Funcionalidades:
                  </h4>
                  <ul className="space-y-2">
                    {rol.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section className="py-20 bg-white px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Funcionalidades del Administrador
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Control total sobre la plataforma turística del municipio
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="bg-purple-100 text-purple-600 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide Features */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Funcionalidades del Guía
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas para brindar el mejor servicio a los turistas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guideFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition text-center"
              >
                <div className="bg-green-100 text-green-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credenciales de Prueba */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center"
          >
            <h3 className="text-xl font-bold text-yellow-800 mb-4">🔐 Credenciales de Prueba</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white rounded-lg p-4">
                <p className="font-bold text-purple-700 mb-2">👑 Administrador</p>
                <p className="text-sm text-gray-600">Email: admin@concepcion.cl</p>
                <p className="text-sm text-gray-600">Contraseña: admin123</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-bold text-green-700 mb-2">🛡️ Guía</p>
                <p className="text-sm text-gray-600">Email: guia1@concepcion.cl</p>
                <p className="text-sm text-gray-600">Contraseña: admin123</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-10 text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Ya tienes una cuenta?
            </h2>
            <p className="text-gray-300 mb-6">
              Accede al panel de control para gestionar la plataforma turística de Concepción.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Iniciar Sesión <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t bg-white">
        <p>© 2026 Concepción en el Mapa - Municipio de Concepción, Antioquia</p>
        <p className="mt-1">Panel de Administración y Gestión Turística</p>
      </footer>
    </div>
  );
}