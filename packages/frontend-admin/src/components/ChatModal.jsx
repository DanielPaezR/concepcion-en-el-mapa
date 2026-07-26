import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket'; // Asume que tienes este helper

export default function ChatModal({ isOpen, onClose, reservaId, otroNombre, otroId, usuarioId }) {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const messagesEndRef = useRef(null);
    const socket = getSocket(); // obtiene la instancia global del socket

    // Cargar mensajes al abrir el modal
    useEffect(() => {
        if (isOpen && reservaId) {
            cargarMensajes();
        }
    }, [isOpen, reservaId]);

    // Escuchar mensajes nuevos en tiempo real
    useEffect(() => {
        if (!isOpen || !socket) return;

        const handleNuevoMensaje = (data) => {
            // Verificar que el mensaje pertenece a esta conversación
            if (data.reservaId === reservaId) {
                setMensajes(prev => [...prev, data.mensaje]);
                scrollToBottom();
            }
        };

        socket.on('nuevo-mensaje', handleNuevoMensaje);

        return () => {
            socket.off('nuevo-mensaje', handleNuevoMensaje);
        };
    }, [isOpen, socket, reservaId]);

    const cargarMensajes = async () => {
        setCargando(true);
        try {
            const res = await api.get(`/mensajes/reserva/${reservaId}`);
            setMensajes(res.data);
            scrollToBottom();
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar mensajes');
        } finally {
            setCargando(false);
        }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim()) return;
        setEnviando(true);
        try {
            const res = await api.post('/mensajes/enviar', {
                reservaId,
                mensaje: nuevoMensaje
            });
            setMensajes(prev => [...prev, res.data]);
            setNuevoMensaje('');
            scrollToBottom();
        } catch (error) {
            toast.error('No se pudo enviar el mensaje');
        } finally {
            setEnviando(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col h-[500px] shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Chat con {otroNombre}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Lista de mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {cargando ? (
                        <div className="text-center text-gray-400">Cargando mensajes...</div>
                    ) : mensajes.length === 0 ? (
                        <div className="text-center text-gray-400">No hay mensajes aún. ¡Envía el primero!</div>
                    ) : (
                        mensajes.map((msg) => {
                            const esMio = msg.emisor_id === usuarioId;
                            return (
                                <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${esMio ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                                        <p className="text-sm break-words">{msg.mensaje}</p>
                                        <p className="text-[10px] opacity-70 mt-1 text-right">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input de mensaje */}
                <form onSubmit={enviarMensaje} className="p-4 border-t bg-white flex gap-2">
                    <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={enviando}
                    />
                    <button
                        type="submit"
                        disabled={enviando || !nuevoMensaje.trim()}
                        className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 transition"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}