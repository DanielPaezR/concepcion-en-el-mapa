import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Settings, Globe, LogOut, X, ChevronRight, LogIn,
    Award, MapPin, Calendar, Shield, Star, Zap, Crown,
    Wifi, WifiOff, RefreshCw, UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTuristaActual, logoutTurista } from '../services/auth';
import api from '../services/api';

export default function MenuExplorador({ nivel, xp, lugaresDescubiertos, totalLugares, fotoPerfil }) {
    const [isOpen, setIsOpen] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = getTuristaActual();
        setUsuario(user);

        const handleOnline = () => {
            setIsOnline(true);
            procesarColaSincronizacion();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const procesarColaSincronizacion = async () => {
        const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
        if (queue.length === 0) return;

        setIsSyncing(true);
        const remainingQueue = [];

        for (const item of queue) {
            try {
                if (item.type === 'ANCLAR_GUARDIAN') {
                    await api.post('/guardianes/anclar', item.data);
                } else if (item.type === 'SUBIR_FOTO') {
                    const formData = new FormData();
                    const response = await fetch(item.data.imagenBase64);
                    const blob = await response.blob();
                    formData.append('imagen', blob, 'foto_offline.jpg');
                    formData.append('mensaje', item.data.mensaje);
                    
                    await api.post('/galeria', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            } catch (err) {
                remainingQueue.push(item);
            }
        }

        localStorage.setItem('sync_queue', JSON.stringify(remainingQueue));
        setIsSyncing(false);
    };

    const cambiarIdioma = (lang) => {
        setIdioma(lang);
        localStorage.setItem('idioma', lang);
        window.location.reload();
    };

    const handleLogout = () => {
        logoutTurista();
        navigate('/');
    };

    const esAnonimo = !usuario || usuario.anonimo;
    
    const opciones = esAnonimo ? [
        {
            icon: <LogIn className="w-5 h-5" />,
            label: 'Iniciar Sesión / Registrarse',
            onClick: () => navigate('/registro')
        }
    ] : [
        { 
            icon: <User className="w-5 h-5" />, 
            label: 'Mi Perfil', 
            onClick: () => navigate(`/perfil/${usuario.id}`)
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
            onClick: () => navigate(`/perfil/${usuario.id}`)
        },
    ];

    const getNivelIcono = () => {
        if (nivel >= 5) return <Crown className="w-6 h-6 text-yellow-400" />;
        if (nivel >= 3) return <Zap className="w-6 h-6 text-purple-400" />;
        return <Star className="w-6 h-6 text-blue-400" />;
    };

    return (
        <>
            {/* Botón de menú - SE MUESTRA EN EL MAPA, lista para ser integrada en el HUD */}
            {/* Este botón debe ser usado dentro del HUDHeader en Mapa.jsx */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="relative flex items-center justify-center gap-2"
                style={{
                    background: 'rgba(2,6,18,0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(251,191,36,0.6)',
                    borderRadius: 10,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(251,191,36,0.15)',
                    transition: 'border-color .2s, box-shadow .2s',
                }}
            >
                {!esAnonimo && fotoPerfil ? (
                    <img 
                        src={fotoPerfil} 
                        alt="Perfil" 
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                ) : (
                    <UserCircle size={20} color="#fbbf24" />
                )}
                {/* Indicador de red/sincronización */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            </motion.button>

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
                                            {!esAnonimo && fotoPerfil ? (
                                                <img 
                                                    src={fotoPerfil} 
                                                    alt="Perfil" 
                                                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                getNivelIcono()
                                            )}
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

                            {/* Botón de cerrar sesión (solo si está registrado) */}
                            {!esAnonimo && (
                                <div className="border-t border-gray-100 p-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Cerrar sesión</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}