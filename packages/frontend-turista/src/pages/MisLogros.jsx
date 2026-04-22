import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Shield, Award, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';

export default function MisLogros() {
    const [insignias, setInsignias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState(null);
    const navigate = useNavigate();
    const usuario = getTuristaActual();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [insigniasRes, statsRes] = await Promise.all([
                api.get('/guardianes/mis-insignias'),
                api.get('/eventos/mis-estadisticas')
            ]);
            setInsignias(insigniasRes.data.insignias || []);
            setEstadisticas(statsRes.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconoPorTipo = (tipo) => {
        switch(tipo) {
            case 'exploracion': return <MapPin className="w-8 h-8 text-blue-500" />;
            case 'social': return <Users className="w-8 h-8 text-green-500" />;
            case 'evento': return <Calendar className="w-8 h-8 text-purple-500" />;
            default: return <Award className="w-8 h-8 text-yellow-500" />;
        }
    };

    const logrosDisponibles = [
        { id: 1, nombre: 'Principiante', descripcion: 'Descubre tu primer lugar', icono: '🌱', requerido: 1, tipo: 'exploracion' },
        { id: 2, nombre: 'Explorador', descripcion: 'Descubre 5 lugares', icono: '⭐', requerido: 5, tipo: 'exploracion' },
        { id: 3, nombre: 'Maestro', descripcion: 'Descubre 10 lugares', icono: '🏆', requerido: 10, tipo: 'exploracion' },
        { id: 4, nombre: 'Leyenda', descripcion: 'Descubre todos los lugares', icono: '👑', requerido: 'todos', tipo: 'exploracion' },
        { id: 5, nombre: 'Fotógrafo', descripcion: 'Sube tu primera foto a la galería', icono: '📸', requerido: 1, tipo: 'social' },
        { id: 6, nombre: 'Social', descripcion: 'Recibe 10 likes en tus fotos', icono: '❤️', requerido: 10, tipo: 'social' },
    ];

    const esDesbloqueado = (logro) => {
        return insignias.some(i => i.nombre === logro.nombre);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
                <button onClick={() => navigate(-1)} className="text-white mb-4">← Volver</button>
                <div className="flex items-center gap-3">
                    <Trophy className="w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold">Mis Logros</h1>
                        <p className="text-green-100 text-sm">Colección de insignias y reconocimientos</p>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-3 gap-3 p-4 -mt-6">
                    <div className="bg-white rounded-xl p-3 text-center shadow">
                        <div className="text-2xl font-bold text-green-600">{estadisticas.titulo?.split(' ')[1] || '0'}</div>
                        <div className="text-xs text-gray-500">Retos completados</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow">
                        <div className="text-2xl font-bold text-yellow-500">{estadisticas.racha_actual || 0}</div>
                        <div className="text-xs text-gray-500">Racha actual 🔥</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow">
                        <div className="text-2xl font-bold text-blue-500">{estadisticas.racha_maxima || 0}</div>
                        <div className="text-xs text-gray-500">Mejor racha</div>
                    </div>
                </div>
            )}

            {/* Lista de logros */}
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-3">🏅 Logros obtenidos</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {insignias.map((insignia, index) => (
                        <motion.div
                            key={insignia.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl p-3 shadow text-center border border-green-200"
                        >
                            <div className="text-4xl mb-2">{insignia.icono || '🏅'}</div>
                            <h3 className="font-bold text-gray-800 text-sm">{insignia.nombre}</h3>
                            <p className="text-xs text-gray-500">{insignia.descripcion}</p>
                            <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                ✓ Obtenido
                            </span>
                        </motion.div>
                    ))}
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-3">🔒 Próximos logros</h2>
                <div className="grid grid-cols-2 gap-3">
                    {logrosDisponibles.filter(l => !esDesbloqueado(l)).map((logro, index) => (
                        <div key={logro.id} className="bg-white/60 rounded-xl p-3 shadow text-center opacity-70">
                            <div className="text-4xl mb-2">{logro.icono}</div>
                            <h3 className="font-bold text-gray-800 text-sm">{logro.nombre}</h3>
                            <p className="text-xs text-gray-500">{logro.descripcion}</p>
                            <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                🔒 Por descubrir
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}