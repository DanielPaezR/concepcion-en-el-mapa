import axios from 'axios';
import { API_URL } from '../config/runtime';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Buscar en ambas claves (unificar)
        let token = localStorage.getItem('token');
        if (!token) {
            token = localStorage.getItem('turista_token');
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Si es 401, intentar renovar autenticación
            try {
                const { autenticarTurista } = await import('./auth');
                await autenticarTurista();
                
                const config = error.config;
                let token = localStorage.getItem('token');
                if (!token) {
                    token = localStorage.getItem('turista_token');
                }
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    return api(config);
                }
            } catch (e) {
                console.error('Error al renovar autenticación:', e);
            }
        }
        return Promise.reject(error);
    }
);

export default api;