// pages/LugarDetalle.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Users, Star, Clock, 
  ChevronLeft, Share2, Heart, Camera, 
  Navigation, Award, Info, Phone, Globe,
  Coffee, Landmark, TreePine, Utensils
} from 'lucide-react';
import api from '../services/api';
import CompaneroVirtual from '../components/CompaneroVirtual';
import { useState } from 'react';

export default function LugarDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAvatar, setShowAvatar] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mensajeCompanero, setMensajeCompanero] = useState('');

  console.log('🔍 ID desde URL:', id);

  const { data: lugar, isLoading } = useQuery({
    queryKey: ['lugar', id],
    queryFn: async () => {
      console.log('📡 Fetching lugar con ID:', id);
      const response = await api.get(`/lugares/${id}`);
      console.log('📦 Respuesta de API:', response.data);
      
      if (response.data?.success && response.data?.data) {
        console.log('✅ Usando response.data.data');
        // Mensaje del compañero al cargar el lugar
        setMensajeCompanero(`¡${response.data.data.nombre} es un lugar increíble! Aquí puedes aprender más sobre su historia y belleza.`);
        return response.data.data;
      }
      
      return response.data;
    },
  });

  // Array de imágenes (simulado por ahora, en el futuro vendrá del backend)
  const imagenes = lugar?.imagen_url 
    ? [lugar.imagen_url, ...(lugar.imagenes_extra || [])] 
    : ['https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'];

  const getTipoIcono = (tipo) => {
    const iconos = {
      historico: <Landmark className="w-5 h-5" />,
      natural: <TreePine className="w-5 h-5" />,
      cultural: <Users className="w-5 h-5" />,
      gastronomico: <Utensils className="w-5 h-5" />
    };
    return iconos[tipo] || <MapPin className="w-5 h-5" />;
  };

  const getTipoColor = (tipo) => {
    const colores = {
      historico: 'bg-red-500',
      natural: 'bg-green-500',
      cultural: 'bg-blue-500',
      gastronomico: 'bg-orange-500'
    };
    return colores[tipo] || 'bg-gray-500';
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      historico: 'Histórico',
      natural: 'Natural',
      cultural: 'Cultural',
      gastronomico: 'Gastronómico'
    };
    return textos[tipo] || tipo;
  };

  const handleSolicitarGuia = () => {
    if (lugar?.id) {
      setMensajeCompanero(`¡Excelente elección! Te ayudaré a encontrar el guía perfecto para ${lugar.nombre}.`);
      setTimeout(() => {
        navigate(`/solicitar-guia/${lugar.id}`);
      }, 1500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: lugar.nombre,
        text: lugar.descripcion,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setMensajeCompanero('¡Enlace copiado al portapapeles!');
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 border-4 border-t-transparent border-white rounded-full"
        />
      </motion.div>
    );
  }

  if (!lugar) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4 bg-gray-50"
      >
        <div className="text-center max-w-md">
          <div className="text-8xl mb-4">🏛️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lugar no encontrado</h2>
          <p className="text-gray-600 mb-6">El lugar que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg"
          >
            Volver al mapa
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Compañero Virtual */}
      <CompaneroVirtual 
        mensaje={mensajeCompanero}
        nivel={1}
        emocion="feliz"
      />

      {/* Header con imagen de fondo y navegación */}
      <div className="relative h-96 bg-gray-900">
        {/* Imagen principal */}
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
          src={selectedImage || lugar.imagen_url || imagenes[0]} 
          alt={lugar.nombre}
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Gradiente para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        
        {/* Botón de regreso */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate('/')}
          className="absolute top-12 left-4 bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/30"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </motion.button>

        {/* Botones de acción */}
        <div className="absolute top-12 right-4 flex space-x-2">
          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className="bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/30"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </motion.button>
          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleShare}
            className="bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/30"
          >
            <Share2 className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Tipo de lugar y nombre */}
        <div className="absolute bottom-6 left-4 right-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className={`inline-flex items-center gap-2 px-4 py-2 ${getTipoColor(lugar.tipo)} text-white rounded-full text-sm font-bold mb-3 shadow-lg`}>
              {getTipoIcono(lugar.tipo)}
              {getTipoTexto(lugar.tipo)}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2 drop-shadow-lg"
          >
            {lugar.nombre}
          </motion.h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        {/* Galería de imágenes (si hay más de una) */}
        {imagenes.length > 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Galería
            </h3>
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
              {imagenes.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 
                            ${selectedImage === img ? 'border-yellow-500' : 'border-transparent'}`}
                >
                  <img src={img} alt={`${lugar.nombre} ${index + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Descripción */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Acerca de este lugar
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {lugar.descripcion}
          </p>
        </motion.div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Dirección */}
          {lugar.direccion && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección
              </h3>
              <p className="text-gray-600">{lugar.direccion}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  window.open(`https://www.google.com/maps/search/?api=1&query=${lugar.latitud},${lugar.longitud}`);
                }}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Cómo llegar
              </motion.button>
            </motion.div>
          )}

          {/* Horario (simulado por ahora) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horario sugerido
            </h3>
            <p className="text-gray-600">Lunes a Domingo</p>
            <p className="text-gray-800 font-bold mt-1">9:00 AM - 5:00 PM</p>
            <p className="text-xs text-gray-500 mt-2">*Horario estimado, puede variar</p>
          </motion.div>
        </div>

        {/* Botón de solicitar guía */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSolicitarGuia}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:from-green-700 hover:to-green-600 transition-all mb-6 flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          Solicitar un Guía
        </motion.button>
      </div>
    </div>
  );
}