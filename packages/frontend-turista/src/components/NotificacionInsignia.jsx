// components/NotificacionInsignia.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NotificacionInsignia() {
    const [notificaciones, setNotificaciones] = useState([]);

    useEffect(() => {
        // Consultar cada 30 segundos o después de acciones
        const checkNewInsignias = async () => {
            try {
                if (!localStorage.getItem('token') && !localStorage.getItem('turista_token')) return;

                const res = await api.get('/insignias/nuevas');
                if (res.data.insignias?.length > 0) {
                    res.data.insignias.forEach(insignia => {
                        toast.custom((t) => (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl p-4 shadow-xl max-w-sm mx-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{insignia.icono || '🏅'}</span>
                                    <div>
                                        <p className="font-bold">¡Nueva insignia!</p>
                                        <p className="text-sm">{insignia.nombre}</p>
                                        <p className="text-xs opacity-90">{insignia.descripcion}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ), { duration: 5000 });
                    });
                }
            } catch (error) {
                console.error('Error al verificar insignias:', error);
            }
        };

        // Check inmediato y luego cada 30 segundos
        checkNewInsignias();
        const interval = setInterval(checkNewInsignias, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return null;
}
