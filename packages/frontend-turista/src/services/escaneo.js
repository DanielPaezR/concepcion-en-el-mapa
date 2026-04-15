import api from './api';

// Registrar visita (sin código QR)
export const registrarVisita = async () => {
    try {
        const response = await api.post('/escaneos', {});
        console.log('✅ Visita registrada');
        return { success: true };
    } catch (error) {
        console.error('❌ Error al registrar visita:', error);
        return { success: false };
    }
};