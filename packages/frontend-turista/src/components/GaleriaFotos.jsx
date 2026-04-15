// components/GaleriaFotos.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Calendar, Award, X, Send, Upload, Camera, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';
import RegistroModal from './RegistroModal';

// Textos en español e inglés
const textos = {
  es: {
    titulo: '🌟 Galería de Exploradores',
    subtitulo: 'Comparte tus recuerdos de Concepción',
    visitantes: '📸 Fotos de visitantes',
    sinFotos: '🌄 Aún no hay fotos. ¡Sé el primero en compartir tu recuerdo!',
    nivelRequerido: 'Necesitas alcanzar el nivel 5 para subir fotos',
    subirFoto: '📸 Compartir mi recuerdo',
    cancelar: 'Cancelar',
    subiendo: 'Subiendo...',
    mensaje: 'Mensaje (opcional)',
    placeholderMensaje: '¡Qué experiencia increíble en Concepción!',
    comentar: 'Escribe un comentario...',
    publicar: 'Publicar',
    likes: 'Me gusta',
    comentarios: 'Comentarios',
    cerrar: 'Cerrar',
    seleccionarFoto: 'Selecciona o arrastra una foto',
    clickParaSubir: 'Haz clic o arrastra una foto aquí',
    formatosAceptados: 'Formatos: JPG, PNG (máx 5MB)'
  },
  en: {
    titulo: '🌟 Explorers Gallery',
    subtitulo: 'Share your memories of Concepción',
    visitantes: '📸 Visitors photos',
    sinFotos: '🌄 No photos yet. Be the first to share your memory!',
    nivelRequerido: 'You need to reach level 5 to upload photos',
    subirFoto: '📸 Share my memory',
    cancelar: 'Cancel',
    subiendo: 'Uploading...',
    mensaje: 'Message (optional)',
    placeholderMensaje: 'What an incredible experience in Concepción!',
    comentar: 'Write a comment...',
    publicar: 'Post',
    likes: 'Likes',
    comentarios: 'Comments',
    cerrar: 'Close',
    seleccionarFoto: 'Select or drag a photo',
    clickParaSubir: 'Click or drag a photo here',
    formatosAceptados: 'Formats: JPG, PNG (max 5MB)'
  }
};

