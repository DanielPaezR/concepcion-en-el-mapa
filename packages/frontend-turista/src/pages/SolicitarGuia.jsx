// pages/SolicitarGuia.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, MessageCircle, Clock } from 'lucide-react';
import Avatar from '../components/Avatar';
import api from '../services/api';

function SolicitarGuia() {
  const params = useParams();
  const lugarId = params.lugarId || params.id;
  console.log('📍 lugarId recibido:', lugarId);
  console.log('📦 Todos los params:', params);
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [guiasDisponibles, setGuiasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensajeAvatar, setMensajeAvatar] = useState('¡Te ayudo a encontrar un guía perfecto para ti!');
  
  const [formData, setFormData] = useState({
    fecha_encuentro: '',
    hora_encuentro: '',
    numero_personas: 1,
    intereses: [],
    punto_encuentro: '',
    guia_preferido: ''
  });

  const opcionesIntereses = [
    'Historia', 'Naturaleza', 'Gastronomía', 'Fotografía', 
    'Cultura local', 'Aventura', 'Arquitectura', 'Café'
  ];

  useEffect(() => {
    console.log('📍 lugarId recibido:', lugarId);
    if (lugarId) {
      cargarLugar();
      cargarGuiasDisponibles();
    } else {
      console.error('❌ No se recibió lugarId');
      setCargando(false);
    }
  }, [lugarId]);

  const cargarLugar = async () => {
    try {
      setCargando(true);
      console.log('🔍 Solicitando lugar:', lugarId);
      const response = await api.get(`/lugares/${lugarId}`);
      console.log('✅ Lugar cargado:', response.data);
      setLugar(response.data);
      setMensajeAvatar(`Excelente elección! ${response.data.nombre} es maravilloso. ¿Para cuándo quieres tu recorrido?`);
    } catch (error) {
      console.error('Error al cargar lugar:', error);
      setMensajeAvatar('Hubo un error al cargar la información del lugar');
    } finally {
      setCargando(false);
    }
  };

  const cargarGuiasDisponibles = async () => {
    try {
      const response = await api.get('/reservas/disponibles').catch(err => {
        if (err.response?.status === 401) {
          console.log('ℹ️ Endpoint de guías requiere autenticación');
          return { data: [] };
        }
        throw err;
      });
      setGuiasDisponibles(response.data || []);
    } catch (error) {
      console.error('Error al cargar guías:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInteresToggle = (interes) => {
    setFormData(prev => ({
      ...prev,
      intereses: prev.intereses.includes(interes)
        ? prev.intereses.filter(i => i !== interes)
        : [...prev.intereses, interes]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar que haya fecha y hora
      if (!formData.fecha_encuentro || !formData.hora_encuentro) {
        alert('Por favor selecciona fecha y hora');
        setLoading(false);
        return;
      }

      // Combinar fecha y hora
      const fechaHora = `${formData.fecha_encuentro}T${formData.hora_encuentro}:00`;
      
      const reservaData = {
        lugar_id: parseInt(lugarId), // ✅ CORREGIDO: usar lugarId en lugar de id
        fecha_encuentro: fechaHora,
        numero_personas: parseInt(formData.numero_personas),
        intereses: formData.intereses.join(', '),
        punto_encuentro: formData.punto_encuentro || lugar?.direccion
      };

      console.log('📝 Enviando reserva:', reservaData);
      await api.post('/reservas', reservaData);
      
      setMensajeAvatar('¡Solicitud enviada! Te notificaremos cuando un guía sea asignado.');
      setTimeout(() => {
        navigate(`/lugar/${lugarId}`); // Volver al detalle del lugar
      }, 3000);
    } catch (error) {
      console.error('Error al crear reserva:', error);
      setMensajeAvatar('Hubo un error. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!lugar) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lugar no encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
      {/* Avatar flotante */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm p-4">
        <Avatar mensaje={mensajeAvatar} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Info del lugar */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {lugar.imagen_url && (
            <img 
              src={lugar.imagen_url} 
              alt={lugar.nombre}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800">{lugar.nombre}</h1>
            <p className="text-gray-600 mt-1">{lugar.descripcion}</p>
          </div>
        </div>

        {/* Formulario de solicitud */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-green-600" />
            Detalles de tu visita
          </h2>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del recorrido
              </label>
              <input
                type="date"
                name="fecha_encuentro"
                value={formData.fecha_encuentro}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                name="hora_encuentro"
                value={formData.hora_encuentro}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Número de personas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="inline w-4 h-4 mr-1" />
              Número de personas
            </label>
            <input
              type="number"
              name="numero_personas"
              value={formData.numero_personas}
              onChange={handleInputChange}
              min="1"
              max="20"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Intereses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="inline w-4 h-4 mr-1" />
              ¿Qué te interesa?
            </label>
            <div className="flex flex-wrap gap-2">
              {opcionesIntereses.map(interes => (
                <button
                  key={interes}
                  type="button"
                  onClick={() => handleInteresToggle(interes)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                    ${formData.intereses.includes(interes)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {interes}
                </button>
              ))}
            </div>
          </div>

          {/* Punto de encuentro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="inline w-4 h-4 mr-1" />
              Punto de encuentro
            </label>
            <input
              type="text"
              name="punto_encuentro"
              value={formData.punto_encuentro}
              onChange={handleInputChange}
              placeholder={lugar.direccion || "Ej: Entrada principal"}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no especificas, nos encontraremos en la dirección del lugar
            </p>
          </div>

          {/* Guías disponibles */}
          {guiasDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Guías disponibles (opcional)
              </label>
              <select
                name="guia_preferido"
                value={formData.guia_preferido}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Cualquier guía disponible</option>
                {guiasDisponibles.map(guia => (
                  <option key={guia.id} value={guia.id}>
                    {guia.nombre} ⭐ {guia.calificacion_promedio || 'Nuevo'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold
                     hover:bg-green-700 transition-colors disabled:bg-gray-400
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enviando solicitud...
              </>
            ) : (
              '¡Solicitar mi guía!'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SolicitarGuia;