import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BancoPreguntas() {
  const [preguntas, setPreguntas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaPregunta, setNuevaPregunta] = useState({ pregunta: '', respuesta: '', dificultad: 1 });
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ nombre: '', latitud: '', longitud: '', radio: 50 });

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

  const agregarPregunta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/bancos/preguntas', nuevaPregunta);
      toast.success('Pregunta agregada');
      setNuevaPregunta({ pregunta: '', respuesta: '', dificultad: 1 });
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  const agregarUbicacion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/bancos/ubicaciones', nuevaUbicacion);
      toast.success('Ubicación agregada');
      setNuevaUbicacion({ nombre: '', latitud: '', longitud: '', radio: 50 });
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  const eliminarPregunta = async (id) => {
    if (confirm('¿Eliminar esta pregunta?')) {
      try {
        await api.delete(`/admin/bancos/preguntas/${id}`);
        toast.success('Eliminada');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const eliminarUbicacion = async (id) => {
    if (confirm('¿Eliminar esta ubicación?')) {
      try {
        await api.delete(`/admin/bancos/ubicaciones/${id}`);
        toast.success('Eliminada');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banco de Eventos</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          + Agregar
        </button>
      </div>

      {mostrarForm && (
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
          {/* Formulario pregunta */}
          <div>
            <h3 className="font-bold mb-3">➕ Nueva Pregunta</h3>
            <form onSubmit={agregarPregunta} className="space-y-3">
              <input
                type="text"
                placeholder="Pregunta"
                value={nuevaPregunta.pregunta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Respuesta correcta"
                value={nuevaPregunta.respuesta}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <select
                value={nuevaPregunta.dificultad}
                onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, dificultad: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              >
                <option value={1}>Fácil (+50 XP)</option>
                <option value={2}>Media (+60 XP)</option>
                <option value={3}>Difícil (+80 XP)</option>
              </select>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Guardar</button>
            </form>
          </div>

          {/* Formulario ubicación */}
          <div>
            <h3 className="font-bold mb-3">📍 Nueva Ubicación</h3>
            <form onSubmit={agregarUbicacion} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del lugar"
                value={nuevaUbicacion.nombre}
                onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, nombre: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Latitud"
                value={nuevaUbicacion.latitud}
                onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, latitud: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitud"
                value={nuevaUbicacion.longitud}
                onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, longitud: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de preguntas */}
      <div>
        <h2 className="text-xl font-bold mb-3">📋 Banco de Preguntas</h2>
        <div className="space-y-2">
          {preguntas.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{p.pregunta}</p>
                <p className="text-sm text-gray-500">Respuesta: {p.respuesta} | Dificultad: {p.dificultad}</p>
              </div>
              <button onClick={() => eliminarPregunta(p.id)} className="text-red-600">🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de ubicaciones */}
      <div>
        <h2 className="text-xl font-bold mb-3">📍 Bancos de Ubicaciones</h2>
        <div className="space-y-2">
          {ubicaciones.map((u) => (
            <div key={u.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{u.nombre}</p>
                <p className="text-sm text-gray-500">Lat: {u.latitud}, Lng: {u.longitud}</p>
              </div>
              <button onClick={() => eliminarUbicacion(u.id)} className="text-red-600">🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}