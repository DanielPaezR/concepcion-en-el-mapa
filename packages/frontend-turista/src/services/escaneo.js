import api from './api';

// Registrar visita (sin código QR)
// Visita para las métricas del superadmin (una por apertura de la app)
const dispositivo = () => {
    const ancho = window.innerWidth;
    return /Mobi|Android|iPhone/i.test(navigator.userAgent) || ancho < 640 ? 'movil' : ancho < 1024 ? 'tablet' : 'escritorio';
};

export const registrarVisita = async () => {
    api.post('/super/visita', {
        session_id: localStorage.getItem('session_id') || localStorage.getItem('turista_id'),
        ruta: window.location.pathname,
        dispositivo: dispositivo(),
    }).catch(() => { /* las métricas nunca deben romper la app */ });
    try {
        const response = await api.post('/escaneos', {});
        console.log('✅ Visita registrada');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al registrar visita:', error);
        return { success: false };
    }
};