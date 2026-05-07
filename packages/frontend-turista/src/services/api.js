import axios from 'axios';
import { API_URL } from '../config/runtime';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Variable para evitar múltiples intentos de renovación simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Función para obtener el token actual
const getCurrentToken = () => {
    let token = localStorage.getItem('token');
    if (!token) token = localStorage.getItem('turista_token');
    return token;
};

// Función para guardar el token
const setCurrentToken = (token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('turista_token', token);
};

// Función para limpiar tokens en logout
const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('turista_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

// Interceptor de request
api.interceptors.request.use(
    (config) => {
        // Si es FormData, no modificar Content-Type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        const token = getCurrentToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response para manejar tokens expirados
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Si no es error 401 o ya se intentó renovar, rechazar
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }
        
        // Marcar que ya se intentó renovar para esta petición
        originalRequest._retry = true;
        
        // Si ya hay un proceso de renovación en curso, encolar la petición
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
            .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }
        
        isRefreshing = true;
        
        try {
            // Intentar renovar el token usando el refresh token
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                throw new Error('No hay refresh token disponible');
            }
            
            // Llamar al endpoint de refresh
            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken
            });
            
            if (response.data.token) {
                // Guardar el nuevo token
                setCurrentToken(response.data.token);
                
                // Si también viene un nuevo refresh token, guardarlo
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
                
                // Procesar la cola de peticiones pendientes
                processQueue(null, response.data.token);
                
                // Reintentar la petición original con el nuevo token
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return api(originalRequest);
            } else {
                throw new Error('No se recibió nuevo token');
            }
            
        } catch (refreshError) {
            console.error('Error al renovar token:', refreshError);
            
            // Limpiar todos los tokens
            clearTokens();
            
            // Rechazar todas las peticiones en cola
            processQueue(refreshError, null);
            
            // Redirigir al login si no estamos ya allí
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
                
                // Mostrar mensaje de sesión expirada
                const event = new CustomEvent('sessionExpired', { 
                    detail: { message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }
                });
                window.dispatchEvent(event);
                
                // Opcional: redirigir automáticamente después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
            
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// Función auxiliar para manejar el logout manual
export const logout = () => {
    clearTokens();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};

// Función para verificar si el token es válido (opcional)
export const isTokenValid = () => {
    const token = getCurrentToken();
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convertir a milisegundos
        const now = Date.now();
        
        // Si expira en menos de 5 minutos, considerar que no es válido
        return exp - now > 5 * 60 * 1000;
    } catch (e) {
        return false;
    }
};

// Función para renovar token manualmente (si es necesario)
export const refreshTokenManually = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
        });
        
        if (response.data.token) {
            setCurrentToken(response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            return response.data.token;
        }
        throw new Error('No token received');
    } catch (error) {
        console.error('Error refreshing token manually:', error);
        logout();
        throw error;
    }
};

export default api;