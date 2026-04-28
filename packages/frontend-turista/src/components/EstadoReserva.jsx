import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon, MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function EstadoReserva() {
    const [reserva, setReserva] = useState(null);
    const [visible, setVisible] = useState(true);
    const [verificando, setVerificando] = useState(false);

    // Cargar reserva desde localStorage
    useEffect(() => {
        const saved = localStorage.getItem('ultima_reserva');
        if (saved) {
            const parsed = JSON.parse(saved);
            setReserva(parsed);
        }
    }, []);

    // Verificar estado periódicamente mientras la reserva esté pendiente
    useEffect(() => {
        if (!reserva?.id) return;
        
        // Solo verificar automáticamente si está pendiente
        if (reserva.estado === 'pendiente') {
            const interval = setInterval(() => {
                verificarEstado();
            }, 5000); // Cada 5 segundos
            
            return () => clearInterval(interval);
        }
    }, [reserva?.id, reserva?.estado]);

    const verificarEstado = async () => {
        if (!reserva?.id || verificando) return;
        
        setVerificando(true);
        try {
            const response = await api.get(`/reservas/${reserva.id}`);
            const nuevoEstado = response.data.estado;
            
            if (nuevoEstado !== reserva.estado) {
                const nuevaReserva = { ...reserva, estado: nuevoEstado };
                setReserva(nuevaReserva);
                localStorage.setItem('ultima_reserva', JSON.stringify(nuevaReserva));
                
                // Si ya no está pendiente, mostrar notificación
                if (nuevoEstado !== 'pendiente') {
                    // Reproducir sonido opcional
                    // new Audio('/sounds/notification.mp3').play();
                    
                    // Ocultar después de 15 segundos si fue confirmada o cancelada
                    if (nuevoEstado === 'confirmada' || nuevoEstado === 'cancelada') {
                        setTimeout(() => setVisible(false), 15000);
                    }
                }
            }
        } catch (error) {
            console.error('Error al verificar estado:', error);
        } finally {
            setVerificando(false);
        }
    };

    const handleRefresh = () => {
        verificarEstado();
    };

    const handleClose = () => {
        setVisible(false);
    };

    if (!reserva || !visible) return null;

    const getEstadoInfo = () => {
        switch(reserva.estado) {
            case 'pendiente':
                return { 
                    icon: <ClockIcon className="w-6 h-6 text-yellow-500" />, 
                    text: 'Buscando guía...', 
                    subtext: 'Estamos buscando un guía disponible',
                    color: 'bg-yellow-50 border-yellow-300', 
                    bg: 'bg-yellow-500',
                    progress: 50
                };
            case 'confirmada':
                return { 
                    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />, 
                    text: '¡Guía confirmado!', 
                    subtext: 'El guía ha aceptado tu solicitud',
                    color: 'bg-green-50 border-green-300', 
                    bg: 'bg-green-500',
                    progress: 100
                };
            case 'completada':
                return { 
                    icon: <CheckCircleIcon className="w-6 h-6 text-blue-500" />, 
                    text: 'Recorrido completado', 
                    subtext: '¡Esperamos que hayas disfrutado!',
                    color: 'bg-blue-50 border-blue-300', 
                    bg: 'bg-blue-500',
                    progress: 100
                };
            case 'cancelada':
                return { 
                    icon: <XCircleIcon className="w-6 h-6 text-red-500" />, 
                    text: 'Reserva cancelada', 
                    subtext: 'Esta reserva ha sido cancelada',
                    color: 'bg-red-50 border-red-300', 
                    bg: 'bg-red-500',
                    progress: 100
                };
            default:
                return { 
                    icon: <ClockIcon className="w-6 h-6 text-gray-500" />, 
                    text: 'Procesando...', 
                    subtext: 'Esperando confirmación',
                    color: 'bg-gray-50 border-gray-300', 
                    bg: 'bg-gray-500',
                    progress: 30
                };
        }
    };

    const info = getEstadoInfo();

    return (
        <div className={`fixed bottom-20 right-4 z-[2000] rounded-xl p-4 shadow-lg border ${info.color} max-w-xs animate-slide-up`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {info.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800 text-sm">{info.text}</p>
                        <button 
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{info.subtext}</p>
                    <p className="text-xs font-medium text-gray-700 mt-1 truncate">
                        📍 {reserva.lugar}
                    </p>
                    <p className="text-xs text-gray-400">
                        📅 {new Date(reserva.fecha).toLocaleString()}
                    </p>
                </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Estado</span>
                    <span>{info.progress === 100 ? 'Completado' : 'En proceso'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${info.bg}`}
                        style={{ width: `${info.progress}%` }}
                    />
                </div>
            </div>
            
            {/* Botón de refrescar manual (solo si está pendiente) */}
            {reserva.estado === 'pendiente' && (
                <button
                    onClick={handleRefresh}
                    disabled={verificando}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition"
                >
                    <RefreshIcon className={`w-3.5 h-3.5 ${verificando ? 'animate-spin' : ''}`} />
                    {verificando ? 'Verificando...' : 'Verificar estado'}
                </button>
            )}
        </div>
    );
}