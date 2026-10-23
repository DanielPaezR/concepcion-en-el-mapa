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
        // Verificar si ya hay un token válido
        const token = localStorage.getItem('token') || localStorage.getItem('turista_token');
        
        if (token) {
            // Intentar verificar si el token sigue siendo válido
            try {
                const response = await api.get('/auth/verificar');
                if (response.data.valido) {
                    return true;
                }
            } catch (error) {
                console.log('Token inválido, intentando renovar...');
            }
        }
        
        // Si no hay token o es inválido, intentar obtener uno nuevo
        // Esto dependerá de tu lógica de autenticación
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
            const response = await api.post('/auth/refresh', {
                refreshToken
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('turista_token', response.data.token);
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
                return true;
            }
        }
        
        // Si no hay refresh token, redirigir a login
        console.log('No hay sesión válida, redirigiendo a login');
        window.location.href = '/login';
        return false;
        
    } catch (error) {
        console.error('Error en autenticarTurista:', error);
        return false;
    }
};

// Guarda la sesión que devuelven login, registro y Google
const guardarSesion = (data) => {
    const usuario = { ...data.usuario, anonimo: false };
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return usuario;
};

// Qué opciones de acceso tiene activas el servidor (Google, código por correo)
let configAuth = null;
export const getConfigAuth = async () => {
    if (!configAuth) {
        try {
            configAuth = (await api.get('/turista/config-auth')).data;
        } catch {
            configAuth = { google_client_id: null, verificacion_correo: false };
        }
    }
    return configAuth;
};

// Registrar usuario. Si el servidor tiene la verificación por correo activa,
// devuelve { requiereVerificacion: true } y la cuenta se crea al confirmar el
// código con verificarCodigo().
export const registerUser = async (email, nombre, password, telefono) => {
    try {
        const response = await api.post('/turista/register', { email, nombre, password, telefono: telefono || undefined });
        if (response.data.requiereVerificacion) {
            return { success: true, requiereVerificacion: true, email: response.data.email };
        }
        return { success: true, usuario: guardarSesion(response.data) };
    } catch (error) {
        return { success: false, error: error.response?.data?.error || 'Error al registrar' };
    }
};

export const verificarCodigo = async (email, codigo) => {
    try {
        const response = await api.post('/turista/register/verificar', { email, codigo });
        return { success: true, usuario: guardarSesion(response.data) };
    } catch (error) {
        return { success: false, error: error.response?.data?.error || 'No se pudo verificar el código', codigo: error.response?.data?.codigo };
    }
};

export const reenviarCodigo = async (email) => {
    try {
        await api.post('/turista/register/reenviar', { email });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.response?.data?.error || 'No se pudo reenviar el código' };
    }
};

// "Continuar con Google": credential es el token que entrega Google Identity Services
export const loginGoogle = async (credential) => {
    try {
        const response = await api.post('/turista/google', { credential });
        return { success: true, usuario: guardarSesion(response.data) };
    } catch (error) {
        return { success: false, error: error.response?.data?.error || 'No se pudo iniciar sesión con Google' };
    }
};

// Login de usuario registrado
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/turista/login', { email, password });
        return { success: true, usuario: guardarSesion(response.data) };
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
    // También usados por el interceptor de api.js al renovar el token
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
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