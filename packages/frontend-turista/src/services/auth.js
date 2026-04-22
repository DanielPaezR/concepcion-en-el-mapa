import api from './api';

const TOKEN_KEY = 'turista_token';
const USER_KEY = 'turista_user';
const SESSION_ID_KEY = 'session_id';

// Generar o obtener session_id
const getSessionId = () => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
};

// Obtener ID único de turista (para compatibilidad)
const getTuristaId = () => {
    let id = localStorage.getItem('turista_id');
    if (!id) {
        id = 'turista_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('turista_id', id);
    }
    return id;
};

// Inicializar usuario anónimo
export const initAnonymousUser = async () => {
    try {
        const sessionId = getSessionId();
        let token = localStorage.getItem(TOKEN_KEY);
        
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return token;
        }
        
        console.log('📝 Inicializando usuario anónimo...');
        const response = await api.post('/turista/anonymous', {}, {
            headers: { 'x-session-id': sessionId }
        });
        
        token = response.data.token;
        const usuario = response.data.usuario;
        usuario.anonimo = true; // Asegurar que tenga la propiedad
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Usuario anónimo inicializado');
        return token;
    } catch (error) {
        console.error('❌ Error al inicializar usuario:', error.response?.data || error.message);
        return autenticarTurista();
    }
};

// Método antiguo (para compatibilidad)
export const autenticarTurista = async () => {
    try {
        const turistaId = getTuristaId();
        const nivelGuardado = localStorage.getItem('turista_nivel') || 1;
        
        let token = localStorage.getItem(TOKEN_KEY);
        
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return token;
        }
        
        console.log('📝 Registrando nuevo turista (método antiguo)...');
        const response = await api.post('/auth/turista/registro', {
            turista_id: turistaId,
            nombre: `Explorador_${turistaId.slice(-6)}`,
            nivel: parseInt(nivelGuardado)
        });
        
        token = response.data.token;
        const usuario = response.data.usuario;
        usuario.anonimo = true;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Turista autenticado');
        return token;
    } catch (error) {
        console.error('❌ Error al autenticar turista:', error.response?.data || error.message);
        return null;
    }
};

// Registrar usuario (convertir anónimo a registrado)
export const registerUser = async (email, nombre, password) => {
    try {
        const response = await api.post('/turista/register', { email, nombre, password });
        const usuario = response.data.usuario;
        usuario.anonimo = false; // Ya no es anónimo
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return { success: true, usuario };
    } catch (error) {
        return { success: false, error: error.response?.data?.error || 'Error al registrar' };
    }
};

// Login de usuario registrado
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/turista/login', { email, password });
        const usuario = response.data.usuario;
        usuario.anonimo = false;
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return { success: true, usuario };
    } catch (error) {
        return { success: false, error: error.response?.data?.error || 'Error al iniciar sesión' };
    }
};

export const getTuristaActual = () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Error al parsear usuario:', e);
        return null;
    }
};

export const logoutTurista = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('turista_id');
    localStorage.removeItem(SESSION_ID_KEY);
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/';
};

export const actualizarNivelTurista = (nuevoNivel) => {
    localStorage.setItem('turista_nivel', nuevoNivel);
    const user = getTuristaActual();
    if (user) {
        user.nivel = nuevoNivel;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return autenticarTurista();
};