import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Send, ArrowLeft, MessageSquare } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/Avatar';

export default function EncuestaPage() {
    const { reservaId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ratings, setRatings] = useState({ guia: 0, experiencia: 0 });
    const [form, setForm] = useState({ comentarios: '', sugerencias: '', origen: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ratings.guia === 0 || ratings.experiencia === 0) {
            alert('Por favor califica ambos aspectos con estrellas');
            return;
        }

        setLoading(true);
        try {
            await api.post('/encuestas', {
                reserva_id: reservaId,
                calificacion_guia: ratings.guia,
                calificacion_experiencia: ratings.experiencia,
                comentarios: form.comentarios,
                sugerencias: form.sugerencias,
                origen_turista: form.origen
            });
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            alert(error.response?.data?.error || 'Error al enviar la encuesta');
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({ value, onChange, label }) => (
        <div className="mb-6">
            <p className="text-gray-700 font-medium mb-2">{label}</p>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform active:scale-90"
                    >
                        <Star
                            className={`w-10 h-10 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-50">
                <Avatar mensaje="¡Misión cumplida! Gracias por ayudar a la comunidad de guardianes." emocion="alegre" nivel={5} />
                <motion.div 
                    initial={{ scale: 0, rotate: -10 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    className="text-center mt-20"
                >
                    <div className="bg-white p-8 rounded-3xl shadow-xl">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-6xl mb-4"
                        >🏆</motion.div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">¡Experiencia Calificada!</h2>
                        <p className="text-gray-600">Has ganado +10 XP de explorador</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 opacity-80 hover:opacity-100">
                    <ArrowLeft className="w-5 h-5" /> Volver
                </button>
                <h1 className="text-2xl font-bold">Cuéntanos tu experiencia</h1>
                <p className="text-blue-100 text-sm">Tu opinión es fundamental para nuestros guías</p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <StarRating 
                        label="¿Cómo calificarías a tu guía?" 
                        value={ratings.guia} 
                        onChange={(v) => setRatings({...ratings, guia: v})} 
                    />
                    <StarRating 
                        label="¿Qué tal fue la experiencia general?" 
                        value={ratings.experiencia} 
                        onChange={(v) => setRatings({...ratings, experiencia: v})} 
                    />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            ¿De dónde nos visitas?
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Medellín, Bogotá, España..."
                            className="w-full p-3 border rounded-xl"
                            value={form.origen}
                            onChange={e => setForm({...form, origen: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios sobre el recorrido</label>
                        <textarea
                            className="w-full p-3 border rounded-xl"
                            rows="3"
                            value={form.comentarios}
                            onChange={e => setForm({...form, comentarios: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">¿Alguna sugerencia de mejora?</label>
                        <textarea
                            className="w-full p-3 border rounded-xl"
                            rows="2"
                            value={form.sugerencias}
                            onChange={e => setForm({...form, sugerencias: e.target.value})}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar Calificación</>}
                </button>
            </form>
        </div>
    );
}