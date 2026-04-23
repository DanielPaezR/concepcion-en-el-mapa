import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, MessageCircle } from 'lucide-react';
import Avatar from '../components/Avatar';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import RegistroModal from '../components/RegistroModal';

function SolicitarGuia() {
  const params = useParams();
  const lugarId = params.lugarId || params.id;
  const navigate = useNavigate();
  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mensajeAvatar, setMensajeAvatar] = useState('¡Te ayudo a encontrar un guía perfecto para ti!');
  const usuario = getTuristaActual();
  const esAnonimo = !usuario || usuario.anonimo === true;
  const [horarioLugar, setHorarioLugar] = useState(null);

  
  const [formData, setFormData] = useState({
    fecha_encuentro: '',
    hora_encuentro: '',
    numero_personas: 1,
    intereses: [],
    punto_encuentro: ''
  });

  const opcionesIntereses = [
    'Historia', 'Naturaleza', 'Gastronomía', 'Fotografía', 
    'Cultura local', 'Aventura', 'Arquitectura', 'Café'
  ];

  useEffect(() => {
    if (lugarId) {
        cargarLugar();
    }
  }, [lugarId]);

  const cargarLugar = async () => {
    try {
      const response = await api.get(`/lugares/${lugarId}`);
        setLugar(response.data);
        setHorarioLugar(response.data.horario || '9:00-17:00');
    } catch (error) {
      console.error('Error al cargar lugar:', error);
      setMensajeAvatar('Hubo un error al cargar la información del lugar');
    } finally {
      setCargando(false);
    }
  };

  const validarFechaHora = (fecha, hora) => {
    const hoy = new Date();
    const fechaSeleccionada = new Date(`${fecha}T${hora}`);
    
    // No puede ser en el pasado
    if (fechaSeleccionada < hoy) {
        return { valido: false, error: 'No puedes seleccionar una fecha/hora pasada' };
    }
    
    // Solo hoy
    const hoyStr = hoy.toISOString().split('T')[0];
    if (fecha !== hoyStr) {
        return { valido: false, error: 'Solo puedes agendar reservas para el día de hoy' };
    }
    
    // Verificar horario del lugar (ej: "9:00-17:00")
    if (horarioLugar) {
        const [horaInicio, horaFin] = horarioLugar.split('-');
        const horaSeleccionada = parseInt(hora.split(':')[0]);
        const horaInicioInt = parseInt(horaInicio);
        const horaFinInt = parseInt(horaFin);
        
        if (horaSeleccionada < horaInicioInt || horaSeleccionada >= horaFinInt) {
            return { valido: false, error: `El horario de atención es de ${horaInicio}:00 a ${horaFin}:00` };
        }
    }
    
    return { valido: true };
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
    
    // Verificar si el usuario está registrado (no anónimo)
    if (esAnonimo) {
      setMensajeAvatar('¡Casi listo, Explorador! Regístrate para que el Pato de Torrentes te encuentre un guía.');
      setMostrarRegistro(true);
      return;
    }
    
    if (!formData.fecha_encuentro || !formData.hora_encuentro) {
        alert('Por favor selecciona fecha y hora');
        return;
    }
    
    // Validar fecha y hora
    const validacion = validarFechaHora(formData.fecha_encuentro, formData.hora_encuentro);
    if (!validacion.valido) {
        alert(validacion.error);
        return;
    }
    
    if (enviando) return;
    setEnviando(true);
    
    try {
        const fechaHora = `${formData.fecha_encuentro}T${formData.hora_encuentro}:00`;
        
        const reservaData = {
            lugar_id: parseInt(lugarId),
            fecha_encuentro: fechaHora,
            numero_personas: parseInt(formData.numero_personas),
            intereses: formData.intereses.join(', '),
            punto_encuentro: formData.punto_encuentro || lugar?.direccion
        };

        const response = await api.post('/reservas', reservaData);
        
        // ✅ GUARDAR LA RESERVA EN localStorage
        const reserva = response.data.reserva;
        localStorage.setItem('ultima_reserva', JSON.stringify({
            id: reserva.id,
            estado: reserva.estado,
            lugar: lugar.nombre,
            fecha: fechaHora
        }));
        
        setMensajeAvatar('¡Solicitud enviada! Un guía te contactará pronto.');
        setTimeout(() => {
            navigate(`/lugar/${lugarId}`);
        }, 3000);
    } catch (error) {
        console.error('Error al crear reserva:', error);
        setMensajeAvatar('Hubo un error. Por favor, intenta de nuevo.');
        setEnviando(false);
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

        {/* Mensaje si es anónimo */}
        {usuario?.anonimo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm text-center">
              📝 Para solicitar un guía, necesitas registrarte. ¡Es rápido y gratis!
            </p>
          </div>
        )}

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

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={enviando || (usuario?.anonimo)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold
                     hover:bg-green-700 transition-colors disabled:bg-gray-400
                     flex items-center justify-center gap-2"
          >
            {enviando ? (
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

      {/* Modal de registro */}
      {mostrarRegistro && (
        <RegistroModal
          onClose={() => setMostrarRegistro(false)}
          onSuccess={() => {
            setMostrarRegistro(false);
            // Recargar para que el usuario ya no sea anónimo
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default SolicitarGuia;