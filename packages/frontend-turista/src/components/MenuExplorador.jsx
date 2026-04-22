import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Settings, Globe, LogOut, X, ChevronRight,
    Award, MapPin, Calendar, Shield, Star, Zap, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTuristaActual, logoutTurista } from '../services/auth';

export default function MenuExplorador({ nivel, xp, lugaresDescubiertos, totalLugares }) {
    const [isOpen, setIsOpen] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
    const navigate = useNavigate();

    useEffect(() => {
        const user = getTuristaActual();
        setUsuario(user);
    }, []);

    const cambiarIdioma = (lang) => {
        setIdioma(lang);
        localStorage.setItem('idioma', lang);
        window.location.reload();
    };

    const handleLogout = () => {
        logoutTurista();
        navigate('/');
    };

    const opciones = [
        { 
            icon: <User className="w-5 h-5" />, 
            label: 'Mi Perfil', 
            onClick: () => {
                if (usuario?.id) {
                    navigate(`/perfil/${usuario.id}`);
                } else {
                    navigate('/registro');
                }
            }
        },
        { 
            icon: <Award className="w-5 h-5" />, 
            label: 'Mis Logros', 
            onClick: () => navigate('/mis-logros') 
        },
        { 
            icon: <Calendar className="w-5 h-5" />, 
            label: 'Mis Reservas', 
            onClick: () => navigate('/mis-reservas') 
        },
        { 
            icon: <Shield className="w-5 h-5" />, 
            label: 'Guardianes', 
            onClick: () => {
                if (usuario?.id) {
                    navigate(`/perfil/${usuario.id}`);
                } else {
                    navigate('/registro');
                }
            }
        },
    ];

    const getNivelIcono = () => {
        if (nivel >= 5) return <Crown className="w-6 h-6 text-yellow-400" />;
        if (nivel >= 3) return <Zap className="w-6 h-6 text-purple-400" />;
        return <Star className="w-6 h-6 text-blue-400" />;
    };

    return (
        <>
            {/* Botón para abrir menú */}
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-4 right-16 z-[1000] bg-black/50 backdrop-blur-sm rounded-full p-2 border border-white/30 hover:bg-black/70 transition"
            >
                <User className="w-5 h-5 text-white" />
            </button>

            {/* Menú lateral */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[2000] bg-black/50"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-[2001] flex flex-col"
                        >
                            {/* Header del menú */}
                            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            {getNivelIcono()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{usuario?.nombre || 'Explorador'}</h3>
                                            <p className="text-xs opacity-90">Nivel {nivel}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                {/* Barra de progreso */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Progreso</span>
                                        <span>{lugaresDescubiertos}/{totalLugares} lugares</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2">
                                        <div 
                                            className="bg-yellow-400 h-2 rounded-full transition-all"
                                            style={{ width: `${(lugaresDescubiertos / totalLugares) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Opciones del menú */}
                            <div className="flex-1 p-4 space-y-1">
                                {opciones.map((opcion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            opcion.onClick();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 group-hover:text-green-600">
                                                {opcion.icon}
                                            </span>
                                            <span className="text-gray-700">{opcion.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                ))}
                            </div>

                            {/* Sección de idioma */}
                            <div className="border-t border-gray-100 p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Globe className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-700 font-medium">Idioma</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => cambiarIdioma('es')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                                            idioma === 'es' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        🇪🇸 Español
                                    </button>
                                    <button
                                        onClick={() => cambiarIdioma('en')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                                            idioma === 'en' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>

                            {/* Botón de cerrar sesión */}
                            <div className="border-t border-gray-100 p-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Cerrar sesión</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}