import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getTuristaActual } from '../services/auth';

export default function MisReservas() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas');
    const navigate = useNavigate();
    const usuario = getTuristaActual();

    useEffect(() => {
        if (usuario?.id) {
            cargarReservas();
        }
    }, [usuario]);

    const cargarReservas = async () => {
        try {
            const response = await api.get(`/reservas?turista_id=${usuario?.id}`);
            setReservas(response.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoInfo = (estado) => {
        switch(estado) {
            case 'pendiente':
                return { icon: <ClockIcon className="w-5 h-5 text-yellow-500" />, text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
            case 'confirmada':
                return { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, text: 'Confirmada', color: 'bg-green-100 text-green-800' };
            case 'completada':
                return { icon: <CheckCircleIcon className="w-5 h-5 text-blue-500" />, text: 'Completada', color: 'bg-blue-100 text-blue-800' };
            case 'cancelada':
                return { icon: <XCircleIcon className="w-5 h-5 text-red-500" />, text: 'Cancelada', color: 'bg-red-100 text-red-800' };
            default:
                return { icon: <AlertCircle className="w-5 h-5 text-gray-500" />, text: estado, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const reservasFiltradas = filtro === 'todas' 
        ? reservas 
        : reservas.filter(r => r.estado === filtro);

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
                    <Calendar className="w-10 h-10" />
                    <div>
                        <h1 className="text-2xl font-bold">Mis Reservas</h1>
                        <p className="text-green-100 text-sm">Historial de tus recorridos guiados</p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 p-4 overflow-x-auto">
                {['todas', 'pendiente', 'confirmada', 'completada', 'cancelada'].map((estado) => (
                    <button
                        key={estado}
                        onClick={() => setFiltro(estado)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                            filtro === estado
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {estado === 'todas' ? 'Todas' : 
                         estado === 'pendiente' ? 'Pendientes' :
                         estado === 'confirmada' ? 'Confirmadas' :
                         estado === 'completada' ? 'Completadas' : 'Canceladas'}
                    </button>
                ))}
            </div>

            {/* Lista de reservas */}
            <div className="p-4 space-y-3">
                {reservasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        No tienes reservas {filtro !== 'todas' ? `en estado "${filtro}"` : ''}
                    </div>
                ) : (
                    reservasFiltradas.map((reserva, index) => {
                        const estadoInfo = getEstadoInfo(reserva.estado);
                        return (
                            <motion.div
                                key={reserva.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{reserva.lugar_nombre}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">{reserva.lugar_direccion || 'Concepción'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">
                                                {new Date(reserva.fecha_encuentro).toLocaleDateString()}
                                            </p>
                                            <Clock className="w-3 h-3 text-gray-400 ml-1" />
                                            <p className="text-xs text-gray-500">
                                                {new Date(reserva.fecha_encuentro).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Users className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">{reserva.numero_personas} personas</p>
                                        </div>
                                        {reserva.guia_nombre && (
                                            <p className="text-xs text-green-600 mt-2">
                                                🧙‍♂️ Guía: {reserva.guia_nombre}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estadoInfo.color}`}>
                                        {estadoInfo.icon}
                                        {estadoInfo.text}
                                    </div>
                                </div>
                                
                                {reserva.estado === 'confirmada' && (
                                    <button
                                        onClick={() => navigate(`/encuesta/${reserva.id}`)}
                                        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                    >
                                        📝 Calificar experiencia
                                    </button>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}