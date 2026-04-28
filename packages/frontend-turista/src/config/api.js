import axios from 'axios';
import { API_URL } from './runtime';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('turista_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const { autenticarTurista } = await import('../services/auth');
            await autenticarTurista();
            
            const config = error.config;
            const token = localStorage.getItem('turista_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                return api(config);
            }
        }
        return Promise.reject(error);
    }
);

export default api;