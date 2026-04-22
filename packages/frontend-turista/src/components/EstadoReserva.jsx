import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function EstadoReserva() {
    const [reserva, setReserva] = useState(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('ultima_reserva');
        if (saved) {
            const parsed = JSON.parse(saved);
            setReserva(parsed);
            
            // Ocultar después de 30 segundos si está confirmada o cancelada
            if (parsed.estado === 'confirmada' || parsed.estado === 'cancelada') {
                setTimeout(() => setVisible(false), 30000);
            }
        }
        
        // Verificar estado actualizado cada 10 segundos
        const interval = setInterval(verificarEstado, 10000);
        return () => clearInterval(interval);
    }, []);

    const verificarEstado = async () => {
        if (!reserva?.id) return;
        
        try {
            const response = await api.get(`/reservas/${reserva.id}`);
            if (response.data.estado !== reserva.estado) {
                const nuevaReserva = { ...reserva, estado: response.data.estado };
                setReserva(nuevaReserva);
                localStorage.setItem('ultima_reserva', JSON.stringify(nuevaReserva));
            }
        } catch (error) {
            console.error('Error al verificar estado:', error);
        }
    };

    if (!reserva || !visible) return null;

    const getEstadoInfo = () => {
        switch(reserva.estado) {
            case 'pendiente':
                return { icon: <ClockIcon className="w-6 h-6 text-yellow-500" />, text: 'Buscando guía...', color: 'bg-yellow-50 border-yellow-300', bg: 'bg-yellow-500' };
            case 'confirmada':
                return { icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />, text: '¡Guía confirmado!', color: 'bg-green-50 border-green-300', bg: 'bg-green-500' };
            case 'cancelada':
                return { icon: <XCircleIcon className="w-6 h-6 text-red-500" />, text: 'Reserva cancelada', color: 'bg-red-50 border-red-300', bg: 'bg-red-500' };
            default:
                return { icon: <ClockIcon className="w-6 h-6 text-gray-500" />, text: 'Procesando...', color: 'bg-gray-50 border-gray-300', bg: 'bg-gray-500' };
        }
    };

    const info = getEstadoInfo();

    return (
        <div className={`fixed bottom-20 right-4 z-[2000] rounded-xl p-3 shadow-lg border ${info.color} max-w-xs animate-slide-up`}>
            <div className="flex items-center gap-3">
                {info.icon}
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{info.text}</p>
                    <p className="text-xs text-gray-600">{reserva.lugar}</p>
                    <p className="text-xs text-gray-500">{new Date(reserva.fecha).toLocaleString()}</p>
                </div>
                <button 
                    onClick={() => setVisible(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${info.bg}`}
                    style={{ width: reserva.estado === 'pendiente' ? '50%' : '100%' }}
                />
            </div>
        </div>
    );
}