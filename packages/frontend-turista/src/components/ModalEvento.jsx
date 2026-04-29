// components/ModalEvento.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ModalEvento({ evento, onClose, onCompletar }) {
    const [respuesta, setRespuesta] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        await onCompletar(evento.id, respuesta);
        setCargando(false);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-md w-full p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {evento.es_temporal && '🎪 '}
                        {evento.titulo}
                    </h2>
                    <button onClick={onClose} className="text-gray-400">✕</button>
                </div>

                <p className="text-gray-600 mb-4">{evento.descripcion}</p>

                {evento.es_temporal && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4 text-sm text-purple-700">
                        ⏰ Evento temporal especial. ¡No te lo pierdas!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            {evento.pregunta || 'Responde la siguiente pregunta:'}
                        </label>
                        <input
                            type="text"
                            value={respuesta}
                            onChange={(e) => setRespuesta(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Tu respuesta..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold"
                    >
                        {cargando ? 'Completando...' : '🎯 Completar evento'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}