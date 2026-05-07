import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Settings, Globe, LogOut, X, ChevronRight, LogIn,
    Award, MapPin, Calendar, Shield, Star, Zap, Crown,
    Wifi, WifiOff, RefreshCw, UserCircle, Medal, Camera,
    Heart, MessageCircle, Share2, Bell, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTuristaActual, logoutTurista } from '../services/auth';
import api from '../services/api';

export default function MenuExplorador({ nivel, xp, lugaresDescubiertos, totalLugares, fotoPerfil, isOpen, onClose }) {
    const [usuario, setUsuario] = useState(null);
    const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [ultimaInsignia, setUltimaInsignia] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = getTuristaActual();
        setUsuario(user);
        cargarUltimaInsignia();

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

    const cargarUltimaInsignia = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('turista_token');
            if (!token) return;
            
            const response = await api.get('/insignias/mis-insignias');
            if (response.data.insignias?.length > 0) {
                setUltimaInsignia(response.data.insignias[0]);
            }
        } catch (error) {
            console.error('Error cargando última insignia:', error);
        }
    };

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
            label: 'Iniciar Sesión',
            desc: 'Accede a tu cuenta',
            color: 'text-green-600',
            bg: 'bg-green-50',
            onClick: () => navigate('/registro')
        }
    ] : [
        { 
            icon: <User className="w-5 h-5" />, 
            label: 'Mi Perfil', 
            desc: 'Ver y editar tu información',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            onClick: () => navigate(`/perfil/${usuario.id}`)
        },
        { 
            icon: <Award className="w-5 h-5" />, 
            label: 'Mis Logros', 
            desc: 'Insignias y medallas',
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            onClick: () => navigate('/mis-logros') 
        },
        { 
            icon: <Calendar className="w-5 h-5" />, 
            label: 'Mis Reservas', 
            desc: 'Tus recorridos programados',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            onClick: () => navigate('/mis-reservas') 
        },
        { 
            icon: <Shield className="w-5 h-5" />, 
            label: 'Guardianes', 
            desc: 'Lugares que proteges',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            onClick: () => navigate(`/perfil/${usuario.id}`)
        },
    ];

    const getNivelTitulo = () => {
        if (nivel >= 5) return { titulo: 'Leyenda de Concepción', emoji: '👑', color: 'from-yellow-500 to-orange-500' };
        if (nivel >= 4) return { titulo: 'Guardián del Pueblo', emoji: '🛡️', color: 'from-amber-500 to-orange-500' };
        if (nivel >= 3) return { titulo: 'Aventurero Estrella', emoji: '⭐', color: 'from-blue-500 to-indigo-500' };
        if (nivel >= 2) return { titulo: 'Explorador', emoji: '🌟', color: 'from-green-500 to-teal-500' };
        return { titulo: 'Principiante', emoji: '🌱', color: 'from-gray-500 to-gray-600' };
    };

    const nivelInfo = getNivelTitulo();
    const porcentajeProgreso = (lugaresDescubiertos / totalLugares) * 100;
    const xpParaSiguiente = nivel * 100;
    const xpActual = xp;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
                        />

                        {/* Menú lateral */}
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-[2001] flex flex-col overflow-y-auto"
                            style={{ maxWidth: 'calc(100% - 40px)' }}
                        >
                            {/* Header con foto de perfil - Diseño profesional */}
                            <div className={`bg-gradient-to-br ${nivelInfo.color} text-white p-6 relative overflow-hidden`}>
                                {/* Fondo decorativo */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />
                                
                                {/* Estado de conexión */}
                                <div className="flex justify-end mb-2 relative z-10">
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-500/30' : 'bg-red-500/30'} backdrop-blur-sm`}>
                                        {isOnline ? (
                                            <>
                                                <Wifi className="w-3 h-3" />
                                                <span>En línea</span>
                                            </>
                                        ) : (
                                            <>
                                                <WifiOff className="w-3 h-3" />
                                                <span>Sin conexión</span>
                                            </>
                                        )}
                                        {isSyncing && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
                                    </div>
                                </div>

                                {/* Foto de perfil y datos */}
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30 shadow-xl">
                                            {!esAnonimo && fotoPerfil ? (
                                                <img 
                                                    src={fotoPerfil} 
                                                    alt="Perfil" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-4xl">
                                                    {nivelInfo.emoji}
                                                </div>
                                            )}
                                        </div>
                                        {/* Nivel badge */}
                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                                            {nivel}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold">
                                            {usuario?.nombre || 'Explorador Anónimo'}
                                        </h2>
                                        <p className="text-white/80 text-sm flex items-center gap-1">
                                            <span>{nivelInfo.emoji}</span>
                                            <span>{nivelInfo.titulo}</span>
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                                            <span>🏆 {xp} XP</span>
                                            <span>•</span>
                                            <span>📍 {lugaresDescubiertos}/{totalLugares} lugares</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de progreso XP */}
                                <div className="mt-4 relative z-10">
                                    <div className="flex justify-between text-xs text-white/80 mb-1">
                                        <span>Progreso al nivel {nivel + 1}</span>
                                        <span>{xpActual}/{xpParaSiguiente} XP</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(xpActual / xpParaSiguiente) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas rápidas */}
                            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-b border-gray-100">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">{lugaresDescubiertos}</div>
                                    <div className="text-xs text-gray-500">Lugares</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">{xp}</div>
                                    <div className="text-xs text-gray-500">XP total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">{nivel}</div>
                                    <div className="text-xs text-gray-500">Nivel</div>
                                </div>
                            </div>

                            {/* Última insignia */}
                            {ultimaInsignia && (
                                <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{ultimaInsignia.icono || '🏅'}</div>
                                        <div className="flex-1">
                                            <p className="text-xs text-yellow-600 font-medium">ÚLTIMA INSIGNIA</p>
                                            <p className="font-bold text-gray-800 text-sm">{ultimaInsignia.nombre}</p>
                                        </div>
                                        <Medal className="w-5 h-5 text-yellow-500" />
                                    </div>
                                </div>
                            )}

                            {/* Opciones del menú */}
                            <div className="flex-1 p-4 space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MENÚ PRINCIPAL</p>
                                {opciones.map((opcion, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => {
                                            opcion.onClick();
                                            onClose();
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${opcion.bg} hover:shadow-md group`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${opcion.color}`}>
                                                {opcion.icon}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-gray-800 font-medium text-sm">{opcion.label}</div>
                                                <div className="text-xs text-gray-500">{opcion.desc}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${opcion.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </motion.button>
                                ))}
                            </div>

                            {/* Sección de idioma y configuración */}
                            <div className="border-t border-gray-100 p-4 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Idioma</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => cambiarIdioma('es')}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                idioma === 'es' 
                                                    ? 'bg-green-600 text-white shadow-md' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            🇪🇸 Español
                                        </button>
                                        <button
                                            onClick={() => cambiarIdioma('en')}
                                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                idioma === 'en' 
                                                    ? 'bg-green-600 text-white shadow-md' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            🇬🇧 English
                                        </button>
                                    </div>
                                </div>

                                {/* Versión */}
                                <div className="text-center pt-2">
                                    <p className="text-xs text-gray-400">Versión 2.0.0</p>
                                    <p className="text-xs text-gray-400 mt-1">Concepción en el Mapa</p>
                                </div>
                            </div>

                            {/* Botón de cerrar sesión */}
                            {!esAnonimo && (
                                <div className="border-t border-gray-100 p-4">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 group"
                                    >
                                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
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