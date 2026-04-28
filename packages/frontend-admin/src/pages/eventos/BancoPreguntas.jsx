import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import MapaCoordenadas from '../../components/MapaCoordenadas';

export default function BancoPreguntas() {
  const [preguntas, setPreguntas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoEvento, setTipoEvento] = useState('pregunta'); // 'pregunta', 'pistas', 'reunion', 'reto'
  const [usarMapa, setUsarMapa] = useState(true);
  
  // Estado para nueva pregunta/reto
  const [nuevaPregunta, setNuevaPregunta] = useState({ 
    pregunta: '', 
    respuesta: '', 
    dificultad: 1,
    pistas: ['', '', ''],
    duracion: 30,
    puntos: 50
  });
  
  // Estado para nueva ubicación
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ 
    nombre: '', 
    latitud: '', 
    longitud: '', 
    radio: 50,
    descripcion: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [preguntasRes, ubicacionesRes] = await Promise.all([
        api.get('/admin/eventos/preguntas'),
        api.get('/admin/eventos/ubicaciones')
      ]);
      setPreguntas(preguntasRes.data);
      setUbicaciones(ubicacionesRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCoordenadasChange = (lat, lng) => {
    setNuevaUbicacion(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng
    }));
  };

  const agregarPregunta = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (tipoEvento === 'pregunta') {
        data = {
          tipo: 'pregunta',
          pregunta: nuevaPregunta.pregunta,
          respuesta: nuevaPregunta.respuesta,
          dificultad: nuevaPregunta.dificultad,
          puntos: nuevaPregunta.puntos
        };
      } else if (tipoEvento === 'pistas') {
        data = {
          tipo: 'pistas',
          pregunta: nuevaPregunta.pregunta,
          respuesta: nuevaPregunta.respuesta,
          pistas: nuevaPregunta.pistas.filter(p => p.trim() !== ''),
          puntos: nuevaPregunta.puntos
        };
      } else if (tipoEvento === 'reto') {
        data = {
          tipo: 'reto',
          pregunta: nuevaPregunta.pregunta,
          respuesta: nuevaPregunta.respuesta,
          duracion: nuevaPregunta.duracion,
          puntos: nuevaPregunta.puntos
        };
      } else if (tipoEvento === 'reunion') {
        data = {
          tipo: 'reunion',
          pregunta: 'Punto de encuentro',
          respuesta: 'asistencia',
          puntos: nuevaPregunta.puntos
        };
      }
      
      await api.post('/admin/eventos/preguntas', data);
      toast.success(`${getTipoTexto()} agregado`);
      resetFormulario();
      cargarDatos();
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  const agregarUbicacion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/eventos/ubicaciones', nuevaUbicacion);
      toast.success('Ubicación agregada');
      setNuevaUbicacion({ nombre: '', latitud: '', longitud: '', radio: 50, descripcion: '' });
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  const eliminarPregunta = async (id) => {
    if (confirm('¿Eliminar este evento?')) {
      try {
        await api.delete(`/admin/eventos/preguntas/${id}`);
        toast.success('Eliminado');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const eliminarUbicacion = async (id) => {
    if (confirm('¿Eliminar esta ubicación?')) {
      try {
        await api.delete(`/admin/eventos/ubicaciones/${id}`);
        toast.success('Eliminada');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const resetFormulario = () => {
    setNuevaPregunta({ 
      pregunta: '', 
      respuesta: '', 
      dificultad: 1,
      pistas: ['', '', ''],
      duracion: 30,
      puntos: 50
    });
    setMostrarForm(false);
    setTipoEvento('pregunta');
  };

  const getTipoTexto = () => {
    switch(tipoEvento) {
      case 'pregunta': return 'Pregunta';
      case 'pistas': return 'Evento con pistas';
      case 'reto': return 'Reto contrarreloj';
      case 'reunion': return 'Punto de encuentro';
      default: return 'Evento';
    }
  };

  const getTipoBadge = (tipo) => {
    switch(tipo) {
      case 'pregunta': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">❓ Pregunta</span>;
      case 'pistas': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">🔍 Pistas</span>;
      case 'reto': return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">⏱️ Reto</span>;
      case 'reunion': return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">📍 Reunión</span>;
      default: return null;
    }
  };

  const renderFormularioEvento = () => {
    switch(tipoEvento) {
      case 'pregunta':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Pregunta *</label>
              <input
                type="text"
                value={nuevaPregunta.pregunta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Respuesta correcta *</label>
              <input
                type="text"
                value={nuevaPregunta.respuesta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Dificultad</label>
                <select
                  value={nuevaPregunta.dificultad}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, dificultad: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                >
                  <option value={1}>Fácil (+50 XP)</option>
                  <option value={2}>Media (+60 XP)</option>
                  <option value={3}>Difícil (+80 XP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Puntos base</label>
                <input
                  type="number"
                  value={nuevaPregunta.puntos}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntos: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </>
        );
      
      case 'pistas':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Título del evento</label>
              <input
                type="text"
                value={nuevaPregunta.pregunta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Ej: Encuentra el tesoro escondido"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Respuesta final</label>
              <input
                type="text"
                value={nuevaPregunta.respuesta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Palabra o frase clave"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pistas (máximo 3)</label>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={nuevaPregunta.pistas[i]}
                  onChange={(e) => {
                    const nuevasPistas = [...nuevaPregunta.pistas];
                    nuevasPistas[i] = e.target.value;
                    setNuevaPregunta({ ...nuevaPregunta, pistas: nuevasPistas });
                  }}
                  className="w-full p-2 border rounded mb-2"
                  placeholder={`Pista ${i + 1}`}
                />
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Puntos</label>
              <input
                type="number"
                value={nuevaPregunta.puntos}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntos: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        );
      
      case 'reto':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del reto</label>
              <input
                type="text"
                value={nuevaPregunta.pregunta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Ej: Sube al mirador en 5 minutos"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condición para completar</label>
              <input
                type="text"
                value={nuevaPregunta.respuesta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Ej: Llegar a la cima"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tiempo límite (minutos)</label>
                <input
                  type="number"
                  value={nuevaPregunta.duracion}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, duracion: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Puntos</label>
                <input
                  type="number"
                  value={nuevaPregunta.puntos}
                  onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntos: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </>
        );
      
      case 'reunion':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del punto de encuentro</label>
              <input
                type="text"
                value={nuevaPregunta.pregunta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Ej: Encuentro de exploradores"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Puntos por asistir</label>
              <input
                type="number"
                value={nuevaPregunta.puntos}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntos: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">📌 Los puntos de encuentro no requieren respuesta, solo escanear el QR</p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center py-12">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Banco de Eventos</h1>
          <p className="text-sm text-gray-500 mt-1">Crea preguntas, retos y puntos de encuentro para los eventos diarios</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Nuevo Evento
        </button>
      </div>

      {/* Formulario de creación */}
      {mostrarForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">✏️ Crear nuevo evento</h3>
            <button onClick={() => setMostrarForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tipo de evento</label>
            <div className="flex gap-2">
              {[
                { value: 'pregunta', label: '❓ Pregunta', color: 'blue' },
                { value: 'pistas', label: '🔍 Pistas', color: 'purple' },
                { value: 'reto', label: '⏱️ Reto', color: 'orange' },
                { value: 'reunion', label: '📍 Reunión', color: 'green' }
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setTipoEvento(tipo.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    tipoEvento === tipo.value
                      ? `bg-${tipo.color}-600 text-white`
                      : `bg-${tipo.color}-100 text-${tipo.color}-800 hover:bg-${tipo.color}-200`
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={agregarPregunta} className="space-y-4">
            {renderFormularioEvento()}
            
            <div className="pt-4 flex gap-3">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                Guardar {getTipoTexto()}
              </button>
              <button type="button" onClick={resetFormulario} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sección de ubicaciones */}
      <div>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">📍 Ubicaciones disponibles</h2>
        <button
          onClick={() => {
            setMostrarForm(true);
            setTipoEvento('ubicacion');
          }}
          className="mb-4 text-sm bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300"
        >
          + Agregar ubicación
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ubicaciones.map((u) => (
            <div key={u.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{u.nombre}</p>
                <p className="text-sm text-gray-500">📌 Lat: {u.latitud}, Lng: {u.longitud}</p>
                {u.descripcion && <p className="text-xs text-gray-400">{u.descripcion}</p>}
              </div>
              <button onClick={() => eliminarUbicacion(u.id)} className="text-red-600">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de preguntas/eventos */}
      <div>
        <h2 className="text-xl font-bold mb-3">📋 Eventos disponibles</h2>
        <div className="space-y-2">
          {preguntas.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getTipoBadge(p.tipo || 'pregunta')}
                  <p className="font-medium">{p.pregunta}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Respuesta: {p.respuesta} | {p.puntos || 50} XP
                  {p.dificultad && ` | Dificultad: ${p.dificultad}`}
                  {p.duracion && ` | ⏱️ {p.duracion} min`}
                </p>
                {p.pistas && p.pistas.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">🔍 {p.pistas.filter(pi => pi).join(' → ')}</p>
                )}
              </div>
              <button onClick={() => eliminarPregunta(p.id)} className="text-red-600 ml-3">🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}