export default function GaleriaFotos({ nivelUsuario, onCerrar }) {
  const [fotos, setFotos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [comentarioActivo, setComentarioActivo] = useState(null);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarios, setComentarios] = useState({});
  const [idioma, setIdioma] = useState('es');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const usuario = getTuristaActual();

  const [nuevaFoto, setNuevaFoto] = useState({
    mensaje: ''
  });

  const t = textos[idioma];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setArchivoSeleccionado(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  });

  useEffect(() => {
    cargarFotos();
    // Detectar idioma del navegador
    const idiomaNavegador = navigator.language.split('-')[0];
    if (idiomaNavegador === 'en') setIdioma('en');
  }, []);

  const cargarFotos = async () => {
    try {
      const response = await api.get('/galeria');
      setFotos(response.data.fotos || []);
    } catch (error) {
      console.error('Error al cargar galería:', error);
    }
  };

  const cargarComentarios = async (fotoId) => {
    try {
      const response = await api.get(`/galeria/${fotoId}/comentarios`);
      setComentarios(prev => ({ ...prev, [fotoId]: response.data.comentarios }));
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };

  const handleSubirFoto = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      alert(idioma === 'es' ? 'Por favor selecciona una foto' : 'Please select a photo');
      return;
    }

    setCargando(true);
    const formData = new FormData();
    formData.append('imagen', archivoSeleccionado);
    formData.append('mensaje', nuevaFoto.mensaje);

    try {
      await api.post('/galeria', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMostrarFormulario(false);
      setNuevaFoto({ mensaje: '' });
      setArchivoSeleccionado(null);
      setPreviewUrl(null);
      cargarFotos();
      alert(idioma === 'es' ? '📸 ¡Foto subida exitosamente!' : '📸 Photo uploaded successfully!');
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert(error.response?.data?.error || (idioma === 'es' ? 'Error al subir la foto' : 'Error uploading photo'));
    } finally {
      setCargando(false);
    }
  };

  const handleLike = async (fotoId) => {
    try {
      await api.post(`/galeria/${fotoId}/like`);
      cargarFotos();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleComentar = async (fotoId) => {
    if (!nuevoComentario.trim()) return;

    try {
      await api.post(`/galeria/${fotoId}/comentarios`, { comentario: nuevoComentario });
      setNuevoComentario('');
      setComentarioActivo(null);
      cargarComentarios(fotoId);
    } catch (error) {
      console.error('Error al comentar:', error);
    }
  };

  const nivelSuficiente = nivelUsuario >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm overflow-y-auto"
    >
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">{t.titulo}</h2>
              <p className="text-gray-300 mt-1">{t.subtitulo}</p>
            </div>
            <button
              onClick={onCerrar}
              className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Botón de idioma */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
              className="bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              {idioma === 'es' ? '🇬🇧 English' : '🇪🇸 Español'}
            </button>
          </div>

          {/* Mensaje de nivel */}
          {!nivelSuficiente && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-6">
              <p className="text-yellow-300 text-center flex items-center justify-center gap-2">
                <Award className="w-5 h-5" />
                {t.nivelRequerido}
              </p>
            </div>
          )}

          {/* Botón para subir foto */}
          {nivelSuficiente && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (usuario?.anonimo) {
                  setMostrarRegistro(true);
                } else {
                  setMostrarFormulario(!mostrarFormulario);
                }
              }}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl font-bold mb-6 flex items-center justify-center gap-2 shadow-lg"
            >
              <Camera className="w-5 h-5" />
              {mostrarFormulario ? t.cancelar : t.subirFoto}
            </motion.button>
          )}

          {/* Formulario para subir foto - VERSIÓN MEJORADA CON DROPZONE */}
          <AnimatePresence>
            {mostrarFormulario && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 mb-6 overflow-hidden"
              >
                <h3 className="text-xl font-bold mb-4">{t.seleccionarFoto}</h3>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
                >
                  <input {...getInputProps()} />
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setArchivoSeleccionado(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">{t.clickParaSubir}</p>
                      <p className="text-gray-400 text-sm mt-2">{t.formatosAceptados}</p>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 mb-2">{t.mensaje}</label>
                  <textarea
                    value={nuevaFoto.mensaje}
                    onChange={(e) => setNuevaFoto({ ...nuevaFoto, mensaje: e.target.value })}
                    placeholder={t.placeholderMensaje}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSubirFoto}
                    disabled={cargando || !archivoSeleccionado}
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {cargando ? t.subiendo : t.subirFoto}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarFormulario(false);
                      setArchivoSeleccionado(null);
                      setPreviewUrl(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-400 transition-colors"
                  >
                    {t.cancelar}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Título de la galería */}
          <h3 className="text-xl font-bold text-white mb-4">{t.visitantes}</h3>

          {/* Galería de fotos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fotos.map((foto) => (
              <motion.div
                key={foto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <img 
                  src={foto.imagen_url} 
                  alt={`Foto de ${foto.usuario_nombre}`}
                  className="w-full h-64 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+not+available';
                  }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800">
                      👤 {foto.usuario_nombre || 'Explorador'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(foto.fecha_subida).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {foto.mensaje && (
                    <p className="text-gray-600 text-sm italic mb-3">"{foto.mensaje}"</p>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(foto.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-5 h-5" /> {foto.likes || 0}
                    </button>
                    <button
                      onClick={() => {
                        if (comentarioActivo === foto.id) {
                          setComentarioActivo(null);
                        } else {
                          setComentarioActivo(foto.id);
                          if (!comentarios[foto.id]) {
                            cargarComentarios(foto.id);
                          }
                        }
                      }}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" /> {foto.comentarios_count || 0}
                    </button>
                  </div>

                  {/* Comentarios */}
                  <AnimatePresence>
                    {comentarioActivo === foto.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-3 border-t border-gray-100"
                      >
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            placeholder={t.comentar}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleComentar(foto.id)}
                          />
                          <button
                            onClick={() => handleComentar(foto.id)}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {comentarios[foto.id]?.map((com) => (
                          <div key={com.id} className="text-sm mb-2">
                            <span className="font-bold">{com.usuario_nombre}: </span>
                            <span className="text-gray-600">{com.comentario}</span>
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(com.fecha_comentario).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        
                        {comentarios[foto.id]?.length === 0 && (
                          <p className="text-gray-400 text-sm text-center">✨ {idioma === 'es' ? 'Sin comentarios aún' : 'No comments yet'}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {fotos.length === 0 && (
            <div className="text-center py-12 bg-white/10 rounded-2xl">
              <p className="text-gray-300">{t.sinFotos}</p>
            </div>
          )}
        </div>

        {/* Modal de registro */}
        {mostrarRegistro && (
          <RegistroModal
            onClose={() => setMostrarRegistro(false)}
            onSuccess={() => {
              setMostrarFormulario(true);
            }}
          />
        )}

      </div>
    </motion.div>
  );
}