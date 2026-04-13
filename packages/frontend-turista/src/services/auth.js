import api from './api';

const TOKEN_KEY = 'turista_token';
const USER_KEY = 'turista_user';

const getTuristaId = () => {
    let id = localStorage.getItem('turista_id');
    if (!id) {
        id = 'turista_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('turista_id', id);
    }
    return id;
};

export const autenticarTurista = async () => {
    try {
        const turistaId = getTuristaId();
        const nivelGuardado = localStorage.getItem('turista_nivel') || 1;
        
        let token = localStorage.getItem(TOKEN_KEY);
        
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return token;
        }
        
        console.log('📝 Registrando nuevo turista...');
        const response = await api.post('/auth/turista/registro', {
            turista_id: turistaId,
            nombre: `Explorador_${turistaId.slice(-6)}`,
            nivel: parseInt(nivelGuardado)
        });
        
        token = response.data.token;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Turista autenticado');
        return token;
    } catch (error) {
        console.error('❌ Error al autenticar turista:', error.response?.data || error.message);
        return null;
    }
};

export const getTuristaActual = () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

export const logoutTurista = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('turista_id');
    delete api.defaults.headers.common['Authorization'];
};

export const actualizarNivelTurista = (nuevoNivel) => {
    localStorage.setItem('turista_nivel', nuevoNivel);
    const user = getTuristaActual();
    if (user) {
        user.nivel = nuevoNivel;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    // También actualizar el token si es necesario (re-autenticar)
    return autenticarTurista();
};